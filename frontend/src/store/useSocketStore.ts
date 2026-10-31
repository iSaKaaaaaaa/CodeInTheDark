import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';
import { DUNGEON_TIME, SWAP_TIME } from '../constants/game';

import axios from 'axios';

export type ScreenState = 'landing' | 'login' | 'set_username' | 'select' | 'create' | 'join' | 'game';

/**
 * คำนวณ URL ของ Backend Server ตามสภาพแวดล้อมที่รันอยู่:
 * - อิงจาก VITE_BACKEND_URL ใน .env ก่อนเป็นอันดับแรก
 * - ตรวจสอบ localhost / 127.0.0.1 -> http://localhost:3000
 * - รองรับ VS Code / GitHub Codespaces Port Forwarding (-5173/-5174/-5175 -> -3000)
 * - ค่าเริ่มต้นสำหรับ Production บน Fly.io
 */
export const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }

    // ตรวจสอบ Port Forwarding ของ Codespaces หรือ Cloud Editor
    if (hostname.includes('-5173') || hostname.includes('-5174') || hostname.includes('-5175')) {
      return `https://${hostname.replace(/-517[3-5]/, '-3000')}`;
    }
  }

  return 'https://codeinthedark-backend.fly.dev';
};

/**
 * โครงสร้าง State และ Actions ของ Zustand Store:
 * จัดการสถานะการเชื่อมต่อ Socket.IO, ข้อมูลผู้ใช้, ห้องเกม, แผนที่ และการตั้งค่าเสียง
 */
interface SocketState {
  socket: Socket | null;
  userId: string | null;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  coins: number;
  roomCode: string;
  role: 'driver' | 'navigator' | null;
  currentScreen: ScreenState;
  players: { username: string; role: string }[];
  isPublic: boolean;
  mapData: {
    map: string[];
    walls: { x: number; y: number }[];
    traps: { x: number; y: number }[];
    rocks: { x: number; y: number }[];
    spikes: { x: number; y: number }[];
    start: { x: number; y: number };
    goal: { x: number; y: number };
  } | null;
  dungeonTimeLeft: number;
  swapTimeLeft: number;
  joinError: string | null;
  isMuted: boolean;
  volume: number;

  setScreen: (screen: ScreenState) => void;
  setRoomVisibility: (isPublic: boolean) => void;
  setUsername: (username: string) => void;
  setRole: (role: 'driver' | 'navigator') => void;

  loginWithGoogle: (payload: string | { credential?: string; accessToken?: string }) => Promise<void>;
  submitUsername: (username: string) => Promise<void>;
  createRoom: () => void;
  joinRoom: (roomCode: string) => void;
  leaveRoom: () => void;
  leaveStage: () => void;
  startGame: () => void;
  reconnect: () => void;
  disconnect: () => void;
  setDungeonTimeLeft: (time: number | ((prev: number) => number)) => void;
  setSwapTimeLeft: (time: number | ((prev: number) => number)) => void;
  setJoinError: (error: string | null) => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
}

/**
 * Zustand Store กลางของเกม (useSocketStore):
 * บันทึกสถานะสำคัญลงใน sessionStorage ผ่าน persist middleware
 * ช่วยให้ผู้เล่นสามารถรีเฟรชหน้าจอแล้วกลับเข้าห้องเดิมได้โดยอัตโนมัติ
 */
