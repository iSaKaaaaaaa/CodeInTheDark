import { Server, Socket } from "socket.io";
import { ChatLogEntry } from "./types";
import {
  addUserToRoom, removeUserFromRoom, getUser,
  hasRoom, getPlayerNamesInRoom, getUserListForRoom, isRoomEmpty,
} from "./roomManager";
import {
  initChatLog, addChatEntry, saveChatLog, deleteChatLog,
} from "./chatLog";

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

    socket.on("start_game", (mapIndex) => {
      const user = getUser(socket.id);
      if (user) {
        socket.to(user.roomCode).emit("start_game", mapIndex);
      }
    });

    socket.on("end_game", ({ result }: { result: string }) => {
      const user = getUser(socket.id);
      if (user) {
        const entry: ChatLogEntry = {
          sender: "[SYSTEM]",
          text: `Game ended: ${result}`,
          timestamp: new Date().toISOString(),
        };
        addChatEntry(user.roomCode, entry);
        saveChatLog(user.roomCode, getPlayerNamesInRoom(user.roomCode));
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

    socket.on("return_to_lobby", () => {
      const user = getUser(socket.id);
      if (user) {
        saveChatLog(user.roomCode, getPlayerNamesInRoom(user.roomCode));
        io.to(user.roomCode).emit("return_to_lobby");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const user = removeUserFromRoom(socket.id);
      if (user) {
        if (isRoomEmpty(user.roomCode)) {
          saveChatLog(user.roomCode, []);
          deleteChatLog(user.roomCode);
        } else {
          socket.to(user.roomCode).emit("user_left", { username: user.username, role: user.role });
          const usersInRoom = getUserListForRoom(user.roomCode);
          io.to(user.roomCode).emit("room_users", usersInRoom);
        }
      }
    });
  });
}
