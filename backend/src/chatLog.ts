import mongoose from "mongoose";
import { ChatLogEntry, RunAttempt } from "./types";
import { GeneratedMap } from "./utils/mapGenerator";
import { User } from "./models/User";
import { MapModel } from "./models/Map";
import { GameSession } from "./models/GameSession";
import { MatchLog } from "./models/MatchLog";
import { EconomyLog } from "./models/EconomyLog";

// จัดเก็บประวัติข้อความแชตในหน่วยความจำชั่วคราว แยกตาม roomCode
const chatLogs = new Map<string, ChatLogEntry[]>();

// จัดเก็บประวัติการรันบล็อกคำสั่งในหน่วยความจำชั่วคราว แยกตาม roomCode
const runAttemptsMap = new Map<string, RunAttempt[]>();

/** กำหนดค่าเริ่มต้นของระบบบันทึกข้อความและคำสั่งสำหรับห้องใหม่ */
export function initChatLog(roomCode: string) {
  if (!chatLogs.has(roomCode)) {
    chatLogs.set(roomCode, []);
  }
  if (!runAttemptsMap.has(roomCode)) {
    runAttemptsMap.set(roomCode, []);
  }
}

/** บันทึกประวัติการรันบล็อกคำสั่งของห้อง */
export function addRunAttempt(roomCode: string, attempt: RunAttempt) {
  if (!runAttemptsMap.has(roomCode)) {
    runAttemptsMap.set(roomCode, []);
  }
  runAttemptsMap.get(roomCode)?.push(attempt);
}

/** บันทึกข้อความแชตใหม่เข้าสู่ประวัติห้อง */
export function addChatEntry(roomCode: string, entry: ChatLogEntry) {
  if (!chatLogs.has(roomCode)) {
    chatLogs.set(roomCode, []);
  }
  chatLogs.get(roomCode)?.push(entry);
}

/**
 * บันทึกสรุปผลการแข่งขันลงฐานข้อมูล MongoDB แบบ Multi-Document Transaction:
 * 1. ตรวจสอบข้อมูลผู้เล่น Host และ Joiner
 * 2. อัปเดตสถิติแผนที่ (Maps Collection)
 * 3. บันทึกสถิติเซสชันเกม (GameSessions Collection)
 * 4. บันทึกประวัติการแชตและคำสั่ง (MatchLogs Collection)
 * 5. ปรับปรุงเหรียญผู้เล่น (Users) และบันทึกประวัติการเงิน (EconomyLogs)
 */
