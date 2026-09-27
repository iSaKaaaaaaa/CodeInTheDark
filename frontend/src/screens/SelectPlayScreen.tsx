import { useSocketStore } from "../store/useSocketStore";
import TopRightMenu from "../components/TopRightMenu";

export default function SelectPlayScreen() {
  const { setScreen, createRoom } = useSocketStore();

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center font-pixel cursor-default overflow-hidden bg-black p-4">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: "url('/ui/landing.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#7c2d12]/40 via-[#9a3412]/30 to-[#450a0a]/60 mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 bg-[#ea580c]/20 mix-blend-color-burn pointer-events-none" />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <TopRightMenu />

      {/* Title */}
      <div className="relative z-10 flex flex-col items-center mb-4 md:mb-6">
        <div className="absolute inset-0 bg-black/40 blur-2xl rounded-full scale-150 -z-10" />
        <h2
          className="text-[#fde68a] text-4xl md:text-5xl lg:text-6xl xl:text-7xl uppercase text-center font-bold tracking-widest"
          style={{ textShadow: "4px 4px 0px #1a0f0a, -2px -2px 0px #1a0f0a, 2px -2px 0px #1a0f0a, -2px 2px 0px #1a0f0a, 0 6px 10px rgba(0,0,0,0.8)" }}
        >
          Code In The Dark
        </h2>
      </div>

      {/* Panel */}
      <div className="relative w-[min(92vw,480px)] mx-auto z-10">
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
          className="relative z-10 mx-1.5 px-5 sm:px-8 md:px-10 py-6 sm:py-8"
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

          <div className="flex flex-col items-center gap-4 sm:gap-5">
            {/* Heading */}
            <p
              className="text-xl sm:text-2xl md:text-3xl text-[#5c2e0b] font-bold uppercase tracking-widest text-center"
              style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.3)' }}
            >
              Choose Your Path
            </p>

            {/* Divider */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8944F] to-transparent opacity-50" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#B8944F] opacity-60" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8944F] to-transparent opacity-50" />
            </div>

            {/* Buttons */}
            <div className="w-full flex flex-col gap-3 sm:gap-4">
              {/* Create Room */}
              <button
                onClick={() => createRoom()}
                className="group w-full flex items-center gap-4 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border-2 border-[#5c2e0b]/40 hover:border-[#b45309] transition-all relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(244,222,179,0.8) 0%, rgba(222,194,140,0.8) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {/* Icon */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-[#b45309] border-2 border-[#5c2e0b] flex items-center justify-center shrink-0 shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] group-hover:bg-[#d97706] transition-colors">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#F6C453]" viewBox="0 0 24 24" fill="currentColor" style={{ filter: 'drop-shadow(1px 1px 0px #26140B)' }}>
                    <path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8V2z" />
                  </svg>
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#382503] uppercase tracking-wider" style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.2)' }}>
                    Create Room
                  </span>
                  <span className="text-xs sm:text-sm text-[#8b6840]">
                    Host a new game for others to join
                  </span>
                </div>
              </button>

              {/* Join Room */}
              <button
                onClick={() => setScreen('join')}
                className="group w-full flex items-center gap-4 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border-2 border-[#5c2e0b]/40 hover:border-[#2B6CB0] transition-all relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(244,222,179,0.8) 0%, rgba(222,194,140,0.8) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {/* Icon */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-[#2B6CB0] border-2 border-[#1A365D] flex items-center justify-center shrink-0 shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] group-hover:bg-[#3182CE] transition-colors">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#90CDF4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" style={{ filter: 'drop-shadow(1px 1px 0px #1A365D)' }}>
                    <circle cx="10" cy="10" r="7" />
                    <line x1="15" y1="15" x2="21" y2="21" />
                  </svg>
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#382503] uppercase tracking-wider" style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.2)' }}>
                    Join Room
                  </span>
                  <span className="text-xs sm:text-sm text-[#8b6840]">
                    Enter a code or browse public rooms
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
