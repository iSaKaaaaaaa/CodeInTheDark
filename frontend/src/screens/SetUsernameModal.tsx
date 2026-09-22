import { useState } from 'react';
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div
      className="absolute inset-0 bg-black/65 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 ease-in-out cursor-default font-pixel"
    >
      {/* 1. Title สไตล์ 3D โทนส้ม-ครีมสว่าง ขนาดเด่นชัด */}
      <h2 
        className="text-[#fde68a] text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-4 md:mb-6 uppercase text-center relative z-10 font-bold tracking-widest drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
        style={{ textShadow: "4px 4px 0px #2a1b12, -2px -2px 0px #2a1b12, 2px -2px 0px #2a1b12, -2px 2px 0px #2a1b12" }}
      >
        Code In The Dark
      </h2>

      {/* 2. ม้วนกระดาษขนาดเต็มตา ไม่ล้นจอ */}
      <div
        className="relative w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[700px] lg:max-w-[800px] max-h-[75vh] md:max-h-[80vh] aspect-[4/3] flex flex-col items-center justify-center cursor-auto drop-shadow-2xl mx-auto"
        style={{
          backgroundImage: "url('/ui/score.png')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* ดันเนื้อหาลงมาให้พ้นแถบไม้ด้านบน (pt-[16%]) และใช้ justify-center เพื่อให้อยู่กึ่งกลางพื้นที่กระดาษที่เหลือ พร้อมขยับขึ้น 20px ตามที่ต้องการ */}
        <div className="w-full h-full flex flex-col items-center justify-center px-[12%] sm:px-[15%] md:px-[18%] pt-[16%] sm:pt-[18%] md:pt-[20%] pb-[5%] gap-2 sm:gap-3 md:gap-4 -translate-y-5">
          
          <div className="text-center flex flex-col gap-1 md:gap-2">
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center text-[#5c2e0b] font-bold uppercase tracking-widest drop-shadow-sm">
              Choose your Username
            </p>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-center text-[#8b4513]">
              Enter your name to begin the journey
            </p>
          </div>
          
          <div className="w-full flex flex-col gap-1 mt-1 md:mt-2">
            <label className="text-[#5c2e0b] text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-wider ml-1 sm:ml-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Explorer_01"
              maxLength={20}
              className="w-full bg-[#fef3c7] p-2.5 sm:p-3 rounded-xl border-[3px] border-[#5c2e0b] text-[#382503] font-pixel text-lg sm:text-xl md:text-2xl font-bold outline-none focus:bg-white focus:border-[#b45309] focus:ring-4 focus:ring-[#f59e0b]/30 shadow-inner transition-colors placeholder:text-[#8b4513]/60"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="w-full bg-[#7f1d1d]/90 text-[#fef2f2] border-2 md:border-[3px] border-[#b91c1c] px-3 py-2 rounded-xl text-center text-base md:text-lg font-bold shadow-md animate-pulse font-pixel">
              ⚠️ {error}
            </div>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 md:mt-4 bg-[#b45309] hover:bg-[#d97706] text-[#fffbeb] font-bold text-xl md:text-2xl lg:text-3xl px-8 md:px-12 py-2.5 md:py-3 rounded-xl border-b-[4px] border-r-[4px] border-t-[3px] border-l-[3px] border-[#382503] shadow-[0_4px_0px_#2a1b12] active:translate-y-[4px] active:border-b-0 active:border-r-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-75 uppercase tracking-widest relative group overflow-hidden"
          >
            <span className="absolute inset-0 border-t-[3px] border-l-[3px] border-white/20 rounded-lg pointer-events-none" />
            <span className="relative z-10">{loading ? 'Saving...' : 'Confirm'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
