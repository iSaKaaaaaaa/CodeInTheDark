import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Map roomCode -> Set of socket IDs
const rooms = new Map<string, Set<string>>();

// Map socketId -> { roomCode, role, username }
const users = new Map<string, { roomCode: string; role: string; username: string }>();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", ({ roomCode, role, username }) => {
    if (role === "navigator" && !rooms.has(roomCode)) {
      socket.emit("join_error", "Room not found or invalid code.");
      return;
    }

    socket.join(roomCode);
    users.set(socket.id, { roomCode, role, username });

    if (!rooms.has(roomCode)) {
      rooms.set(roomCode, new Set());
    }
    rooms.get(roomCode)!.add(socket.id);

    console.log(`User ${username} (${socket.id}) joined room ${roomCode} as ${role}`);
    
    // Notify others in the room
    socket.to(roomCode).emit("user_joined", { username, role });

    // Send updated user list to everyone in the room
    const usersInRoom = Array.from(rooms.get(roomCode)!).map(id => users.get(id));
    io.to(roomCode).emit("room_users", usersInRoom);
  });

  socket.on("chat_message", ({ text, sender }) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.roomCode).emit("chat_message", { text, sender });
    }
  });

  socket.on("start_game", (mapIndex) => {
    const user = users.get(socket.id);
    if (user) {
      // Broadcast to everyone else in the room
      socket.to(user.roomCode).emit("start_game", mapIndex);
    }
  });

  socket.on("sync_game_state", (state) => {
    const user = users.get(socket.id);
    if (user) {
      // Broadcast to everyone else in the room (Navigator)
      socket.to(user.roomCode).emit("sync_game_state", state);
    }
  });

  socket.on("sync_blockly", (workspaceXml) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.roomCode).emit("sync_blockly", workspaceXml);
    }
  });

  socket.on("highlight_block", (blockId) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.roomCode).emit("highlight_block", blockId);
    }
  });

  socket.on("trigger_role_swap", (data) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.roomCode).emit("role_swap", data);
    }
  });

  socket.on("return_to_lobby", () => {
    const user = users.get(socket.id);
    if (user) {
      io.to(user.roomCode).emit("return_to_lobby");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const user = users.get(socket.id);
    if (user) {
      const roomUsers = rooms.get(user.roomCode);
      if (roomUsers) {
        roomUsers.delete(socket.id);
        if (roomUsers.size === 0) {
          rooms.delete(user.roomCode);
        } else {
          socket.to(user.roomCode).emit("user_left", { username: user.username, role: user.role });
          const usersInRoom = Array.from(roomUsers).map(id => users.get(id));
          io.to(user.roomCode).emit("room_users", usersInRoom);
        }
      }
      users.delete(socket.id);
    }
  });
});

app.get("/", (_, res) => {
  res.send("Server running");
});

server.listen(3000, () => {
  console.log("Server started on port 3000");
});