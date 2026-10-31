/** บันทึกข้อความแชตรายข้อความ */
export interface ChatLogEntry {
  sender: string;
  text: string;
  timestamp: string;
}

/** ข้อมูลผู้เล่นและบทบาทภายในห้อง */
export interface UserInfo {
  roomCode: string;
  role: string;
  username: string;
}

/** ประวัติการกดรันบล็อกคำสั่งในแต่ละรอบ */
export interface RunAttempt {
  timestamp: string;
  blocks: string[];
  attemptNumber?: number;
  success?: boolean;
  failReason?: string | null;
}

/** โครงสร้างข้อมูลสรุปผลการแข่งขันและประวัติการเล่น (Match Log) */
export interface ChatLogData {
  roomCode: string;
  players: string[];
  mapData?: {
    map: string[];
  };
  startedAt: string;
  endedAt: string;
  gameMetrics?: {
    result: string;
    "timeUsed(seconds)": number;
    "blocksUsed(blocks)": number;
    chatCharCount: number;
  };
  runAttempts?: RunAttempt[];
  messages: ChatLogEntry[];
}
