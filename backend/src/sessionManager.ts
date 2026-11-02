import { Server } from "socket.io";

interface UserSession {
  sessionId: string;
  socketId?: string;
}

// แผนที่เก็บ Session ล่าสุดของผู้ใช้แต่ละคน (userId -> UserSession)
const activeSessions = new Map<string, UserSession>();
let ioInstance: Server | null = null;

export function setSessionIo(io: Server) {
  ioInstance = io;
}

/**
 * บันทึกการเข้าสู่ระบบใหม่ และบังคับเตะ Socket ของเซสชันเก่าออกทันที
 */
export function registerLogin(userId: string, sessionId: string) {
  const existing = activeSessions.get(userId);
  if (existing?.socketId && ioInstance) {
    const oldSocket = ioInstance.sockets.sockets.get(existing.socketId);
    if (oldSocket) {
      oldSocket.emit("force_logout", {
        reason: "บัญชีนี้มีการเข้าสู่ระบบจากอุปกรณ์อื่น",
      });
      oldSocket.disconnect(true);
    }
  }
  activeSessions.set(userId, { sessionId });
}

/**
 * ลงทะเบียน Socket เข้ากับ Session ของผู้ใช้
 * หาก sessionId ไม่ตรงกับ Session ล่าสุด จะปฏิเสธการเชื่อมต่อ
 */
export function registerSocket(
  userId: string,
  sessionId: string,
  socketId: string
): boolean {
  const existing = activeSessions.get(userId);
  if (existing && existing.sessionId !== sessionId) {
    return false;
  }

  // หากเป็น Session เดียวกันแต่มี Socket เก่าค้างอยู่ ให้ปิด Socket เก่าอย่างเงียบๆ
  if (existing?.socketId && existing.socketId !== socketId && ioInstance) {
    const oldSocket = ioInstance.sockets.sockets.get(existing.socketId);
    if (oldSocket) {
      oldSocket.disconnect(true);
    }
  }

  activeSessions.set(userId, { sessionId, socketId });
  return true;
}

/**
 * ถอนการเชื่อมต่อ Socket เมื่อผู้ใช้ Disconnect
 */
export function unregisterSocket(userId: string, socketId: string) {
  const existing = activeSessions.get(userId);
  if (existing && existing.socketId === socketId) {
    existing.socketId = undefined;
  }
}
