import { useEffect } from "react";
import { useSocketStore } from "../store/useSocketStore";
import PixelButton from "../components/PixelButton";

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
      {/* Top Right Username Badge */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
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

        {/* Chat Box & Play Button */}
        <div className="w-full flex justify-between items-end px-12 mt-auto">
          <div className="flex flex-col gap-2 w-1/2">
            <span className="text-lg font-bold text-amber-900 tracking-wider">CHAT BOX</span>
            <input 
              type="text" 
              placeholder="Enter the message" 
              className="bg-[#f4deb3] border-2 border-amber-900 rounded-xl px-4 py-3 outline-none text-black placeholder:text-black/40 text-lg w-full"
            />
          </div>
          
          {role === 'driver' ? (
            <PixelButton 
              variant="orange" 
              className="px-16 py-4 text-3xl rounded-xl"
              onClick={startGame}
              disabled={players.length < 2} // Optional: Disable play if alone
            >
              Play
            </PixelButton>
          ) : (
            <div className="px-16 py-4 text-2xl rounded-xl bg-amber-800 border-4 border-[#3d1f0f] text-white font-bold opacity-80 cursor-not-allowed text-center">
              Waiting for Host...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
