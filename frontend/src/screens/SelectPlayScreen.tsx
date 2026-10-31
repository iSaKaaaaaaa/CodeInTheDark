import { useSocketStore } from "../store/useSocketStore";
import TopRightMenu from "../components/TopRightMenu";

/**
 * หน้าจอเลือกโหมดการเล่น (Select Play Mode Screen):
 * - แสดงตัวเลือก Host Game (สร้างห้องเล่นใหม่สำหรับ 2 คน)
 * - แสดงตัวเลือก Join Game (ค้นหาหรือใส่รหัส 6 หลักเพื่อเข้าร่วมห้อง)
 * - รวมเมนู TopRightMenu แสดงโปรไฟล์ จำนวนเหรียญ และตัวควบคุมเสียง
 */
export default function SelectPlayScreen() {
  const { setScreen, createRoom } = useSocketStore();

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center font-pixel cursor-default overflow-hidden bg-black p-4">
      {/* ภาพพื้นหลังพร้อมฟิลเตอร์แสงเงา */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: "url('/ui/landing.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#7c2d12]/40 via-[#9a3412]/30 to-[#450a0a]/60 mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 bg-[#ea580c]/20 mix-blend-color-burn pointer-events-none" />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* เมนูผู้ใช้และเสียง */}
      <TopRightMenu />

      {/* หัวข้อชื่อเกม */}
      <div className="relative z-10 flex flex-col items-center mb-3.5 md:mb-5">
        <div className="absolute inset-0 bg-black/40 blur-2xl rounded-full scale-150 -z-10" />
        <h2
          className="text-[#fde68a] text-4xl sm:text-5xl md:text-6xl uppercase text-center font-bold tracking-widest font-pixel"
          style={{ textShadow: "4px 4px 0px #1a0f0a, -2px -2px 0px #1a0f0a, 2px -2px 0px #1a0f0a, -2px 2px 0px #1a0f0a, 0 6px 12px rgba(0,0,0,0.85)" }}
        >
          Code In The Dark
        </h2>
      </div>

      {/* กล่องตัวเลือกโหมดการเล่น (Select Mode Panel) */}
      <div className="relative w-[min(94vw,680px)] mx-auto z-10">
        {/* Outer glow */}
        <div className="absolute -inset-3.5 bg-[#f59e0b]/15 rounded-3xl blur-2xl pointer-events-none" />

        {/* Wooden frame — top */}
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
          {[0, 1].map(i => (
            <div key={i} className={`absolute top-1/2 -translate-y-1/2 ${i === 0 ? 'left-3' : 'right-3'} w-2.5 h-2.5 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]`} />
          ))}
        </div>

        {/* Parchment body */}
        <div
          className="relative z-10 mx-1.5 px-6 sm:px-8 md:px-9 py-6 sm:py-7"
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
          {/* Parchment texture */}
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

          <div className="flex flex-col items-center gap-4 sm:gap-5 font-game-body">
            {/* Heading */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <h3
                className="text-2xl sm:text-3xl text-[#3d1f0f] font-bungee uppercase tracking-wide"
                style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.5)' }}
              >
                SELECT MODE
              </h3>
              <p className="text-sm sm:text-base text-[#5c2e0b] font-game-body font-medium tracking-wide">
                Choose how you want to play
              </p>
            </div>

            {/* Divider */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#9A7A3D] to-transparent opacity-60" />
              <div className="w-2 h-2 rotate-45 bg-[#8B6F3A] opacity-80" />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#9A7A3D] to-transparent opacity-60" />
            </div>

            {/* Buttons */}
            <div className="w-full flex flex-col gap-3.5 sm:gap-4 font-game-body">
              {/* Create Room */}
              <button
                onClick={() => createRoom()}
                className="group w-full flex items-center gap-4 sm:gap-4.5 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl border-2 border-[#5c2e0b]/50 hover:border-[#b45309] transition-all relative overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, rgba(248,228,190,0.95) 0%, rgba(228,200,150,0.95) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 6px rgba(0,0,0,0.12)',
                }}
              >
                {/* Icon */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#b45309] border-2 border-[#5c2e0b] flex items-center justify-center shrink-0 shadow-[inset_0_-2.5px_0_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.2)] group-hover:bg-[#d97706] transition-colors">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#F6C453]" viewBox="0 0 24 24" fill="currentColor" style={{ filter: 'drop-shadow(1px 1px 0px #26140B)' }}>
                    <path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8V2z" />
                  </svg>
                </div>
                <div className="flex flex-col items-start gap-0.5 min-w-0">
                  <span className="text-base sm:text-lg md:text-xl font-bungee text-[#2a1306] uppercase tracking-wide" style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.4)' }}>
                    HOST GAME
                  </span>
                  <span className="text-xs sm:text-sm md:text-base text-[#5c2e0b] font-game-body font-medium text-left leading-snug">
                    Create room for 2 players
                  </span>
                </div>
              </button>

              {/* Join Room */}
              <button
                onClick={() => setScreen('join')}
                className="group w-full flex items-center gap-4 sm:gap-4.5 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl border-2 border-[#5c2e0b]/50 hover:border-[#2B6CB0] transition-all relative overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, rgba(248,228,190,0.95) 0%, rgba(228,200,150,0.95) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 6px rgba(0,0,0,0.12)',
                }}
              >
                {/* Icon */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#2B6CB0] border-2 border-[#1A365D] flex items-center justify-center shrink-0 shadow-[inset_0_-2.5px_0_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.2)] group-hover:bg-[#3182CE] transition-colors">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#90CDF4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" style={{ filter: 'drop-shadow(1px 1px 0px #1A365D)' }}>
                    <circle cx="10" cy="10" r="7" />
                    <line x1="15" y1="15" x2="21" y2="21" />
                  </svg>
                </div>
                <div className="flex flex-col items-start gap-0.5 min-w-0">
                  <span className="text-base sm:text-lg md:text-xl font-bungee text-[#2a1306] uppercase tracking-wide" style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.4)' }}>
                    JOIN GAME
                  </span>
                  <span className="text-xs sm:text-sm md:text-base text-[#5c2e0b] font-game-body font-medium text-left leading-snug">
                    Enter 6-digit room code
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Wooden frame — bottom */}
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
          {[0, 1].map(i => (
            <div key={i} className={`absolute top-1/2 -translate-y-1/2 ${i === 0 ? 'left-3' : 'right-3'} w-2.5 h-2.5 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]`} />
          ))}
        </div>

        {/* Drop shadow */}
        <div className="absolute -bottom-2 left-8 right-8 h-4 bg-black/20 rounded-full blur-md -z-10" />
      </div>
    </div>
  );
}
