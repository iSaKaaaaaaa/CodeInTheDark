import { useState } from 'react';
import InputField from '../components/InputField';
import PixelButton from '../components/PixelButton';
import { useSocketStore } from '../store/useSocketStore';

export default function LoginModal() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const setScreen = useSocketStore((state) => state.setScreen);
  const setStoreUsername = useSocketStore((state) => state.setUsername);

  const handleLogin = () => {
    // Allow any username for testing, but keep the simple password '1234'
    if (username.trim() !== '' && password === '1234') {
      setStoreUsername(username);
      setScreen('select');
    } else {
      setError('Invalid password (use 1234) or empty username');
    }
  };

  return (
    <div
      className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4 transition-opacity duration-300 ease-in-out cursor-default"
      onClick={() => setScreen('landing')}
    >
      <h2 className="text-black text-5xl md:text-7xl mb-10 drop-shadow-xl text-center relative z-10 font-pixel font-bold tracking-wider">
        Code In The Dark
      </h2>

      <div
        className="relative w-full max-w-[90vw] md:max-w-[800px] h-[80vh] md:h-[600px] flex flex-col items-center justify-center cursor-auto"
        // ม้วนกระดาษ
        style={{
          backgroundImage: "url('/ui/score.png')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-[8%] left-[10%] md:top-12 md:left-28 text-black text-4xl font-bold hover:text-orange-700 transition-colors flex items-center gap-2 z-10 drop-shadow-sm font-pixel"
          onClick={() => setScreen('landing')}
        >
          <span>&#8592;</span>
        </button>

        <div className="w-full px-12 sm:px-20 md:px-32 py-8 flex flex-col gap-4 md:gap-6 mt-6 font-pixel">
          <InputField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          
          {error && <p className="text-red-600 font-bold bg-red-100 border-2 border-red-500 rounded-lg p-2 text-center text-lg md:text-xl shadow-sm">{error}</p>}

          <div className="flex justify-center gap-6 mt-6">
            <PixelButton variant="wood" className="rounded-xl px-10 py-3 text-xl" onClick={() => setError('Sign up not available yet')}>
              Sign up
            </PixelButton>
            <PixelButton variant="orange" className="rounded-xl px-10 py-3 text-xl" onClick={handleLogin}>
              Log in
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
