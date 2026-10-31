/** บทบาทของผู้เล่นในเกม (Driver ผู้ขับ หรือ Navigator ผู้นำทาง) */
export type Role = "driver" | "navigator";

/** พิกัดตำแหน่งบนตาราง 2 มิติ (x = แกนนอน, y = แกนตั้ง) */
export interface Position {
  x: number;
  y: number;
}

/** โครงสร้างข้อมูลแผนที่เขาวงกตที่ได้รับจากเซิร์ฟเวอร์ */
export interface MapData {
  seed?: number;
  map: string[];
  walls: Position[];
  traps: Position[];
  rocks: Position[];
  spikes: Position[];
  start: Position;
  goal: Position;
}

/** ข้อมูลโปรไฟล์ผู้เล่นและบทบาทในห้อง */
export interface PlayerInfo {
  username: string;
  role: Role | string;
}

/** ข้อมูลสถานะของเกมที่ Driver ซิงค์ส่งให้ Navigator แบบ Real-time */
export interface SyncGameStatePayload {
  playerX?: number;
  playerY?: number;
  direction?: "up" | "right" | "down" | "left";
  blocksLeft?: number;
  availableQuota?: number;
  isWin?: boolean;
  isLose?: boolean;
  loseReason?: "blocks" | "time" | null;
  dungeonTimeLeft?: number;
  swapTimeLeft?: number;
  showSwapAlert?: boolean;
  executionError?: string | null;
  reset?: boolean;
  tutorialReady?: { driver: boolean; navigator: boolean };
}

/** ข้อมูลการสลับบทบาทระหว่าง Driver และ Navigator */
export interface RoleSwapPayload {
  newRole: Role;
  swapTimeLeft?: number;
}

/** ข้อมูลสรุปเมื่อเกมสิ้นสุดลง ส่งให้เซิร์ฟเวอร์ประมวลผลรางวัล */
export interface EndGamePayload {
  result: "win" | "lose_trap" | "lose_blocks" | "lose_time";
  timeUsed: number;
  blocksUsed: number;
}

/** ข้อมูลผลลัพธ์การรันบล็อกคำสั่งในแต่ละรอบ */
export interface RunResultPayload {
  blocks: string[];
  success: boolean;
  failReason: string | null;
}

/** ข้อมูลการชนสิ่งกีดขวางในเขาวงกต */
export interface ObstacleHitPayload {
  type: "wall" | "rock" | "spike" | "trap";
  x: number;
  y: number;
  playerName: string;
}

/** ข้อมูลข้อความในกล่องแชต */
export interface ChatMessagePayload {
  text: string;
  sender: string;
  timestamp?: string;
}
