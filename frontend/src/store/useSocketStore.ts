import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export type ScreenState = 'landing' | 'login' | 'select' | 'create' | 'join' | 'game';

interface SocketState {
  socket: Socket | null;
  username: string;
  roomCode: string;
  role: 'driver' | 'navigator' | null;
  currentScreen: ScreenState;
  players: { username: string; role: string }[];
  
  setScreen: (screen: ScreenState) => void;
  setUsername: (username: string) => void;
  setRole: (role: 'driver' | 'navigator') => void;
  
  createRoom: () => void;
  joinRoom: (roomCode: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  connect: (username: string, roomCode: string, role: 'driver' | 'navigator') => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  username: '',
  roomCode: '',
  role: null,
  currentScreen: 'landing',
  players: [],

  setScreen: (screen) => set({ currentScreen: screen }),
  setUsername: (username) => set({ username }),

  createRoom: () => {
    // Generate 6-digit room code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    if (get().socket) {
      get().socket?.disconnect();
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const socket = io(backendUrl);
    socket.on('connect', () => {
      console.log('Host connected to socket server with id:', socket.id);
      socket.emit('join_room', { roomCode: generatedCode, role: 'driver', username: get().username });
    });

    socket.on('room_users', (users) => {
      set({ players: users });
    });

    socket.on('start_game', () => {
      set({ currentScreen: 'game' });
    });

    set({ socket, roomCode: generatedCode, role: 'driver', currentScreen: 'create', players: [] });
  },

  joinRoom: (roomCode) => {
    if (get().socket) {
      get().socket?.disconnect();
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const socket = io(backendUrl);
    
    socket.on('connect', () => {
      console.log('Client connected to socket server with id:', socket.id);
      socket.emit('join_room', { roomCode, role: 'navigator', username: get().username });
    });

    socket.on('room_users', (users) => {
      set({ players: users });
    });

    socket.on('start_game', () => {
      set({ currentScreen: 'game' });
    });

    set({ socket, roomCode, role: 'navigator', currentScreen: 'create', players: [] });
  },

  startGame: () => {
    const { socket, roomCode } = get();
    if (socket && roomCode) {
      // Need backend to emit this too
      socket.emit('start_game');
      set({ currentScreen: 'game' });
    }
  },

  leaveRoom: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, roomCode: '', role: null, currentScreen: 'select', players: [] });
  },

  setRole: (role) => {
    set({ role });
  },

  connect: (username, roomCode, role) => {
    if (get().socket) {
      get().socket?.disconnect();
    }
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const socket = io(backendUrl);

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
}));
