import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';

export type ScreenState = 'landing' | 'login' | 'select' | 'create' | 'join' | 'game';

const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3000';
  }
  return 'https://codeinthedark-backend.fly.dev';
};

interface SocketState {
  socket: Socket | null;
  username: string;
  roomCode: string;
  role: 'driver' | 'navigator' | null;
  currentScreen: ScreenState;
  players: { username: string; role: string }[];
  selectedMapIndex: number;
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
  
  
  setScreen: (screen: ScreenState) => void;
  setUsername: (username: string) => void;
  setRole: (role: 'driver' | 'navigator') => void;
  
  createRoom: () => void;
  joinRoom: (roomCode: string) => void;
  leaveRoom: () => void;
  leaveStage: () => void;
  startGame: () => void;
  connect: (username: string, roomCode: string, role: 'driver' | 'navigator') => void;
  reconnect: () => void;
  disconnect: () => void;
  setSelectedMapIndex: (index: number) => void;
  setDungeonTimeLeft: (time: number | ((prev: number) => number)) => void;
  setSwapTimeLeft: (time: number | ((prev: number) => number)) => void;
  setJoinError: (error: string | null) => void;
  toggleMute: () => void;
}

export const useSocketStore = create<SocketState>()(
  persist(
    (set, get) => ({
  socket: null,
  username: '',
  roomCode: '',
  role: null,
  currentScreen: 'landing',
  players: [],
  selectedMapIndex: 0,
  mapData: null,
  dungeonTimeLeft: 300,
  swapTimeLeft: 120,
  joinError: null,
  isMuted: false,

  setSelectedMapIndex: (index) => set({ selectedMapIndex: index }),
  setScreen: (screen) => set({ currentScreen: screen }),
  setUsername: (username) => set({ username }),
  setDungeonTimeLeft: (time) => set((state) => ({ dungeonTimeLeft: typeof time === 'function' ? time(state.dungeonTimeLeft) : time })),
  setSwapTimeLeft: (time) => set((state) => ({ swapTimeLeft: typeof time === 'function' ? time(state.swapTimeLeft) : time })),
  setJoinError: (error) => set({ joinError: error }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  createRoom: () => {
    // Generate 6-digit room code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    if (get().socket) {
      get().socket?.disconnect();
    }

    const backendUrl = getBackendUrl();
    const socket = io(backendUrl, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => {
      console.log('Host connected to socket server with id:', socket.id);
      socket.emit('join_room', { roomCode: generatedCode, role: 'driver', username: get().username });
      set({ currentScreen: 'create' });
    });

    socket.on('room_users', (users) => {
      set({ players: users });
    });

    socket.on('start_game', (mapData: any) => {
      set({ currentScreen: 'game', mapData });
    });

    socket.on('return_to_lobby', () => {
      set({ currentScreen: 'create' });
    });

    socket.on('user_left', () => {
      alert("Your partner has left the room. Returning to lobby.");
      set({ currentScreen: 'create' });
    });

    // Don't set currentScreen here, wait for connection
    set({ socket, roomCode: generatedCode, role: 'driver', players: [] });
  },

  joinRoom: (roomCode) => {
    set({ joinError: null });
    if (get().socket) {
      get().socket?.disconnect();
    }

    const backendUrl = getBackendUrl();
    const socket = io(backendUrl, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      console.log('Client connected to socket server with id:', socket.id);
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

    socket.on('start_game', (mapData: any) => {
      set({ currentScreen: 'game', mapData });
    });

    socket.on('return_to_lobby', () => {
      set({ currentScreen: 'create' });
    });

    socket.on('user_left', () => {
      alert("Your partner has left the room. Returning to lobby.");
      set({ currentScreen: 'create' });
    });

    // Don't set currentScreen here, wait for connection
    set({ socket, roomCode, role: 'navigator', players: [] });
  },

  startGame: () => {
    const { socket, roomCode } = get();
    if (socket && roomCode) {
      socket.emit('start_game');
      // Wait for server to reply with start_game and mapData
    }
  },

  leaveRoom: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, roomCode: '', role: null, currentScreen: 'select', players: [] });
  },

  leaveStage: () => {
    const { socket } = get();
    if (socket) {
      socket.emit("return_to_lobby");
    }
  },

  setRole: (role) => {
    set({ role });
  },

  connect: (username, roomCode, role) => {
    if (get().socket) {
      get().socket?.disconnect();
    }
    const backendUrl = getBackendUrl();
    const socket = io(backendUrl, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      socket.emit('join_room', { roomCode, role, username });
    });

    set({ socket, username, roomCode, role, currentScreen: 'game', players: [] });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, roomCode: '', role: null, currentScreen: 'landing', players: [] });
  },

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

    newSocket.on('start_game', (mapData: any) => {
      set({ currentScreen: 'game', mapData });
    });

    newSocket.on('user_left', () => {
      alert("Your partner has left the room. Returning to lobby.");
      set({ currentScreen: 'create' });
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
        username: state.username,
        roomCode: state.roomCode,
        role: state.role,
        currentScreen: state.currentScreen,
        selectedMapIndex: state.selectedMapIndex,
        mapData: state.mapData,
        dungeonTimeLeft: state.dungeonTimeLeft,
        swapTimeLeft: state.swapTimeLeft,
        isMuted: state.isMuted,
      }),
    }
  )
);
