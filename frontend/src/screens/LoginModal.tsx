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
      className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 ease-in-out font-pixel"
      onClick={() => setScreen('landing')}
    >
      <h2 
        className="text-[#fde68a] text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-4 md:mb-6 uppercase text-center relative z-10 font-bold tracking-widest drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
        style={{ textShadow: "4px 4px 0px #5c2e0b" }}
      >
        Code In The Dark
      </h2>

      <div
        className="relative w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[700px] lg:max-w-[800px] max-h-[75vh] md:max-h-[80vh] aspect-[4/3] flex flex-col items-center justify-center cursor-auto drop-shadow-2xl mx-auto"
        style={{
          backgroundImage: "url('/ui/score.png')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 2. Modal Close Button (UX Rule: Clear Exit): ใช้ไอคอน 'X' สากลที่มุมขวาบน เพื่อลดความซ้ำซ้อนของคำและจัดตำแหน่งได้เป๊ะกว่า */}
        <button
          className="absolute top-[8%] right-[8%] md:top-[12%] md:right-[12%] text-[#5c2e0b] text-4xl md:text-5xl font-bold hover:text-red-700 active:translate-y-1 transition-colors duration-100 z-10 drop-shadow-sm"
          onClick={() => setScreen('landing')}
          title="Close"
        >
          &#10006;
        </button>

        <div className="w-full h-full flex flex-col items-center justify-center px-[12%] sm:px-[15%] md:px-[18%] pt-[16%] sm:pt-[18%] md:pt-[20%] pb-[5%] gap-3 md:gap-5 -translate-y-5">
          <div className="text-center flex flex-col gap-1 md:gap-2">
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center text-[#5c2e0b] font-bold uppercase tracking-widest drop-shadow-sm">
              Welcome, Explorer
            </p>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-center text-[#8b4513]">
              Please log in to continue
            </p>
          </div>
          
          {/* 3. CTA Contrast (UX Rule: High Contrast): กรอบสีน้ำตาลเข้มเพื่อดันให้ปุ่มสีขาวโดดเด่นขึ้นมา ไม่จมไปกับสีกระดาษ */}
          <div className="bg-[#5c2e0b] p-2.5 md:p-3 rounded-2xl border-[3px] md:border-[4px] border-[#382503] shadow-[0_4px_0px_#382503] active:translate-y-[4px] active:shadow-none active:border-b-0 active:border-r-0 transition-all duration-75 mt-2 md:mt-4 cursor-pointer">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login was unsuccessful')}
              size="large"
              theme="outline"
              shape="rectangular"
              text="continue_with"
            />
          </div>
          
          {error && (
            <p className="text-red-700 font-bold bg-red-100/90 border-2 border-red-500 rounded-lg p-3 text-center text-xl shadow-sm w-full max-w-sm mt-4 backdrop-blur-sm animate-pulse">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
