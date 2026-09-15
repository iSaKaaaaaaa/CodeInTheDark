import { Server, Socket } from "socket.io";
import { ChatLogEntry } from "./types";
import {
  addUserToRoom, removeUserFromRoom, getUser,
  hasRoom, getPlayerNamesInRoom, getUserListForRoom, isRoomEmpty, getRoomUsers
} from "./roomManager";
import {
  initChatLog, addChatEntry, saveChatLog, deleteChatLog, addRunAttempt, reinitChatLog, getRunAttemptCount
} from "./chatLog";
import { generateMap, GeneratedMap } from "./utils/mapGenerator";

const roomMaps = new Map<string, GeneratedMap>();

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", ({ roomCode, role, username }) => {
      if (role === "navigator" && !hasRoom(roomCode)) {
        socket.emit("join_error", "Room not found or invalid code.");
        return;
      }

      socket.join(roomCode);
      addUserToRoom(socket.id, { roomCode, role, username });
      initChatLog(roomCode);

      console.log(`User ${username} (${socket.id}) joined room ${roomCode} as ${role}`);

      socket.to(roomCode).emit("user_joined", { username, role });

      const usersInRoom = getUserListForRoom(roomCode);
      io.to(roomCode).emit("room_users", usersInRoom);

      if (roomMaps.has(roomCode)) {
        socket.emit("start_game", roomMaps.get(roomCode));
      }
    });

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

    socket.on("start_game", () => {
      const user = getUser(socket.id);
      if (user) {
        const mapData = generateMap(15, 15);
        roomMaps.set(user.roomCode, mapData);
        io.to(user.roomCode).emit("start_game", mapData);
      }
    });

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

    socket.on("end_game", async (data: { result: string; timeUsed?: number; blocksUsed?: number }) => {
      const user = getUser(socket.id);
      if (user) {
        const entry: ChatLogEntry = {
          sender: "[SYSTEM]",
          text: `Game ended: ${data.result}`,
          timestamp: new Date().toISOString(),
        };
        addChatEntry(user.roomCode, entry);

        // Normalize result: anything not 'win' becomes 'lose'
        const normalizedResult: 'win' | 'lose' = data.result === 'win' ? 'win' : 'lose';
        
        // Extract fail reason from result string
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
        
        // Emit updated coins to each player in the room
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

    socket.on("sync_game_state", (state) => {
      const user = getUser(socket.id);
      if (user) {
        socket.to(user.roomCode).emit("sync_game_state", state);
      }
    });

    socket.on("sync_blockly", (workspaceXml) => {
      const user = getUser(socket.id);
      if (user) {
        socket.to(user.roomCode).emit("sync_blockly", workspaceXml);
      }
    });

    socket.on("highlight_block", (blockId) => {
      const user = getUser(socket.id);
      if (user) {
        socket.to(user.roomCode).emit("highlight_block", blockId);
      }
    });

    socket.on("trigger_role_swap", (data) => {
      const user = getUser(socket.id);
      if (user) {
        socket.to(user.roomCode).emit("role_swap", data);
      }
    });

    // รีเซ็ต chat ทั้งห้อง (รวมตัวส่งเอง)
    socket.on("reset_chat", () => {
      const user = getUser(socket.id);
      if (user) {
        io.to(user.roomCode).emit("reset_chat");
      }
    });

    socket.on("return_to_lobby", () => {
      const user = getUser(socket.id);
      if (user) {
        saveChatLog(user.roomCode, getPlayerNamesInRoom(user.roomCode), undefined, roomMaps.get(user.roomCode));
        roomMaps.delete(user.roomCode);
        io.to(user.roomCode).emit("return_to_lobby");
      }
    });

    socket.on("reset_game", () => {
      const user = getUser(socket.id);
      if (user) {
        reinitChatLog(user.roomCode);
      }
    });

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

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const user = removeUserFromRoom(socket.id);
      if (user) {
        if (isRoomEmpty(user.roomCode)) {
          saveChatLog(user.roomCode, [], undefined, roomMaps.get(user.roomCode));
          deleteChatLog(user.roomCode);
          roomMaps.delete(user.roomCode);
        } else {
          // Partner is still in the room — destroy room since game requires 2 players
          io.to(user.roomCode).emit("room_destroyed", { reason: "Your partner has disconnected." });
          
          // Clean up room resources
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
