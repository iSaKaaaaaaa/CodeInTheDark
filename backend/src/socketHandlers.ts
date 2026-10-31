import { Server, Socket } from "socket.io";
import { ChatLogEntry } from "./types";
import {
  addUserToRoom, removeUserFromRoom, getUser,
  hasRoom, getPlayerNamesInRoom, getUserListForRoom, isRoomEmpty, getRoomUsers,
  createRoomMeta, getRoomMeta, setRoomPublic, setRoomStarted, isRoomFull
} from "./roomManager";
import {
  initChatLog, addChatEntry, saveChatLog, deleteChatLog, addRunAttempt, reinitChatLog, getRunAttemptCount
} from "./chatLog";
import { generateMap, GeneratedMap } from "./utils/mapGenerator";

const roomMaps = new Map<string, GeneratedMap>();

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // จัดการคำขอเข้าร่วมห้อง หรือสร้างห้องใหม่
    socket.on("join_room", ({ roomCode, role, username }) => {
      if (role === "navigator" && !hasRoom(roomCode)) {
        socket.emit("join_error", "Room not found or invalid code.");
        return;
      }
      if (role === "navigator" && isRoomFull(roomCode)) {
        socket.emit("join_error", "Room is full.");
        return;
      }

      const isNewRoom = !hasRoom(roomCode);
      socket.join(roomCode);
      addUserToRoom(socket.id, { roomCode, role, username });
      if (isNewRoom) createRoomMeta(roomCode, socket.id, username);
      initChatLog(roomCode);

      console.log(`User ${username} (${socket.id}) joined room ${roomCode} as ${role}`);

      socket.to(roomCode).emit("user_joined", { username, role });

      const usersInRoom = getUserListForRoom(roomCode);
      io.to(roomCode).emit("room_users", usersInRoom);
      socket.emit("room_visibility", { isPublic: getRoomMeta(roomCode)?.isPublic ?? false });

      if (roomMaps.has(roomCode)) {
        socket.emit("start_game", roomMaps.get(roomCode));
      }
    });

    // สลับสถานะห้องสาธารณะ/ส่วนตัว (อนุญาตเฉพาะ Host)
    socket.on("set_room_visibility", ({ isPublic }: { isPublic: boolean }) => {
      const user = getUser(socket.id);
      if (!user) return;
      const result = setRoomPublic(user.roomCode, socket.id, !!isPublic);
      if (result !== null) {
        io.to(user.roomCode).emit("room_visibility", { isPublic: result });
      }
    });

    // ส่งต่อข้อความแชตระหว่างผู้เล่นในห้องและบันทึกลงหน่วยความจำ
    socket.on("chat_message", ({ text, sender }) => {
      const user = getUser(socket.id);
      if (user) {
        const entry: ChatLogEntry = {
          sender,
          text,
          timestamp: new Date().toISOString(),
        };
        addChatEntry(user.roomCode, entry);
        socket.to(user.roomCode).emit("chat_message", { text, sender });
      }
    });

    // เริ่มต้นเกม สุ่มสร้างแผนที่เขาวงกต 15x15 และกระจายข้อมูลไปยังผู้เล่นทั้งสองฝ่าย
    socket.on("start_game", () => {
      const user = getUser(socket.id);
      if (user) {
        const mapData = generateMap(15, 15);
        roomMaps.set(user.roomCode, mapData);
        setRoomStarted(user.roomCode, true);
        io.to(user.roomCode).emit("start_game", mapData);
      }
    });

    // บันทึกผลการกดรันโปรแกรมบล็อกแต่ละรอบ
    socket.on("run_result", (data: { blocks: string[]; success: boolean; failReason: string | null }) => {
      const user = getUser(socket.id);
      if (user) {
        addRunAttempt(user.roomCode, {
          timestamp: new Date().toISOString(),
          blocks: data.blocks,
          attemptNumber: getRunAttemptCount(user.roomCode) + 1,
          success: data.success,
          failReason: data.failReason,
        });
      }
    });

    // จัดการเมื่อเกมจบ บันทึกข้อมูลลงฐานข้อมูลผ่าน Transaction และมอบเหรียญรางวัล
    socket.on("end_game", async (data: { result: string; timeUsed?: number; blocksUsed?: number }) => {
      const user = getUser(socket.id);
      if (user) {
        const entry: ChatLogEntry = {
          sender: "[SYSTEM]",
          text: `Game ended: ${data.result}`,
          timestamp: new Date().toISOString(),
        };
        addChatEntry(user.roomCode, entry);

        // จัดกลุ่มผลลัพธ์เป็น win หรือ lose
        const normalizedResult: 'win' | 'lose' = data.result === 'win' ? 'win' : 'lose';

        // แยกสาเหตุการแพ้ (เวลาหมด หรือบล็อกหมด)
        let failReason: string | undefined;
        if (data.result === 'lose_time') failReason = 'time';
        else if (data.result === 'lose_blocks') failReason = 'blocks';

        let gameMetrics;
        if (data.timeUsed !== undefined && data.blocksUsed !== undefined) {
          gameMetrics = {
            result: normalizedResult,
            timeUsed: data.timeUsed,
            blocksUsed: data.blocksUsed,
            failReason,
          };
        }

        const updatedCoins = await saveChatLog(user.roomCode, getPlayerNamesInRoom(user.roomCode), gameMetrics, roomMaps.get(user.roomCode));

        // ส่งอัปเดตเหรียญไปยังผู้เล่นแต่ละคนในห้อง
        if (updatedCoins) {
          const roomUserIds = getRoomUsers(user.roomCode);
          if (roomUserIds) {
            for (const socketId of roomUserIds) {
              const u = getUser(socketId);
              if (u && updatedCoins.has(u.username)) {
                io.to(socketId).emit("coins_updated", { coins: updatedCoins.get(u.username) });
              }
            }
          }
        }

        io.to(user.roomCode).emit("chat_log_saved");
      }
    });

    // ซิงค์สถานะเกมและตำแหน่งตัวละครแบบ Real-time
    socket.on("sync_game_state", (state) => {
      const user = getUser(socket.id);
      if (user) {
        socket.to(user.roomCode).emit("sync_game_state", state);
      }
    });

    // ซิงค์ผังบล็อกคำสั่ง (XML) จาก Driver ไปยัง Navigator
    socket.on("sync_blockly", (workspaceXml) => {
      const user = getUser(socket.id);
      if (user) {
        socket.to(user.roomCode).emit("sync_blockly", workspaceXml);
      }
    });

    // ซิงค์การไฮไลต์บล็อกที่กำลังประมวลผล
    socket.on("highlight_block", (blockId) => {
      const user = getUser(socket.id);
      if (user) {
        socket.to(user.roomCode).emit("highlight_block", blockId);
      }
    });

    // สลับบทบาทระหว่าง Driver และ Navigator
    socket.on("trigger_role_swap", (data) => {
      const user = getUser(socket.id);
      if (user) {
        socket.to(user.roomCode).emit("role_swap", data);
      }
    });

    // ล้างกล่องข้อความแชตสำหรับทุกคนในห้อง
    socket.on("reset_chat", () => {
      const user = getUser(socket.id);
      if (user) {
        io.to(user.roomCode).emit("reset_chat");
      }
    });

    // ผู้เล่นขอย้อนกลับไปหน้าล็อบบี้
    socket.on("return_to_lobby", () => {
      const user = getUser(socket.id);
      if (user) {
        saveChatLog(user.roomCode, getPlayerNamesInRoom(user.roomCode), undefined, roomMaps.get(user.roomCode));
        roomMaps.delete(user.roomCode);
        setRoomStarted(user.roomCode, false);
        io.to(user.roomCode).emit("return_to_lobby");
        io.to(user.roomCode).emit("room_visibility", { isPublic: getRoomMeta(user.roomCode)?.isPublic ?? false });
      }
    });

    // รีเซ็ตประวัติ Log เมื่อเริ่มเกมรอบใหม่
    socket.on("reset_game", () => {
      const user = getUser(socket.id);
      if (user) {
        reinitChatLog(user.roomCode);
      }
    });

    // ส่งข้อความแจ้งเตือนเมื่อตัวละครชนสิ่งกีดขวาง (กำแพง, หิน, หนาม, หลุมพราง)
    socket.on("obstacle_hit", ({ type, x, y, playerName }: { type: string; x: number; y: number; playerName: string }) => {
      const user = getUser(socket.id);
      if (user) {
        const messages: Record<string, string> = {
          wall: `${playerName} hit a wall at (${x},${y}) → Program Stop`,
          rock: `${playerName} hit a rock at (${x},${y}) → Program Stop`,
          spike: `${playerName} hit a spike at (${x},${y}) → Bounced back 1 spaces`,
          trap: `${playerName} fell in a trap at (${x},${y}) → Back to start`,
        };
        const text = messages[type] || `${playerName} hit an obstacle at (${x},${y})`;
        const entry: ChatLogEntry = {
          sender: "[SYSTEM]",
          text,
          timestamp: new Date().toISOString(),
        };
        addChatEntry(user.roomCode, entry);
        io.to(user.roomCode).emit("chat_message", { sender: "[SYSTEM]", text });
      }
    });

    // จัดการเมื่อการเชื่อมต่อ Socket หลุด
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const user = removeUserFromRoom(socket.id);
      if (user) {
        if (isRoomEmpty(user.roomCode)) {
          saveChatLog(user.roomCode, [], undefined, roomMaps.get(user.roomCode));
          deleteChatLog(user.roomCode);
          roomMaps.delete(user.roomCode);
        } else {
          // แจ้งเตือนผู้เล่นอีกคนที่ยังอยู่ในห้องว่าคู่หูหลุด และปิดห้องเนื่องจากต้องใช้ผู้เล่น 2 คน
          io.to(user.roomCode).emit("room_destroyed", { reason: "Your partner has disconnected." });

          // ล้างทรัพยากรห้องที่เหลือ
          const remainingUsers = getRoomUsers(user.roomCode);
          if (remainingUsers) {
            for (const socketId of remainingUsers) {
              const s = io.sockets.sockets.get(socketId);
              if (s) {
                s.leave(user.roomCode);
                removeUserFromRoom(socketId);
              }
            }
          }
          deleteChatLog(user.roomCode);
          roomMaps.delete(user.roomCode);
        }
      }
    });
  });
}
