import { useState } from 'react';
import InputField from '../components/InputField';
import PixelButton from '../components/PixelButton';
import { useSocketStore } from '../store/useSocketStore';

interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void;
}

export default function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [role, setRole] = useState<'driver' | 'navigator'>('driver');
  const connect = useSocketStore((state) => state.connect);

  const handleJoin = () => {
    if (username && roomCode) {
      connect(username, roomCode, role);
      onLogin();
    }
  };

  return (
    <div
      className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4 transition-opacity duration-300 ease-in-out cursor-default"
      onClick={onClose}
    >
      <h2 className="text-black text-5xl md:text-7xl mb-10 drop-shadow-xl text-center relative z-10">
        Code In The Dark
      </h2>

      <div
        className="relative w-full max-w-[600px] h-[550px] md:max-w-[800px] md:h-[650px] flex flex-col items-center justify-center cursor-auto"
        // ม้วนกระดาษ
        style={{
          backgroundImage: "url('/score.png')",
          backgroundSize: '130% 130%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 left-10 text-black text-4xl font-bold hover:text-orange-700 transition-colors flex items-center gap-2 z-10 drop-shadow-sm"
          onClick={onClose}
        >
          <span>&#8592;</span>
        </button>

        <div className="w-full px-16 md:px-32 py-8 flex flex-col gap-4 mt-8">
          <InputField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <InputField label="Room Code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
          
          <div className="flex flex-col gap-1">
            <label className="text-black text-xl font-bold drop-shadow-sm">Role</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xl">
                <input type="radio" name="role" value="driver" checked={role === 'driver'} onChange={() => setRole('driver')} className="w-5 h-5 accent-orange-600" />
                Driver
              </label>
              <label className="flex items-center gap-2 text-xl">
                <input type="radio" name="role" value="navigator" checked={role === 'navigator'} onChange={() => setRole('navigator')} className="w-5 h-5 accent-orange-600" />
                Navigator
              </label>
            </div>
          </div>

          <div className="flex justify-center gap-8 mt-4">
            <PixelButton variant="orange" className="rounded-full px-8 py-3 text-2xl" onClick={handleJoin}>
              Join Room
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}