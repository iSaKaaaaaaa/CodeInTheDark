import { useSocketStore } from "../store/useSocketStore";
import TopRightMenu from "../components/TopRightMenu";


export default function SelectPlayScreen() {
  const { setScreen, createRoom } = useSocketStore();
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center font-pixel cursor-default overflow-hidden bg-black">
      {/* Original Background with Sunset CSS Filters */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: "url('/ui/landing.png')" }}
      />
      {/* Sunset color overlays to darken and tint the original image */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7c2d12]/40 via-[#9a3412]/30 to-[#450a0a]/60 mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 bg-[#ea580c]/20 mix-blend-color-burn pointer-events-none" />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Top Right Username Badge & Logout */}
      <TopRightMenu />

      <div className="relative z-10 flex flex-col items-center w-full mt-4">
        <div className="absolute inset-0 bg-black/40 blur-2xl rounded-full scale-150 -z-10" />
        <h2 
          className="text-[#fde68a] text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-4 md:mb-6 uppercase text-center font-bold tracking-widest drop-shadow-xl"
          style={{ textShadow: "4px 4px 0px #1a0f0a, -2px -2px 0px #1a0f0a, 2px -2px 0px #1a0f0a, -2px 2px 0px #1a0f0a, 0 6px 10px rgba(0,0,0,0.8)" }}
        >
          Code In The Dark
        </h2>
      </div>

      {/* Scroll Container */}
      <div
        className="relative w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[700px] lg:max-w-[750px] max-h-[55vh] md:max-h-[60vh] aspect-[1.9] flex flex-col items-center justify-center cursor-auto drop-shadow-2xl mx-auto z-10"
        style={{
          backgroundImage: "url('/ui/new-scroll.png')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="w-full h-full flex items-center justify-center gap-4 sm:gap-8 md:gap-12 px-[12%] py-[6%]">
          <button
            onClick={() => createRoom()}
            className="group relative flex flex-col items-center justify-center w-28 h-24 sm:w-32 sm:h-28 md:w-40 md:h-32 lg:w-48 lg:h-36 bg-[#b45309] hover:bg-[#d97706] text-white border-b-[6px] border-r-[6px] border-t-4 border-l-4 border-[#382503] rounded-lg shadow-[0_6px_0px_#2a1b12] active:translate-y-[6px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 outline-none overflow-hidden gap-1 md:gap-2"
          >
            <span className="absolute inset-0 border-t-4 border-l-4 border-white/20 rounded-md pointer-events-none" />
            <svg 
              className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#F6C453] group-hover:rotate-90 transition-transform duration-200" 
              viewBox="0 0 24 24" fill="currentColor"
              style={{ filter: 'drop-shadow(2px 2px 0px #26140B)' }}
            >
              <path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8V2z" />
            </svg>
            <span 
              className="text-lg md:text-xl lg:text-2xl font-bold tracking-widest uppercase text-center leading-tight"
              style={{ textShadow: '2px 2px 0px #26140B' }}
            >
              <span className="text-[#F6C453]">Create</span><br/>Room
            </span>
          </button>

          <button
            onClick={() => setScreen('join')}
            className="group relative flex flex-col items-center justify-center w-28 h-24 sm:w-32 sm:h-28 md:w-40 md:h-32 lg:w-48 lg:h-36 bg-[#b45309] hover:bg-[#d97706] text-white border-b-[6px] border-r-[6px] border-t-4 border-l-4 border-[#382503] rounded-lg shadow-[0_6px_0px_#2a1b12] active:translate-y-[6px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 outline-none overflow-hidden gap-1 md:gap-2"
          >
            <span className="absolute inset-0 border-t-4 border-l-4 border-white/20 rounded-md pointer-events-none" />
            <svg 
              className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#2DD4BF] group-hover:scale-110 transition-transform duration-200" 
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter"
              style={{ filter: 'drop-shadow(2px 2px 0px #26140B)' }}
            >
              <circle cx="10" cy="10" r="7" />
              <line x1="15" y1="15" x2="21" y2="21" />
            </svg>
            <span 
              className="text-lg md:text-xl lg:text-2xl font-bold tracking-widest uppercase text-center leading-tight"
              style={{ textShadow: '2px 2px 0px #26140B' }}
            >
              <span className="text-[#2DD4BF]">Join</span><br/>Room
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
