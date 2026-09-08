import mongoose from "mongoose";
import { ChatLogEntry, RunAttempt } from "./types";
import { GeneratedMap } from "./utils/mapGenerator";
import { User } from "./models/User";
import { MapModel } from "./models/Map";
import { GameSession } from "./models/GameSession";
import { MatchLog } from "./models/MatchLog";
import { EconomyLog } from "./models/EconomyLog";

// Map roomCode -> ChatLogEntry[]
const chatLogs = new Map<string, ChatLogEntry[]>();
// Map roomCode -> RunAttempt[]
const runAttemptsMap = new Map<string, RunAttempt[]>();

export function initChatLog(roomCode: string) {
  if (!chatLogs.has(roomCode)) {
    chatLogs.set(roomCode, []);
  }
  if (!runAttemptsMap.has(roomCode)) {
    runAttemptsMap.set(roomCode, []);
  }
}

export function addRunAttempt(roomCode: string, attempt: RunAttempt) {
  if (!runAttemptsMap.has(roomCode)) {
    runAttemptsMap.set(roomCode, []);
  }
  runAttemptsMap.get(roomCode)?.push(attempt);
}

export function addChatEntry(roomCode: string, entry: ChatLogEntry) {
  if (!chatLogs.has(roomCode)) {
    chatLogs.set(roomCode, []);
  }
  chatLogs.get(roomCode)?.push(entry);
}

export async function saveChatLog(
  roomCode: string,
  playerNames: string[],
  gameMetrics?: {
    result: 'win' | 'lose';
    timeUsed: number;
    blocksUsed: number;
  },
  mapData?: GeneratedMap
) {
  const logs = chatLogs.get(roomCode) || [];
  const attempts = runAttemptsMap.get(roomCode) || [];

  // Only save if there was a game result and valid map
  if (!gameMetrics || !mapData || !mapData.seed) {
    chatLogs.delete(roomCode);
    runAttemptsMap.delete(roomCode);
    return;
  }

  try {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // 1. Resolve host and joiner users
      const users = await User.find({ username: { $in: playerNames } }).session(session);
      // Fallback if players left or weren't found
      if (users.length === 0) throw new Error("No players found");

      // Randomly assign host and joiner if we can't tell, or ideally we'd know from role
      const hostId = users[0]._id;
      const joinerId = users.length > 1 ? users[1]._id : users[0]._id;

      // 2. UPSERT Maps
      const isSuccess = gameMetrics.result === 'win';
      await MapModel.findByIdAndUpdate(
        String(mapData.seed),
        { 
          $inc: { timesPlayed: 1, timesCleared: isSuccess ? 1 : 0 },
          $setOnInsert: { seed: mapData.seed }
        },
        { upsert: true, session }
      );

      // 3. Count Block Usage
      const blockUsageLog: Record<string, number> = {};
      attempts.forEach(attempt => {
        attempt.blocks.forEach(block => {
          blockUsageLog[block] = (blockUsageLog[block] || 0) + 1;
        });
      });

      const playerMessages = logs.filter((log) => log.sender !== "[SYSTEM]");
      const chatCharCount = playerMessages.reduce((sum, log) => sum + (log.text ? log.text.replace(/\s/g, "").length : 0), 0);
      const startedAtStr = logs.length > 0 ? logs[0].timestamp : new Date().toISOString();

      // 4. INSERT GameSessions
      const newSession = await GameSession.create([{
        roomCode,
        hostId,
        joinerId,
        mapSeed: String(mapData.seed),
        result: gameMetrics.result,
        timeUsedSeconds: gameMetrics.timeUsed,
        blocksUsedCount: gameMetrics.blocksUsed,
        blockUsageLog,
        chatCharCount,
        startedAt: new Date(startedAtStr),
        endedAt: new Date()
      }], { session });

      const sessionId = newSession[0]._id;

      // 5. INSERT MatchLogs
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

      // 6. UPDATE Users and INSERT EconomyLogs
      for (const user of users) {
        // Increment games
        user.totalGames += 1;
        let reward = 0;
        let reason = "";

        if (isSuccess) {
          user.totalWins += 1;
          reward = 50; // Example reward
          reason = "win_reward";
        } else {
          reward = 10; // Consolation
          reason = "play_reward";
        }

        user.coins += reward;
        user.walletVersion += 1;

        await user.save({ session });

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
  } catch (err) {
    console.error("Failed to save game session to MongoDB:", err);
  } finally {
    chatLogs.delete(roomCode);
    runAttemptsMap.delete(roomCode);
  }
}

export function deleteChatLog(roomCode: string) {
  chatLogs.delete(roomCode);
  runAttemptsMap.delete(roomCode);
}

export async function getAllLogs() {
  return await MatchLog.find().populate('sessionId').lean();
}

export async function getLogByFileName(fileName: string) {
  // Deprecated, use ID instead
  return null;
}
