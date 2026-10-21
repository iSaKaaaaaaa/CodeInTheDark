import { useState } from 'react';
import { useSocketStore } from '../store/useSocketStore';

export default function SetUsernameModal() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitUsername = useSocketStore((state) => state.submitUsername);

  const handleSubmit = async () => {
    if (username.trim() === '') {
      setError('กรุณากรอกชื่อผู้เล่น');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await submitUsername(username);
    } catch (err: any) {
      setError(err.message || 'บันทึกชื่อผู้เล่นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
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
      className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 ease-in-out font-pixel cursor-default"
    >
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 w-full max-w-[520px]">
        {/* Title */}
        <h2
          className="text-[#fde68a] text-4xl sm:text-5xl md:text-6xl uppercase text-center relative z-10 font-bold tracking-widest leading-tight whitespace-nowrap"
          style={{ textShadow: "4px 4px 0px #2a1b12, -2px -2px 0px #2a1b12, 2px -2px 0px #2a1b12, -2px 2px 0px #2a1b12, 0 6px 10px rgba(0,0,0,0.8)" }}
        >
          Code In The Dark
        </h2>

        {/* Parchment Modal */}
        <div
          className="relative w-full cursor-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Outer glow */}
          <div className="absolute -inset-3.5 bg-[#f59e0b]/15 rounded-3xl blur-2xl pointer-events-none" />

          {/* Wooden frame — top bar */}
          <div
            className="relative z-10 mx-3 h-5 sm:h-6 rounded-t-md"
            style={{
              background: 'linear-gradient(180deg, #8B5E3C 0%, #6B3F1F 40%, #5C2E18 100%)',
              borderTop: '2.5px solid #A97B50',
              borderLeft: '2.5px solid #7A4E2D',
              borderRight: '2.5px solid #4A2510',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)',
            }} />
            <div className="absolute top-1/2 -translate-y-1/2 left-3 w-2.5 h-2.5 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
            <div className="absolute top-1/2 -translate-y-1/2 right-3 w-2.5 h-2.5 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
          </div>

          {/* Parchment body */}
          <div
            className="relative z-10 mx-1.5 px-6 sm:px-8 md:px-10 py-6 sm:py-7"
            style={{
              background: 'linear-gradient(170deg, #F5E6C8 0%, #EDD9A3 30%, #E8D08E 60%, #DBBF78 100%)',
              borderLeft: '3.5px solid #B8944F',
              borderRight: '3.5px solid #9A7A3D',
              boxShadow: `
                inset 0 0 35px rgba(139, 99, 49, 0.2),
                inset 0 0 70px rgba(139, 99, 49, 0.1),
                4px 0 10px rgba(0,0,0,0.25),
                -4px 0 10px rgba(0,0,0,0.25),
                0 6px 16px rgba(0,0,0,0.35)
              `,
            }}
          >
            {/* Parchment texture overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{
              backgroundImage: `
                radial-gradient(ellipse at 20% 50%, rgba(101,67,33,1) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 20%, rgba(101,67,33,1) 0%, transparent 40%),
                radial-gradient(ellipse at 50% 80%, rgba(101,67,33,1) 0%, transparent 45%)
              `,
            }} />
            <div className="absolute inset-0 pointer-events-none" style={{
              boxShadow: 'inset 0 0 45px rgba(101,67,33,0.15)',
            }} />

            {/* Content */}
            <div className="flex flex-col items-center gap-4 sm:gap-5 relative z-10">
              <div className="text-center flex flex-col items-center gap-1.5">
                <p
                  className="text-3xl sm:text-4xl text-[#4a2408] font-bold uppercase tracking-wider font-pixel"
                  style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.4)' }}
                >
                  ตั้งชื่อผู้เล่น
                </p>
                <p className="text-sm sm:text-base md:text-lg text-[#7c532b] font-thai font-medium">
                  กรอกชื่อของคุณเพื่อเริ่มต้นการผจญภัย
                </p>
              </div>

              {/* Divider */}
              <div className="w-full flex items-center gap-3">
                <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#9A7A3D] to-transparent opacity-60" />
                <div className="w-2 h-2 rotate-45 bg-[#8B6F3A] opacity-80" />
                <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#9A7A3D] to-transparent opacity-60" />
              </div>

              <div className="w-full flex flex-col gap-2">
                <label className="text-[#6d4621] text-sm sm:text-base font-thai font-semibold ml-1">
                  ชื่อผู้เล่น (Username)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="เช่น Explorer_01"
                  maxLength={20}
                  className="w-full bg-[#fef3c7] p-3 sm:p-3.5 rounded-2xl border-3 border-[#5c2e0b] text-[#382503] font-pixel text-2xl sm:text-3xl font-bold outline-none focus:bg-white focus:border-[#b45309] focus:ring-4 focus:ring-[#f59e0b]/40 shadow-inner transition-colors placeholder:text-[#8b4513]/40"
                  autoFocus
                />
              </div>

              {error && (
                <div className="w-full bg-[#7f1d1d]/90 text-[#fef2f2] border-2 border-[#b91c1c] px-4 py-2.5 rounded-xl text-center text-sm sm:text-base font-thai font-medium shadow-md">
                  ⚠ {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || username.trim() === ''}
                className="w-full mt-1 bg-[#b45309] hover:bg-[#d97706] disabled:bg-[#8B6F3A] disabled:opacity-50 disabled:cursor-not-allowed text-[#fffbeb] font-bold text-xl sm:text-2xl py-3 sm:py-3.5 rounded-2xl border-b-[4px] border-r-[4px] border-t-2 border-l-2 border-[#382503] shadow-[0_5px_0px_#2a1b12] active:translate-y-[4px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 uppercase tracking-widest relative overflow-hidden font-thai"
              >
                <span className="absolute inset-0 border-t-2 border-l-2 border-white/15 rounded-xl pointer-events-none" />
                <span className="relative z-10">{loading ? 'กำลังบันทึก...' : 'ยืนยัน'}</span>
              </button>
            </div>
          </div>

          {/* Wooden frame — bottom bar */}
          <div
            className="relative z-10 mx-3 h-5 sm:h-6 rounded-b-md"
            style={{
              background: 'linear-gradient(0deg, #8B5E3C 0%, #6B3F1F 40%, #5C2E18 100%)',
              borderBottom: '2.5px solid #4A2510',
              borderLeft: '2.5px solid #7A4E2D',
              borderRight: '2.5px solid #4A2510',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)',
            }} />
            <div className="absolute top-1/2 -translate-y-1/2 left-3 w-2.5 h-2.5 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
            <div className="absolute top-1/2 -translate-y-1/2 right-3 w-2.5 h-2.5 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
          </div>

          {/* Drop shadow */}
          <div className="absolute -bottom-2 left-8 right-8 h-4 bg-black/20 rounded-full blur-md -z-10" />
        </div>
      </div>
    </div>
  );
}