export const useSocketStore = create<SocketState>()(
  persist(
    (set, get) => ({
      socket: null,
      userId: null,
      username: '',
      email: null,
      avatarUrl: null,
      coins: 0,
      roomCode: '',
      role: null,
      currentScreen: 'landing',
      players: [],
      isPublic: false,
      mapData: null,
      dungeonTimeLeft: DUNGEON_TIME,
      swapTimeLeft: SWAP_TIME,
      joinError: null,
      isMuted: false,
      volume: 15,

      setScreen: (screen) => set({ currentScreen: screen }),
      // ส่งคำขอเปลี่ยนสถานะห้องสาธารณะ/ส่วนตัวไปยัง Server
      setRoomVisibility: (isPublic) => {
        get().socket?.emit('set_room_visibility', { isPublic });
      },
      setUsername: (username) => set({ username }),
      setDungeonTimeLeft: (time) => set((state) => ({ dungeonTimeLeft: typeof time === 'function' ? time(state.dungeonTimeLeft) : time })),
      setSwapTimeLeft: (time) => set((state) => ({ swapTimeLeft: typeof time === 'function' ? time(state.swapTimeLeft) : time })),
      setJoinError: (error) => set({ joinError: error }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setVolume: (volume) => set({ volume }),

      // ยืนยัน Token Google OAuth กับ Backend API
      loginWithGoogle: async (payload: string | { credential?: string; accessToken?: string }) => {
        try {
          const backendUrl = getBackendUrl();
          let body: { credential?: string; accessToken?: string };
          if (typeof payload === 'string') {
            if (payload.split('.').length === 3) {
              body = { credential: payload };
            } else {
              body = { accessToken: payload };
            }
          } else {
            body = payload;
          }
          const response = await axios.post(`${backendUrl}/api/auth/google`, body);
          const user = response.data;

          set({
            userId: user._id,
            username: user.username || '',
            email: user.email,
            avatarUrl: user.avatarUrl || null,
            coins: user.coins || 0,
            currentScreen: user.username ? 'select' : 'set_username'
          });
        } catch (error) {
          console.error('Google login failed:', error);
          throw error;
        }
      },

      // บันทึกชื่อผู้ใช้ใหม่สำหรับผู้เล่นที่เข้าใช้งานครั้งแรก
      submitUsername: async (username: string) => {
        try {
          const { userId } = get();
          if (!userId) throw new Error('Not logged in');

          const backendUrl = getBackendUrl();
          const response = await axios.post(`${backendUrl}/api/auth/username`, { userId, username });

          if (response.data.success) {
            set({
              username: response.data.username,
              currentScreen: 'select'
            });
          }
        } catch (error: any) {
          console.error('Submit username failed:', error);
          if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
          }
          throw error;
        }
      },

      // สร้างห้องเล่นใหม่ สุ่มรหัส 6 หลัก และเชื่อมต่อ Socket.IO ในฐานะ Host (Driver)
      createRoom: () => {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (get().socket) {
          get().socket?.disconnect();
        }

        const backendUrl = getBackendUrl();
        const socket = io(backendUrl, { transports: ['websocket', 'polling'] });
        socket.on('connect', () => {
          socket.emit('join_room', { roomCode: generatedCode, role: 'driver', username: get().username });
          set({ currentScreen: 'create' });
        });

        socket.on('room_users', (users) => {
          set({ players: users });
        });

        socket.on('room_visibility', (data: { isPublic: boolean }) => {
          set({ isPublic: data.isPublic });
        });

        socket.on('start_game', (mapData: any) => {
          set({ currentScreen: 'game', mapData, role: 'driver', dungeonTimeLeft: DUNGEON_TIME, swapTimeLeft: SWAP_TIME });
        });

        socket.on('return_to_lobby', () => {
          set({ currentScreen: 'create', role: 'driver', mapData: null });
        });

        socket.on('room_destroyed', (data: { reason: string }) => {
          socket.disconnect();
          set({ socket: null, roomCode: '', role: null, players: [], isPublic: false, currentScreen: 'select', mapData: null });
          alert(data.reason || "Your partner has disconnected.");
        });

        socket.on('coins_updated', (data: { coins: number }) => {
          set({ coins: data.coins });
        });

        set({ socket, roomCode: generatedCode, role: 'driver', players: [], isPublic: false });
      },

      // เข้าร่วมห้องเล่นที่มีอยู่แล้วด้วยรหัส 6 หลัก ในฐานะ Guest (Navigator)
      joinRoom: (roomCode) => {
        set({ joinError: null });
        if (get().socket) {
          get().socket?.disconnect();
        }

        const backendUrl = getBackendUrl();
        const socket = io(backendUrl, { transports: ['websocket', 'polling'] });

        socket.on('connect', () => {
          socket.emit('join_room', { roomCode, role: 'navigator', username: get().username });
          set({ currentScreen: 'create' });
        });

        socket.on('join_error', (msg) => {
          set({ joinError: msg, currentScreen: 'join' });
          socket.disconnect();
        });

        socket.on('room_users', (users) => {
          set({ players: users });
        });

        socket.on('room_visibility', (data: { isPublic: boolean }) => {
          set({ isPublic: data.isPublic });
        });

        socket.on('start_game', (mapData: any) => {
          set({ currentScreen: 'game', mapData, role: 'navigator', dungeonTimeLeft: DUNGEON_TIME, swapTimeLeft: SWAP_TIME });
        });

        socket.on('return_to_lobby', () => {
          set({ currentScreen: 'create', role: 'navigator', mapData: null });
        });

        socket.on('room_destroyed', (data: { reason: string }) => {
          socket.disconnect();
          set({ socket: null, roomCode: '', role: null, players: [], isPublic: false, currentScreen: 'select', mapData: null });
          alert(data.reason || "Your partner has disconnected.");
        });

        socket.on('coins_updated', (data: { coins: number }) => {
          set({ coins: data.coins });
        });

        set({ socket, roomCode, role: 'navigator', players: [], isPublic: false });
      },

      // สั่งเริ่มเกม (เฉพาะ Host)
      startGame: () => {
        const { socket, roomCode } = get();
        if (socket && roomCode) {
          socket.emit('start_game');
        }
      },

      // ออกจากห้องรอและกลับสู่หน้าเลือกโหมด
      leaveRoom: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
        }
        set({ socket: null, roomCode: '', role: null, currentScreen: 'select', players: [], isPublic: false });
      },

      // ส่งสัญญาณขอออกจากด่านเพื่อกลับสู่ Lobby รอเล่นใหม่
      leaveStage: () => {
        const { socket } = get();
        if (socket) {
          socket.emit("return_to_lobby");
        }
      },

      setRole: (role) => {
        set({ role });
      },

      // ออกจากระบบ ล้างการเชื่อมต่อและกลับสู่หน้า Landing Page
      disconnect: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
        }
        set({ socket: null, roomCode: '', role: null, currentScreen: 'landing', players: [] });
      },

      // เชื่อมต่อห้องเดิมใหม่อัตโนมัติเมื่อผู้ใช้รีเฟรชหน้าเว็บ
      reconnect: () => {
        const { username, roomCode, role, socket } = get();
        if (!username || !roomCode || !role || socket) return;

        const backendUrl = getBackendUrl();
        const newSocket = io(backendUrl, { transports: ['websocket', 'polling'] });
        newSocket.on('connect', () => {
          newSocket.emit('join_room', { roomCode, role, username });
        });

        newSocket.on('room_users', (users) => {
          set({ players: users });
        });

        newSocket.on('room_visibility', (data: { isPublic: boolean }) => {
          set({ isPublic: data.isPublic });
        });

        newSocket.on('start_game', (mapData: any) => {
          const isHost = get().players.length > 0 ? get().players[0].username === get().username : get().role === 'driver';
          set({ currentScreen: 'game', mapData, role: isHost ? 'driver' : 'navigator', dungeonTimeLeft: DUNGEON_TIME, swapTimeLeft: SWAP_TIME });
        });

        newSocket.on('return_to_lobby', () => {
          const isHost = get().players.length > 0 ? get().players[0].username === get().username : get().role === 'driver';
          set({ currentScreen: 'create', role: isHost ? 'driver' : 'navigator', mapData: null });
        });

        newSocket.on('room_destroyed', (data: { reason: string }) => {
          newSocket.disconnect();
          set({ socket: null, roomCode: '', role: null, players: [], currentScreen: 'select', mapData: null });
          alert(data.reason || "Your partner has disconnected.");
        });

        newSocket.on('coins_updated', (data: { coins: number }) => {
          set({ coins: data.coins });
        });

        newSocket.on('join_error', () => {
          set({ socket: null, roomCode: '', role: null, currentScreen: 'landing', players: [] });
          newSocket.disconnect();
        });

        set({ socket: newSocket });
      },
    }),
    {
      name: 'codeinthedark-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        userId: state.userId,
        username: state.username,
        email: state.email,
        avatarUrl: state.avatarUrl,
        coins: state.coins,
        roomCode: state.roomCode,
        role: state.role,
        currentScreen: state.currentScreen,
        mapData: state.mapData,
        dungeonTimeLeft: state.dungeonTimeLeft,
        swapTimeLeft: state.swapTimeLeft,
        isMuted: state.isMuted,
        volume: state.volume,
      }),
    }
  )
);
