import { Router } from "express";
import { getAllLogs, getLogByFileName } from "./chatLog";
import { getPublicRooms } from "./roomManager";

const router = Router();

router.get("/", (_, res) => {
  res.send("Server running");
});

// Public rooms waiting for a second player (private rooms are never listed)
router.get("/api/rooms/public", (_, res) => {
  res.json(getPublicRooms());
});

// API ดู chat logs ทั้งหมด
router.get("/api/logs", (_, res) => {
  res.json(getAllLogs());
});

// API ดู chat log เฉพาะไฟล์
router.get("/api/logs/:fileName", (req, res) => {
  const data = getLogByFileName(req.params.fileName);
  if (!data) {
    res.status(404).json({ error: "Log not found" });
    return;
  }
  res.json(data);
});

export default router;
