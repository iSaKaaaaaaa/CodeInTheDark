import { Router } from "express";
import { getAllLogs, getLogByFileName } from "./chatLog";
import { getPublicRooms } from "./roomManager";

const router = Router();

// Health check endpoint
router.get("/", (_, res) => {
  res.send("Server running");
});

// รายชื่อห้องสาธารณะที่เปิดให้ผู้เล่นอื่นเข้าร่วมได้
router.get("/api/rooms/public", (_, res) => {
  res.json(getPublicRooms());
});

// ดึงประวัติ Match Logs ทั้งหมดจากฐานข้อมูล
router.get("/api/logs", async (_, res) => {
  try {
    const logs = await getAllLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch logs" });
  }
});

// ดึงประวัติ Log เฉพาะไฟล์ (Deprecated)
router.get("/api/logs/:fileName", (req, res) => {
  const data = getLogByFileName(req.params.fileName);
  if (!data) {
    res.status(404).json({ error: "Log not found" });
    return;
  }
  res.json(data);
});

export default router;
