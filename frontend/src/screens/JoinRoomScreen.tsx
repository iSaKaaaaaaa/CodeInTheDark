import { useState } from "react";
import { useSocketStore } from "../store/useSocketStore";
import PixelButton from "../components/PixelButton";
import TopRightMenu from "../components/TopRightMenu";

export default function JoinRoomScreen() {
  const { leaveRoom, joinRoom, joinError } = useSocketStore();
  const [inputCode, setInputCode] = useState('');

  const handleJoinPrivate = () => {
    if (inputCode.trim().length === 6) {
      joinRoom(inputCode.trim());
    } else {
      alert("Please enter a valid 6-digit room code.");
    }
  };



  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center font-pixel cursor-default"
      style={{ backgroundImage: "url('/land-waitroom.png')" }}
    >
      {/* Top Right Username Badge & Logout */}
      <TopRightMenu />

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
          className="absolute top-8 left-[5%] md:top-12 md:left-[8%] w-12 h-12 bg-amber-800/80 hover:bg-amber-700 border-2 border-black rounded-full flex items-center justify-center text-white text-2xl shadow-md transition-transform hover:scale-105 active:scale-95 z-10"
          onClick={leaveRoom}
          title="Back"
        >
          <span>&#8592;</span>
        </button>

        {/* Private Join Section */}
        <div className="w-full flex flex-col items-center gap-2 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-black uppercase">JOIN ROOM CODE</h2>
          
          {joinError && (
            <p className="text-xl text-red-800 font-bold mb-2">{joinError}</p>
          )}

          <div className="flex gap-4">
            <input 
              type="text" 
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.replace(/\\D/g, ''))} // numbers only
              className="w-48 bg-[#f4deb3] border-4 border-[#3d1f0f] rounded-lg px-4 py-2 text-center text-2xl font-bold tracking-widest text-black outline-none shadow-inner"
              placeholder="000000"
            />
            <PixelButton variant="orange" className="px-8 rounded-xl text-xl" onClick={handleJoinPrivate}>
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
          


            
            
            
            
          </div>
        </div>
      </div>

  );
}
