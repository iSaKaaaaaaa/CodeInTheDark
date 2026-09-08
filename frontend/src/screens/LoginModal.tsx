import { useState } from 'react';
import { useSocketStore } from '../store/useSocketStore';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginModal() {
  const [error, setError] = useState('');
  
  const setScreen = useSocketStore((state) => state.setScreen);
  const loginWithGoogle = useSocketStore((state) => state.loginWithGoogle);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
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

        <div className="w-full px-12 sm:px-20 md:px-32 py-8 flex flex-col items-center gap-8 mt-6 font-pixel">
          <p className="text-2xl text-center mb-4">Please log in to continue</p>
          
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login was unsuccessful')}
            size="large"
            theme="filled_blue"
            shape="rectangular"
          />
          
          {error && <p className="text-red-600 font-bold bg-red-100 border-2 border-red-500 rounded-lg p-2 text-center text-lg shadow-sm w-full">{error}</p>}
        </div>
      </div>
    </div>
  );
}
