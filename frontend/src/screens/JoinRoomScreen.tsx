import { useState } from "react";
import { useSocketStore } from "../store/useSocketStore";
import TopRightMenu from "../components/TopRightMenu";

// Mock public rooms — replace with real data when backend supports it
const MOCK_PUBLIC_ROOMS = [
  { code: '482917', host: 'Pharaoh_X', players: 1 },
  { code: '731058', host: 'SandWalker', players: 1 },
  { code: '295634', host: 'DarkCoder', players: 1 },
];

export default function JoinRoomScreen() {
  const { setScreen, joinRoom, joinError } = useSocketStore();
  const [inputCode, setInputCode] = useState('');
  const [tab, setTab] = useState<'code' | 'public'>('code');

  const handleJoinPrivate = () => {
    if (inputCode.trim().length === 6) {
      joinRoom(inputCode.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinPrivate();
    }
  };

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center font-pixel cursor-default p-4"
      style={{ backgroundImage: "url('/ui/land-waitroom.png')" }}
    >
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7c2d12]/30 via-transparent to-[#450a0a]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      <TopRightMenu />

      {/* Title */}
      <h2
        className="text-[#fde68a] text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-5 uppercase text-center relative z-10 font-bold tracking-widest"
        style={{ textShadow: "4px 4px 0px #2a1b12, -2px -2px 0px #2a1b12, 2px -2px 0px #2a1b12, -2px 2px 0px #2a1b12, 0 6px 10px rgba(0,0,0,0.8)" }}
      >
        Join Room
      </h2>

      {/* Main Panel */}
      <div className="relative w-[min(92vw,560px)] mx-auto z-10">
        {/* Outer glow */}
        <div className="absolute -inset-4 bg-[#f59e0b]/10 rounded-3xl blur-2xl pointer-events-none" />

        {/* Wooden frame — top */}
        <div
          className="relative z-10 mx-3 h-5 sm:h-6 rounded-t-md"
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
          {[0, 1].map(i => (
            <div key={i} className={`absolute top-1/2 -translate-y-1/2 ${i === 0 ? 'left-3' : 'right-3'} w-2 h-2 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]`} />
          ))}
        </div>

        {/* Parchment body */}
        <div
          className="relative z-10 mx-1.5 px-6 sm:px-9 py-7 sm:py-9"
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
          {/* Parchment texture */}
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

          {/* Back button */}
          <button
            className="absolute top-2 left-3 text-[#8B5E3C] hover:text-[#C4553A] active:translate-y-0.5 transition-all duration-75 text-2xl sm:text-3xl font-bold leading-none"
            onClick={() => setScreen('select')}
            title="Back"
            style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.15)' }}
          >
            ←
          </button>

          <div className="flex flex-col items-center gap-4 sm:gap-5">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl border-2 border-[#5c2e0b]/30" style={{
              background: 'linear-gradient(135deg, rgba(244,222,179,0.5) 0%, rgba(222,194,140,0.5) 100%)',
            }}>
              <button
                onClick={() => setTab('code')}
                className={`px-5 sm:px-6 py-2 rounded-lg text-base sm:text-lg font-bold uppercase tracking-wider transition-all duration-150 ${
                  tab === 'code'
                    ? 'bg-[#5c2e0b] text-[#fde68a] shadow-md'
                    : 'text-[#8b6840] hover:text-[#5c2e0b]'
                }`}
              >
                🔑 Enter Code
              </button>
              <button
                onClick={() => setTab('public')}
                className={`px-5 sm:px-6 py-2 rounded-lg text-base sm:text-lg font-bold uppercase tracking-wider transition-all duration-150 ${
                  tab === 'public'
                    ? 'bg-[#5c2e0b] text-[#fde68a] shadow-md'
                    : 'text-[#8b6840] hover:text-[#5c2e0b]'
                }`}
              >
                🌐 Public
              </button>
            </div>

            {/* Divider */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8944F] to-transparent opacity-50" />
              <div className="w-2 h-2 rotate-45 bg-[#B8944F] opacity-60" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8944F] to-transparent opacity-50" />
            </div>

            {/* Tab Content */}
            {tab === 'code' ? (
              /* === Enter Code Tab === */
              <div className="w-full flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <p
                    className="text-2xl sm:text-3xl md:text-4xl text-[#5c2e0b] font-bold uppercase tracking-widest"
                    style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.3)' }}
                  >
                    Private Room
                  </p>
                  <p className="text-sm sm:text-base text-[#8b6840]">
                    Ask the host for their 6-digit code
                  </p>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={handleKeyDown}
                  className="w-full max-w-[320px] bg-[#fef3c7] p-3 sm:p-4 rounded-xl border-[3px] border-[#5c2e0b] text-[#382503] font-pixel text-3xl sm:text-4xl md:text-5xl font-bold text-center tracking-[0.3em] outline-none focus:bg-white focus:border-[#b45309] focus:ring-4 focus:ring-[#f59e0b]/30 shadow-inner transition-colors placeholder:text-[#8b4513]/40 placeholder:tracking-[0.2em]"
                  placeholder="000000"
                  autoFocus
                />

                {joinError && (
                  <div className="w-full bg-[#7f1d1d]/90 text-[#fef2f2] border-2 border-[#b91c1c] px-4 py-2.5 rounded-xl text-center text-base sm:text-lg font-bold shadow-md font-pixel">
                    ⚠ {joinError}
                  </div>
                )}

                <button
                  onClick={handleJoinPrivate}
                  disabled={inputCode.trim().length !== 6}
                  className="bg-[#b45309] hover:bg-[#d97706] disabled:bg-[#8B6F3A] disabled:opacity-50 disabled:cursor-not-allowed text-[#fffbeb] font-bold text-2xl sm:text-3xl px-12 sm:px-16 py-3 sm:py-3.5 rounded-xl border-b-[4px] border-r-[4px] border-t-[3px] border-l-[3px] border-[#382503] shadow-[0_4px_0px_#2a1b12] active:translate-y-[4px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 uppercase tracking-widest relative overflow-hidden mt-1"
                >
                  <span className="absolute inset-0 border-t-[3px] border-l-[3px] border-white/15 rounded-lg pointer-events-none" />
                  <span className="relative z-10">Join</span>
                </button>
              </div>
            ) : (
              /* === Public Lobby Tab === */
              <div className="w-full flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p
                    className="text-xl sm:text-2xl text-[#5c2e0b] font-bold uppercase tracking-widest"
                    style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.3)' }}
                  >
                    Open Rooms
                  </p>
                  <button className="text-sm sm:text-base font-bold text-[#8b6840] hover:text-[#5c2e0b] uppercase tracking-wider transition-colors">
                    ↻ Refresh
                  </button>
                </div>

                {/* Room List */}
                <div className="w-full flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#B8944F transparent' }}>
                  {MOCK_PUBLIC_ROOMS.map((room) => (
                    <div
                      key={room.code}
                      className="w-full flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl border-2 border-[#5c2e0b]/30 hover:border-[#b45309] transition-all cursor-pointer group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(244,222,179,0.7) 0%, rgba(222,194,140,0.7) 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.08)',
                      }}
                      onClick={() => joinRoom(room.code)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#b45309] border-2 border-[#5c2e0b] flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]">
                          {room.host.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg sm:text-xl font-bold text-[#382503] uppercase tracking-wider">
                            {room.host}'s Room
                          </span>
                          <span className="text-sm text-[#8b6840]">
                            {room.players}/2 players
                          </span>
                        </div>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-[#b45309] group-hover:text-[#d97706] uppercase tracking-wider transition-colors">
                        Join →
                      </span>
                    </div>
                  ))}

                  {MOCK_PUBLIC_ROOMS.length === 0 && (
                    <div className="w-full flex flex-col items-center py-6 gap-2">
                      <span className="text-lg sm:text-xl text-[#B8944F] font-bold uppercase tracking-wider">
                        No rooms available
                      </span>
                      <span className="text-sm sm:text-base text-[#B8944F]/70">
                        Create your own or try a code
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wooden frame — bottom */}
        <div
          className="relative z-10 mx-3 h-5 sm:h-6 rounded-b-md"
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
          {[0, 1].map(i => (
            <div key={i} className={`absolute top-1/2 -translate-y-1/2 ${i === 0 ? 'left-3' : 'right-3'} w-2 h-2 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]`} />
          ))}
        </div>

        {/* Drop shadow */}
        <div className="absolute -bottom-2 left-8 right-8 h-4 bg-black/20 rounded-full blur-md -z-10" />
      </div>
    </div>
  );
}
