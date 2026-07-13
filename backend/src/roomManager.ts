import { UserInfo } from "./types";

// Map roomCode -> Set of socket IDs
const rooms = new Map<string, Set<string>>();

// Map socketId -> UserInfo
const users = new Map<string, UserInfo>();

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
