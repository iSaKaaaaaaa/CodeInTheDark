import { UserInfo } from "./types";

// แผนที่เก็บ socketId ภายในแต่ละ roomCode (roomCode -> Set<socketId>)
const rooms = new Map<string, Set<string>>();

// แผนที่เก็บข้อมูล UserInfo ของแต่ละการเชื่อมต่อ (socketId -> UserInfo)
const users = new Map<string, UserInfo>();

/**
 * ข้อมูลสถานะและสิทธิ์ของห้อง:
 *  - ค่าเริ่มต้นทุกห้องเป็น Private (ต้องใช้รหัส 6 หลักในการเข้าร่วม)
 *  - Host สามารถปรับเป็น Public เพื่อให้แสดงในหน้ารายชื่อห้องสาธารณะได้
 *  - ห้องสาธารณะจะแสดงเฉพาะเมื่อยังไม่เริ่มเกม และมีผู้เล่น 1 คน
 */
interface RoomMeta {
  hostSocketId: string;
  hostName: string;
  isPublic: boolean;
  started: boolean;
}
const roomMeta = new Map<string, RoomMeta>();

/** จำนวนผู้เล่นสูงสุดต่อห้อง (จำกัด 2 คน: Driver และ Navigator) */
export const MAX_PLAYERS_PER_ROOM = 2;

/** สร้าง Metadata ประจำห้องเมื่อ Host ทำการสร้างห้อง */
export function createRoomMeta(roomCode: string, hostSocketId: string, hostName: string) {
  roomMeta.set(roomCode, { hostSocketId, hostName, isPublic: false, started: false });
}

/** ดึง Metadata ของห้อง */
export function getRoomMeta(roomCode: string) {
  return roomMeta.get(roomCode);
}

/** เปลี่ยนสถานะ Public/Private ของห้อง (อนุญาตเฉพาะ Host เท่านั้น) */
export function setRoomPublic(roomCode: string, socketId: string, isPublic: boolean): boolean | null {
  const meta = roomMeta.get(roomCode);
  if (!meta || meta.hostSocketId !== socketId) return null;
  meta.isPublic = isPublic;
  return meta.isPublic;
}

/** อัปเดตสถานะว่าห้องได้เริ่มเล่นเกมแล้วหรือไม่ */
export function setRoomStarted(roomCode: string, started: boolean) {
  const meta = roomMeta.get(roomCode);
  if (meta) meta.started = started;
}

/** ตรวจสอบว่าห้องมีผู้เล่นเต็มแล้วหรือไม่ */
export function isRoomFull(roomCode: string) {
  return (rooms.get(roomCode)?.size ?? 0) >= MAX_PLAYERS_PER_ROOM;
}

/** ดึงรายชื่อห้องสาธารณะที่ยังว่างและยังไม่เริ่มเกม */
export function getPublicRooms() {
  const list: { code: string; host: string; players: number }[] = [];
  for (const [code, meta] of roomMeta) {
    const players = rooms.get(code)?.size ?? 0;
    if (meta.isPublic && !meta.started && players >= 1 && players < MAX_PLAYERS_PER_ROOM) {
      list.push({ code, host: meta.hostName, players });
    }
  }
  return list;
}

/** บันทึกผู้ใช้เข้าห้องในระบบ Memory Map */
export function addUserToRoom(socketId: string, user: UserInfo) {
  users.set(socketId, user);
  if (!rooms.has(user.roomCode)) {
    rooms.set(user.roomCode, new Set());
  }
  rooms.get(user.roomCode)!.add(socketId);
}

/** นำผู้ใช้ออกจากห้อง และล้างข้อมูลห้องหากไม่มีผู้เล่นเหลืออยู่ */
export function removeUserFromRoom(socketId: string) {
  const user = users.get(socketId);
  if (!user) return null;

  const roomUsers = rooms.get(user.roomCode);
  if (roomUsers) {
    roomUsers.delete(socketId);
    if (roomUsers.size === 0) {
      rooms.delete(user.roomCode);
      roomMeta.delete(user.roomCode);
    }
  }
  users.delete(socketId);
  return user;
}

/** ดึงข้อมูล UserInfo จาก socketId */
export function getUser(socketId: string) {
  return users.get(socketId);
}

/** ดึง Set ของ socketId ทั้งหมดในห้อง */
export function getRoomUsers(roomCode: string) {
  return rooms.get(roomCode);
}

/** ตรวจสอบว่าห้องมีอยู่หรือไม่ */
export function hasRoom(roomCode: string) {
  return rooms.has(roomCode);
}

/** ดึงรายชื่อ Username ของผู้เล่นทั้งหมดในห้อง */
export function getPlayerNamesInRoom(roomCode: string): string[] {
  const roomUserIds = rooms.get(roomCode);
  if (!roomUserIds) return [];
  return Array.from(roomUserIds)
    .map((id) => users.get(id))
    .filter(Boolean)
    .map((u) => u!.username);
}

/** ดึงรายการ UserInfo ทั้งหมดในห้อง */
export function getUserListForRoom(roomCode: string) {
  const roomUserIds = rooms.get(roomCode);
  if (!roomUserIds) return [];
  return Array.from(roomUserIds).map((id) => users.get(id));
}

/** ตรวจสอบว่าห้องว่างหรือไม่ */
export function isRoomEmpty(roomCode: string) {
  const roomUsers = rooms.get(roomCode);
  return !roomUsers || roomUsers.size === 0;
}
