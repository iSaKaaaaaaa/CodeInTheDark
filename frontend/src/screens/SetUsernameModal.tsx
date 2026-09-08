import { useState } from 'react';
import InputField from '../components/InputField';
import PixelButton from '../components/PixelButton';
import { useSocketStore } from '../store/useSocketStore';

export default function SetUsernameModal() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const submitUsername = useSocketStore((state) => state.submitUsername);

  const handleSubmit = async () => {
    if (username.trim() === '') {
      setError('Username cannot be empty');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await submitUsername(username);
    } catch (err: any) {
      setError(err.message || 'Failed to set username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4 transition-opacity duration-300 ease-in-out cursor-default"
    >
      <h2 className="text-black text-5xl md:text-7xl mb-10 drop-shadow-xl text-center relative z-10 font-pixel font-bold tracking-wider">
        Code In The Dark
      </h2>

      <div
        className="relative w-full max-w-[90vw] md:max-w-[800px] h-[80vh] md:h-[600px] flex flex-col items-center justify-center cursor-auto"
        style={{
          backgroundImage: "url('/ui/score.png')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="w-full px-12 sm:px-20 md:px-32 py-8 flex flex-col items-center gap-8 mt-6 font-pixel">
          <p className="text-2xl text-center mb-4">Choose your Username</p>
          
          <div className="w-full">
            <InputField 
              label="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          
          {error && <p className="text-red-600 font-bold bg-red-100 border-2 border-red-500 rounded-lg p-2 text-center text-lg shadow-sm w-full">{error}</p>}
          
          <PixelButton 
            variant="orange" 
            className="rounded-xl px-10 py-3 text-xl" 
            onClick={handleSubmit}
          >
            {loading ? 'Saving...' : 'Confirm'}
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
