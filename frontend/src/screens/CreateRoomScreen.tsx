import { useEffect } from "react";
import { useSocketStore } from "../store/useSocketStore";
import PixelButton from "../components/PixelButton";
import TopRightMenu from "../components/TopRightMenu";

export default function CreateRoomScreen() {
  const { username, roomCode, role, players, leaveRoom, createRoom, startGame } = useSocketStore();

  // Create room when the component mounts if not already created
  // Note: For joiners, roomCode will already exist, so createRoom won't fire.
  useEffect(() => {
    if (!roomCode && role === 'driver') {
      createRoom();
    }
  }, [roomCode, role, createRoom]);

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      alert("Room code copied!");
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

        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-4xl md:text-5xl font-bold text-black uppercase">
            ROOM CODE : {roomCode || "------"}
          </h2>
          <button 
            onClick={handleCopyCode}
            className="hover:scale-110 active:scale-95 transition-transform text-3xl"
            title="Copy Code"
          >
            📋
          </button>
        </div>

        {/* Visibility Toggle (Mock) */}
        <div className="flex bg-[#dcb98a] border-2 border-[#572e18] rounded-full overflow-hidden mb-12 shadow-inner">
          <button className="px-8 py-2 bg-[#572e18] text-white font-bold text-lg" disabled>
            PUBLIC
          </button>
          <button className="px-8 py-2 text-black font-bold text-lg bg-transparent">
            PRIVATE (CODE ONLY)
          </button>
        </div>

        {/* Players List (Horizontal) */}
        <div className="w-full flex flex-row gap-8 px-12 mb-12 justify-center">
          {/* Host / Player 1 */}
          <div className="flex-1 flex justify-between items-center bg-[#f4deb3] border-4 border-black rounded-2xl px-8 py-6 shadow-md">
            <span className="text-3xl font-bold text-black uppercase">
              {players.length > 0 ? players[0].username : username || "HOST"}
            </span>
            <span className="text-red-600 font-bold tracking-widest text-2xl">HOST</span>
          </div>
          
          {/* Joiner / Player 2 */}
          <div className={`flex-1 flex justify-center items-center border-4 rounded-2xl px-8 py-6 shadow-md transition-all ${
            players.length > 1 ? "bg-[#f4deb3] border-black" : "bg-[#f4deb3] border-black/50 opacity-70"
          }`}>
            <span className={`text-3xl font-bold ${players.length > 1 ? "text-black uppercase" : "text-black/50"}`}>
              {players.length > 1 ? players[1].username : "Waiting..."}
            </span>
            {players.length > 1 && (
              <span className="ml-auto text-blue-700 font-bold tracking-widest text-xl">NAVIGATOR</span>
            )}
          </div>
        </div>

        
        <div className="w-full flex justify-end items-end px-12 mt-auto">
          
          {role === 'driver' ? (
            <PixelButton 
              variant="orange" 
              className="px-12 py-3 text-2xl rounded-xl"
              onClick={startGame}
              disabled={players.length < 2} // Optional: Disable play if alone
            >
              Play
            </PixelButton>
          ) : (
            <div className="px-12 py-3 text-xl rounded-xl bg-amber-800 border-4 border-[#3d1f0f] text-white font-bold opacity-80 cursor-not-allowed text-center">
              Waiting for Host...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
