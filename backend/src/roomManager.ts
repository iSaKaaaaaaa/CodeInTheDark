import { UserInfo } from "./types";

// Map roomCode -> Set of socket IDs
const rooms = new Map<string, Set<string>>();

// Map socketId -> UserInfo
const users = new Map<string, UserInfo>();

/*
 * Room visibility logic (kept deliberately simple):
 *  - Every room is PRIVATE by default: it can only be joined by typing its 6-digit code.
 *  - The host can flip it to PUBLIC. Public rooms appear in the "Public Rooms" list.
 *  - A room is listed only while it is public, has exactly 1 player, and has not started.
 *  - The code always works for joining, public or not (a public room is just "listed").
 *  - The server is the single source of truth; clients ask via REST and never trust their own copy.
 */
interface RoomMeta {
  hostSocketId: string;
  hostName: string;
  isPublic: boolean;
  started: boolean;
}
const roomMeta = new Map<string, RoomMeta>();

export const MAX_PLAYERS_PER_ROOM = 2;

export function createRoomMeta(roomCode: string, hostSocketId: string, hostName: string) {
  roomMeta.set(roomCode, { hostSocketId, hostName, isPublic: false, started: false });
}

export function getRoomMeta(roomCode: string) {
  return roomMeta.get(roomCode);
}

/** Only the host may change visibility. Returns the new value, or null if not allowed. */
export function setRoomPublic(roomCode: string, socketId: string, isPublic: boolean): boolean | null {
  const meta = roomMeta.get(roomCode);
  if (!meta || meta.hostSocketId !== socketId) return null;
  meta.isPublic = isPublic;
  return meta.isPublic;
}

export function setRoomStarted(roomCode: string, started: boolean) {
  const meta = roomMeta.get(roomCode);
  if (meta) meta.started = started;
}

export function isRoomFull(roomCode: string) {
  return (rooms.get(roomCode)?.size ?? 0) >= MAX_PLAYERS_PER_ROOM;
}

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

export function addUserToRoom(socketId: string, user: UserInfo) {
  users.set(socketId, user);
  if (!rooms.has(user.roomCode)) {
    rooms.set(user.roomCode, new Set());
  }
  rooms.get(user.roomCode)!.add(socketId);
}

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

export function getUser(socketId: string) {
  return users.get(socketId);
}

export function getRoomUsers(roomCode: string) {
  return rooms.get(roomCode);
}

export function hasRoom(roomCode: string) {
  return rooms.has(roomCode);
}

export function getPlayerNamesInRoom(roomCode: string): string[] {
  const roomUserIds = rooms.get(roomCode);
  if (!roomUserIds) return [];
  return Array.from(roomUserIds)
    .map((id) => users.get(id))
    .filter(Boolean)
    .map((u) => u!.username);
}

export function getUserListForRoom(roomCode: string) {
  const roomUserIds = rooms.get(roomCode);
  if (!roomUserIds) return [];
  return Array.from(roomUserIds).map((id) => users.get(id));
}

export function isRoomEmpty(roomCode: string) {
  const roomUsers = rooms.get(roomCode);
  return !roomUsers || roomUsers.size === 0;
}
