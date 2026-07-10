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
    // Mock authentication
    if ((username === 'player1' && password === '1234') || 
        (username === 'player2' && password === '1234')) {
      setStoreUsername(username);
      setScreen('select');
    } else {
      setError('Invalid username or password');
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
        className="relative w-full max-w-[1200px] h-[750px] md:max-w-[800px] md:h-[600px] flex flex-col items-center justify-center cursor-auto"
        // ม้วนกระดาษ
        style={{
          backgroundImage: "url('/score.png')",
          backgroundSize: '120% 115%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-12 left-24 md:left-28 text-black text-4xl font-bold hover:text-orange-700 transition-colors flex items-center gap-2 z-10 drop-shadow-sm font-pixel"
          onClick={() => setScreen('landing')}
        >
          <span>&#8592;</span>
        </button>

        <div className="w-full px-20 md:px-32 py-8 flex flex-col gap-6 mt-6 font-pixel">
          <InputField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

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
