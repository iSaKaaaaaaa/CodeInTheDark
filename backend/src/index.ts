import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import routes from "./routes";
import authRoutes from "./routes/auth";
import { registerSocketHandlers } from "./socketHandlers";

// โหลดค่า Environment Variables และเชื่อมต่อฐานข้อมูล MongoDB
dotenv.config();
connectDB();

const app = express();

// กำหนด CORS Middleware ให้รองรับ Cross-Origin Request และ Credentials
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// กำหนดเส้นทาง REST API สำหรับระบบ Authentication และ Game Logs
app.use("/api/auth", authRoutes);
app.use(routes);

// สร้าง HTTP Server และ Socket.IO Server สำหรับการสื่อสารแบบ Real-time
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

// ลงทะเบียน Socket.IO Event Handlers สำหรับจัดการห้องและการเล่นเกม
registerSocketHandlers(io);

// เริ่มต้นการทำงานของเซิร์ฟเวอร์บนพอร์ตที่กำหนด
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
