import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  username: string;
  roomCode: string;
  role: 'driver' | 'navigator' | null;
  setRole: (role: 'driver' | 'navigator') => void;
  connect: (username: string, roomCode: string, role: 'driver' | 'navigator') => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  username: '',
  roomCode: '',
  role: null,

  connect: (username, roomCode, role) => {
    // If already connected, disconnect first
    if (get().socket) {
      get().socket?.disconnect();
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const socket = io(backendUrl);

    socket.on('connect', () => {
      console.log('Connected to socket server with id:', socket.id);
      socket.emit('join_room', { roomCode, role, username });
    });

    set({ socket, username, roomCode, role });
  },

  setRole: (role) => {
    set({ role });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, username: '', roomCode: '', role: null });
  },
}));
