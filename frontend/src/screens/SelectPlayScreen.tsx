import { useSocketStore } from "../store/useSocketStore";
import TopRightMenu from "../components/TopRightMenu";


export default function SelectPlayScreen() {
  const { setScreen, createRoom } = useSocketStore();

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center font-pixel cursor-default"
      style={{ backgroundImage: "url('/landing.png')" }}
    >
      {/* Top Right Username Badge & Logout */}
      <TopRightMenu />

      <h1 className="text-black text-6xl md:text-8xl font-bold mb-8 drop-shadow-xl z-10">
        Code In The Dark
      </h1>

      {/* Scroll Container */}
      <div
        className="relative w-full max-w-[800px] h-[500px] flex items-center justify-center"
        style={{
          backgroundImage: "url('/new-scroll.png')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="flex gap-10 md:gap-20 mt-4">
          <button
            onClick={() => createRoom()}
            className="group relative flex flex-col items-center justify-center w-36 h-36 md:w-48 md:h-48 bg-[#d08b46] border-4 border-[#3d1f0f] rounded-2xl active:translate-y-2 transition-transform outline-none"
            style={{
              boxShadow: "inset -4px -4px 0px 0px rgba(0,0,0,0.3), inset 4px 4px 0px 0px rgba(255,255,255,0.4), 0px 8px 0px 0px #3d1f0f, 0px 12px 10px rgba(0,0,0,0.5)"
            }}
            onMouseDown={(e) => e.currentTarget.style.boxShadow = "inset -4px -4px 0px 0px rgba(0,0,0,0.3), inset 4px 4px 0px 0px rgba(255,255,255,0.4), 0px 0px 0px 0px #3d1f0f, 0px 4px 5px rgba(0,0,0,0.5)"}
            onMouseUp={(e) => e.currentTarget.style.boxShadow = "inset -4px -4px 0px 0px rgba(0,0,0,0.3), inset 4px 4px 0px 0px rgba(255,255,255,0.4), 0px 8px 0px 0px #3d1f0f, 0px 12px 10px rgba(0,0,0,0.5)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "inset -4px -4px 0px 0px rgba(0,0,0,0.3), inset 4px 4px 0px 0px rgba(255,255,255,0.4), 0px 8px 0px 0px #3d1f0f, 0px 12px 10px rgba(0,0,0,0.5)"}
          >
            <span className="text-4xl mb-3 text-white drop-shadow-md group-hover:scale-110 transition-transform">⊕</span>
            <span className="text-xl md:text-2xl font-bold text-white drop-shadow-md tracking-wider">Create</span>
            <span className="text-xl md:text-2xl font-bold text-white drop-shadow-md tracking-wider">Room</span>
          </button>

          <button
            onClick={() => setScreen('join')}
            className="group relative flex flex-col items-center justify-center w-36 h-36 md:w-48 md:h-48 bg-[#d08b46] border-4 border-[#3d1f0f] rounded-2xl active:translate-y-2 transition-transform outline-none"
            style={{
              boxShadow: "inset -4px -4px 0px 0px rgba(0,0,0,0.3), inset 4px 4px 0px 0px rgba(255,255,255,0.4), 0px 8px 0px 0px #3d1f0f, 0px 12px 10px rgba(0,0,0,0.5)"
            }}
            onMouseDown={(e) => e.currentTarget.style.boxShadow = "inset -4px -4px 0px 0px rgba(0,0,0,0.3), inset 4px 4px 0px 0px rgba(255,255,255,0.4), 0px 0px 0px 0px #3d1f0f, 0px 4px 5px rgba(0,0,0,0.5)"}
            onMouseUp={(e) => e.currentTarget.style.boxShadow = "inset -4px -4px 0px 0px rgba(0,0,0,0.3), inset 4px 4px 0px 0px rgba(255,255,255,0.4), 0px 8px 0px 0px #3d1f0f, 0px 12px 10px rgba(0,0,0,0.5)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "inset -4px -4px 0px 0px rgba(0,0,0,0.3), inset 4px 4px 0px 0px rgba(255,255,255,0.4), 0px 8px 0px 0px #3d1f0f, 0px 12px 10px rgba(0,0,0,0.5)"}
          >
            <span className="text-4xl mb-3 text-white drop-shadow-md group-hover:scale-110 transition-transform">🔍</span>
            <span className="text-xl md:text-2xl font-bold text-white drop-shadow-md tracking-wider">Join</span>
            <span className="text-xl md:text-2xl font-bold text-white drop-shadow-md tracking-wider">Room</span>
          </button>
        </div>
      </div>
    </div>
  );
}
