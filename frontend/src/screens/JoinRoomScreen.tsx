import { useState } from "react";
import { useSocketStore } from "../store/useSocketStore";
import PixelButton from "../components/PixelButton";

export default function JoinRoomScreen() {
  const { username, leaveRoom, joinRoom } = useSocketStore();
  const [inputCode, setInputCode] = useState('');

  const handleJoinPrivate = () => {
    if (inputCode.trim().length === 6) {
      joinRoom(inputCode.trim());
    } else {
      alert("Please enter a valid 6-digit room code.");
    }
  };

  const handleJoinPublic = (code: string) => {
    joinRoom(code);
  };

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center font-pixel cursor-default"
      style={{ backgroundImage: "url('/land-waitroom.png')" }}
    >
      {/* Top Right Username Badge */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
        <button className="w-10 h-10 bg-amber-800/80 hover:bg-amber-700 border-2 border-black rounded-full flex items-center justify-center text-white text-xl">
          <span role="img" aria-label="sound">🔊</span>
        </button>
        <div className="bg-amber-800/80 border-2 border-black rounded-full px-4 py-2 flex items-center gap-2 text-white shadow-lg">
          <span className="font-bold tracking-wider">{username || "PLAYER"}</span>
          <span role="img" aria-label="user" className="bg-white text-amber-900 rounded-full w-6 h-6 flex items-center justify-center text-xs">👤</span>
        </div>
        <button className="w-10 h-10 bg-amber-800/80 hover:bg-amber-700 border-2 border-black rounded-full flex items-center justify-center text-white text-xl" onClick={leaveRoom}>
          <span role="img" aria-label="exit">🚪</span>
        </button>
      </div>

      {/* Scroll Container */}
      <div
        className="relative w-full max-w-[900px] h-[600px] md:max-w-[1000px] md:h-[650px] flex flex-col items-center pt-24 px-20 pb-16 z-10"
        style={{
          backgroundImage: "url('/waitroom.png')",
          backgroundSize: '130% 130%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <button
          className="absolute top-10 left-12 md:top-14 md:left-14 text-black text-4xl font-bold hover:text-orange-700 transition-colors flex items-center gap-2 z-10 drop-shadow-sm font-pixel"
          onClick={leaveRoom}
        >
          <span>&#8592;</span>
        </button>

        {/* Private Join Section */}
        <div className="w-full flex flex-col items-center gap-2 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-black uppercase">ROOM CODE</h2>
          <div className="flex gap-4">
            <input 
              type="text" 
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.replace(/\\D/g, ''))} // numbers only
              className="w-48 bg-[#f4deb3] border-4 border-[#3d1f0f] rounded-lg px-4 py-2 text-center text-2xl font-bold tracking-widest text-black outline-none shadow-inner"
              placeholder="000000"
            />
            <PixelButton variant="orange" className="px-8 text-xl" onClick={handleJoinPrivate}>
              Join
            </PixelButton>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-1 bg-[#572e18]/30 my-2 rounded-full"></div>

        {/* Public Lobby Section */}
        <div className="w-full flex flex-col mt-2 flex-grow overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-black uppercase">PUBLIC LOBBY</h2>
            <button className="text-sm font-bold bg-[#572e18] text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-[#3d1f0f]">
              <span>↻</span> Refresh
            </button>
          </div>
          
          {/* Mock List */}
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar pb-4">
            {/* Mock Room 1 */}
            <div className="flex justify-between items-center bg-[#f4deb3] border-2 border-black rounded-xl p-3 shadow-sm hover:border-[#572e18] transition-colors">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-black">Host: INWZAA007</span>
                <span className="text-sm text-amber-900 font-bold">Mode: HTML / CSS (Navigator required)</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-black bg-white/50 px-2 py-1 rounded-md border border-black/20">1/2</span>
                <PixelButton variant="orange" className="px-6 py-1 text-sm" onClick={() => handleJoinPublic('111111')}>
                  Join
                </PixelButton>
              </div>
            </div>

            {/* Mock Room 2 */}
            <div className="flex justify-between items-center bg-[#f4deb3] border-2 border-black rounded-xl p-3 shadow-sm hover:border-[#572e18] transition-colors">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-black">Host: ProCoder123</span>
                <span className="text-sm text-amber-900 font-bold">Mode: Javascript (Navigator required)</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-black bg-white/50 px-2 py-1 rounded-md border border-black/20">1/2</span>
                <PixelButton variant="orange" className="px-6 py-1 text-sm" onClick={() => handleJoinPublic('222222')}>
                  Join
                </PixelButton>
              </div>
            </div>
            
            {/* Mock Room 3 */}
            <div className="flex justify-between items-center bg-[#f4deb3] border-2 border-black rounded-xl p-3 shadow-sm hover:border-[#572e18] transition-colors opacity-60">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-black">Host: CodingMaster</span>
                <span className="text-sm text-amber-900 font-bold">Mode: HTML / CSS</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-black bg-white/50 px-2 py-1 rounded-md border border-black/20">2/2</span>
                <PixelButton variant="wood" className="px-6 py-1 text-sm cursor-not-allowed opacity-50">
                  Full
                </PixelButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
