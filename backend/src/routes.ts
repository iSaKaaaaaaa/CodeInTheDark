import { Router } from "express";
import { getAllLogs, getLogByFileName } from "./chatLog";

const router = Router();

router.get("/", (_, res) => {
  res.send("Server running");
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