export async function saveChatLog(
  roomCode: string,
  playerNames: string[],
  gameMetrics?: {
    result: 'win' | 'lose';
    timeUsed: number;
    blocksUsed: number;
    failReason?: string;
  },
  mapData?: GeneratedMap
): Promise<Map<string, number> | null> {
  const logs = chatLogs.get(roomCode) || [];
  const attempts = runAttemptsMap.get(roomCode) || [];

  // บันทึกเฉพาะเมื่อมีผลการแข่งขันและ Seed แผนที่ที่ถูกต้อง
  if (!gameMetrics || !mapData || !mapData.seed) {
    chatLogs.delete(roomCode);
    runAttemptsMap.delete(roomCode);
    return null;
  }

  const updatedCoins = new Map<string, number>();

  try {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // 1. ค้นหาผู้เล่นในห้องจากฐานข้อมูล
      const users = await User.find({ username: { $in: playerNames } }).session(session);
      if (users.length === 0) throw new Error("No players found");

      const hostId = users[0]._id;
      const joinerId = users.length > 1 ? users[1]._id : users[0]._id;

      // 2. ปรับปรุงสถิติการเล่นของแผนที่ (UPSERT)
      const isSuccess = gameMetrics.result === 'win';
      await MapModel.findByIdAndUpdate(
        String(mapData.seed),
        {
          $inc: { timesPlayed: 1, timesCleared: isSuccess ? 1 : 0 },
          $setOnInsert: { seed: mapData.seed }
        },
        { upsert: true, session }
      );

      // 3. สรุปความถี่การใช้งานแต่ละบล็อกคำสั่ง
      const blockUsageLog: Record<string, number> = {};
      attempts.forEach(attempt => {
        attempt.blocks.forEach(block => {
          blockUsageLog[block] = (blockUsageLog[block] || 0) + 1;
        });
      });

      const playerMessages = logs.filter((log) => log.sender !== "[SYSTEM]");
      const chatCharCount = playerMessages.reduce((sum, log) => sum + (log.text ? log.text.replace(/\s/g, "").length : 0), 0);
      const startedAtStr = logs.length > 0 ? logs[0].timestamp : new Date().toISOString();

      // 4. สร้างเอกสาร GameSession บันทึกสถิติรอบการเล่น
      const newSession = await GameSession.create([{
        roomCode,
        hostId,
        joinerId,
        mapSeed: String(mapData.seed),
        result: gameMetrics.result,
        failReason: gameMetrics.failReason || undefined,
        timeUsedSeconds: gameMetrics.timeUsed,
        blocksUsedCount: gameMetrics.blocksUsed,
        blockUsageLog,
        chatCharCount,
        startedAt: new Date(startedAtStr),
        endedAt: new Date()
      }], { session });

      const sessionId = newSession[0]._id;

      // 5. สร้างเอกสาร MatchLog บันทึกแชตและประวัติการรัน (มี TTL หมดอายุใน 90 วัน)
      await MatchLog.create([{
        sessionId,
        messages: logs.map(l => ({ sender: l.sender, text: l.text, timestamp: l.timestamp })),
        runAttempts: attempts.map(a => ({
          attemptNumber: a.attemptNumber || 1,
          blocks: a.blocks,
          success: a.success || false,
          failReason: a.failReason || null,
          timestamp: a.timestamp
        })),
      }], { session });

      // 6. อัปเดตสถิติผู้เล่น มอบเหรียญรางวัล และบันทึกประวัติธุรกรรม
      for (const user of users) {
        user.totalGames += 1;
        let reward = 0;
        let reason = "";

        if (isSuccess) {
          user.totalWins += 1;
          reward = 50; // ชนะเกมได้รับ +50 Coins
          reason = "win_reward";
        } else {
          reward = 10; // แพ้เกมได้รับ +10 Coins
          reason = "play_reward";
        }

        user.coins += reward;
        user.walletVersion += 1;

        await user.save({ session });

        if (user.username) {
          updatedCoins.set(user.username, user.coins);
        }

        await EconomyLog.create([{
          userId: user._id,
          amount: reward,
          currency: "coins",
          reason,
          referenceId: String(sessionId)
        }], { session });
      }
    });
    session.endSession();
    console.log(`Saved GameSession for room ${roomCode} successfully!`);
    return updatedCoins;
  } catch (err) {
    console.error("Failed to save game session to MongoDB:", err);
    return null;
  } finally {
    chatLogs.delete(roomCode);
    runAttemptsMap.delete(roomCode);
  }
}

/** ล้างข้อมูลประวัติห้องออกจากหน่วยความจำ */
export function deleteChatLog(roomCode: string) {
  chatLogs.delete(roomCode);
  runAttemptsMap.delete(roomCode);
}

/** รีเซ็ตประวัติข้อความและคำสั่งในห้องสำหรับเริ่มเกมรอบใหม่ */
export function reinitChatLog(roomCode: string) {
  chatLogs.set(roomCode, []);
  runAttemptsMap.set(roomCode, []);
}

/** นับจำนวนรอบที่กดรันคำสั่งทั้งหมดในห้อง */
export function getRunAttemptCount(roomCode: string): number {
  return runAttemptsMap.get(roomCode)?.length || 0;
}

/** ดึงข้อมูล MatchLog ทั้งหมดพร้อม Populate ข้อมูล Session */
export async function getAllLogs() {
  return await MatchLog.find().populate('sessionId').lean();
}

/** ดึงข้อมูล Log ตามชื่อไฟล์ (Deprecated: ใช้งานผ่าน MongoDB ID แทน) */
export async function getLogByFileName(fileName: string) {
  return null;
}
