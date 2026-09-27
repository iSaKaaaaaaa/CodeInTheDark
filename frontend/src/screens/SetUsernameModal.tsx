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
      className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4 pb-[12vh] backdrop-blur-sm transition-opacity duration-300 ease-in-out font-pixel cursor-default"
    >
      {/* Title สไตล์ 3D โทนส้ม-ครีมสว่าง ขนาดเด่นชัด */}
      <h2
        className="text-[#fde68a] text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-5 md:mb-7 uppercase text-center relative z-10 font-bold tracking-widest drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
        style={{ textShadow: "4px 4px 0px #2a1b12, -2px -2px 0px #2a1b12, 2px -2px 0px #2a1b12, -2px 2px 0px #2a1b12, 0 6px 10px rgba(0,0,0,0.8)" }}
      >
        Code In The Dark
      </h2>

      {/* Parchment Modal - ใช้ระบบเดียวกับ LoginModal */}
      <div
        className="relative w-[min(90vw,400px)] mx-auto cursor-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outer glow */}
        <div className="absolute -inset-3 bg-[#f59e0b]/15 rounded-3xl blur-2xl pointer-events-none" />

        {/* Wooden frame — top bar */}
        <div
          className="relative z-10 mx-3 h-4 sm:h-5 rounded-t-md"
          style={{
            background: 'linear-gradient(180deg, #8B5E3C 0%, #6B3F1F 40%, #5C2E18 100%)',
            borderTop: '2px solid #A97B50',
            borderLeft: '2px solid #7A4E2D',
            borderRight: '2px solid #4A2510',
            boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)',
          }} />
          <div className="absolute top-1/2 -translate-y-1/2 left-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" />
          <div className="absolute top-1/2 -translate-y-1/2 right-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" />
        </div>

        {/* Parchment body */}
        <div
          className="relative z-10 mx-1.5 px-5 sm:px-7 pt-6 sm:pt-8 pb-5 sm:pb-7"
          style={{
            background: 'linear-gradient(170deg, #F5E6C8 0%, #EDD9A3 30%, #E8D08E 60%, #DBBF78 100%)',
            borderLeft: '3px solid #B8944F',
            borderRight: '3px solid #9A7A3D',
            boxShadow: `
              inset 0 0 30px rgba(139, 99, 49, 0.15),
              inset 0 0 60px rgba(139, 99, 49, 0.08),
              4px 0 8px rgba(0,0,0,0.2),
              -4px 0 8px rgba(0,0,0,0.2),
              0 4px 12px rgba(0,0,0,0.3)
            `,
          }}
        >
          {/* Parchment texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 50%, rgba(101,67,33,1) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(101,67,33,1) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 80%, rgba(101,67,33,1) 0%, transparent 45%)
            `,
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            boxShadow: 'inset 0 0 40px rgba(101,67,33,0.12)',
          }} />

          {/* Content */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 relative z-10">
            <div className="text-center flex flex-col gap-0.5">
              <p
                className="text-xl sm:text-2xl md:text-3xl text-[#5c2e0b] font-bold uppercase tracking-widest"
                style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.3)' }}
              >
                Choose Username
              </p>
              <p className="text-xs sm:text-sm md:text-base text-[#8b6840]">
                Enter your name to begin the journey
              </p>
            </div>

            {/* Divider */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8944F] to-transparent opacity-50" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#B8944F] opacity-60" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8944F] to-transparent opacity-50" />
            </div>

            <div className="w-full flex flex-col gap-1.5 mt-1">
              <label className="text-[#8b6840] text-xs sm:text-sm font-bold uppercase tracking-widest ml-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Explorer_01"
                maxLength={20}
                className="w-full bg-[#fef3c7] p-2.5 sm:p-3 rounded-xl border-[3px] border-[#5c2e0b] text-[#382503] font-pixel text-lg sm:text-xl font-bold outline-none focus:bg-white focus:border-[#b45309] focus:ring-4 focus:ring-[#f59e0b]/30 shadow-inner transition-colors placeholder:text-[#8b4513]/40"
                autoFocus
              />
            </div>

            {error && (
              <div className="w-full bg-[#7f1d1d]/90 text-[#fef2f2] border-2 border-[#b91c1c] px-3 py-2 rounded-xl text-center text-sm sm:text-base font-bold shadow-md font-pixel">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || username.trim() === ''}
              className="w-full mt-2 bg-[#b45309] hover:bg-[#d97706] disabled:bg-[#8B6F3A] disabled:opacity-50 disabled:cursor-not-allowed text-[#fffbeb] font-bold text-lg sm:text-xl py-2.5 sm:py-3 rounded-xl border-b-[4px] border-r-[4px] border-t-2 border-l-2 border-[#382503] shadow-[0_4px_0px_#2a1b12] active:translate-y-[4px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 uppercase tracking-widest relative overflow-hidden"
            >
              <span className="absolute inset-0 border-t-[2px] border-l-[2px] border-white/15 rounded-lg pointer-events-none" />
              <span className="relative z-10">{loading ? 'Saving...' : 'Confirm'}</span>
            </button>
          </div>
        </div>

        {/* Wooden frame — bottom bar */}
        <div
          className="relative z-10 mx-3 h-4 sm:h-5 rounded-b-md"
          style={{
            background: 'linear-gradient(0deg, #8B5E3C 0%, #6B3F1F 40%, #5C2E18 100%)',
            borderBottom: '2px solid #4A2510',
            borderLeft: '2px solid #7A4E2D',
            borderRight: '2px solid #4A2510',
            boxShadow: '0 4px 8px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)',
          }} />
          <div className="absolute top-1/2 -translate-y-1/2 left-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" />
          <div className="absolute top-1/2 -translate-y-1/2 right-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" />
        </div>

        {/* Drop shadow */}
        <div className="absolute -bottom-2 left-6 right-6 h-4 bg-black/20 rounded-full blur-md -z-10" />
      </div>
    </div>
  );
}
