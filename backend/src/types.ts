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

export interface ChatLogData {
  roomCode: string;
  players: string[];
  startedAt: string;
  endedAt: string;
  messageCount: number;
  messages: ChatLogEntry[];
}
