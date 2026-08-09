import fs from "fs";
import path from "path";
import { ChatLogEntry, ChatLogData } from "./types";
import { GeneratedMap } from "./utils/mapGenerator";

const LOGS_DIR = path.join(__dirname, "..", "logs");

// สร้างโฟลเดอร์ logs ถ้ายังไม่มี
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Map roomCode -> ChatLogEntry[]
const chatLogs = new Map<string, ChatLogEntry[]>();

export function initChatLog(roomCode: string) {
  if (!chatLogs.has(roomCode)) {
    chatLogs.set(roomCode, []);
  }
}

export function addChatEntry(roomCode: string, entry: ChatLogEntry) {
  if (!chatLogs.has(roomCode)) {
    chatLogs.set(roomCode, []);
  }
  chatLogs.get(roomCode)?.push(entry);
}

export function saveChatLog(
  roomCode: string,
  playerNames: string[],
  gameMetrics?: {
    result: string;
    timeUsed: number;
    blocksUsed: number;
  },
  mapData?: GeneratedMap
) {
  const logs = chatLogs.get(roomCode);
  if (!logs || logs.length === 0) return;

  const playerMessages = logs.filter((log) => log.sender !== "[SYSTEM]");
  const chatCharCount = playerMessages.reduce((sum, log) => sum + (log.text ? log.text.replace(/\s/g, "").length : 0), 0);

  const logData: ChatLogData = {
    roomCode,
    players: playerNames,
    mapData: mapData && mapData.map ? { map: mapData.map } : undefined,
    startedAt: logs[0]?.timestamp || new Date().toISOString(),
    endedAt: new Date().toISOString(),
    gameMetrics: gameMetrics ? {
      result: gameMetrics.result,
      "timeUsed(seconds)": gameMetrics.timeUsed,
      "blocksUsed(blocks)": gameMetrics.blocksUsed,
      chatCharCount,
    } : undefined,
    messages: logs,
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `chat_${roomCode}_${timestamp}.json`;
  const filePath = path.join(LOGS_DIR, fileName);

  fs.writeFileSync(filePath, JSON.stringify(logData, null, 2), "utf-8");
  console.log(`Chat log saved: ${fileName} (${logs.length} messages)`);

  chatLogs.delete(roomCode);
}

export function deleteChatLog(roomCode: string) {
  chatLogs.delete(roomCode);
}

export function getAllLogs() {
  const files = fs.readdirSync(LOGS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    const data = JSON.parse(fs.readFileSync(path.join(LOGS_DIR, f), "utf-8"));
    return { fileName: f, ...data };
  });
}

export function getLogByFileName(fileName: string) {
  const filePath = path.join(LOGS_DIR, fileName);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
