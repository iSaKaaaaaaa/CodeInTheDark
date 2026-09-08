export interface ChatLogEntry {
  sender: string;
  text: string;
  timestamp: string;
}

export interface UserInfo {
  roomCode: string;
  role: string;
  username: string;
}

export interface RunAttempt {
  timestamp: string;
  blocks: string[];
  attemptNumber?: number;
  success?: boolean;
  failReason?: string | null;
}

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
