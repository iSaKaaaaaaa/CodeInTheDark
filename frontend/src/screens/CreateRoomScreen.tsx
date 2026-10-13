import { useEffect, useState } from "react";
import { useSocketStore } from "../store/useSocketStore";
import TopRightMenu from "../components/TopRightMenu";

export default function CreateRoomScreen() {
  const { username, roomCode, role, players, leaveRoom, createRoom, startGame } = useSocketStore();
  const isHost = players.length > 0 ? players[0].username === username : role === 'driver';
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (!roomCode && role === 'driver') {
      createRoom();
    }
  }, [roomCode, role, createRoom]);

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const roomName = `${username || 'Explorer'}'s Room`;

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
        Room Lobby
      </h2>

      {/* Main Panel */}
      <div className="relative w-[min(92vw,580px)] mx-auto z-10">
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

          {/* Back button */}
          <button
            className="absolute top-2 left-3 text-[#8B5E3C] hover:text-[#C4553A] active:translate-y-0.5 transition-all duration-75 text-xl sm:text-2xl font-bold leading-none"
            onClick={leaveRoom}
            title="Back"
            style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.15)' }}
          >
            ←
          </button>

          <div className="flex flex-col items-center gap-4 sm:gap-5">
            {/* Room Name + Code */}
            <div className="flex flex-col items-center gap-1.5">
              <p
                className="text-2xl sm:text-3xl md:text-4xl text-[#5c2e0b] font-bold uppercase tracking-wider"
                style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.3)' }}
              >
                {roomName}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base text-[#8b6840] uppercase tracking-widest font-bold">
                  Code:
                </span>
                <span
                  className="text-3xl sm:text-4xl md:text-5xl text-[#5c2e0b] font-bold tracking-[0.2em] uppercase"
                  style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.3)' }}
                >
                  {roomCode || "------"}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="relative bg-[#5c2e0b] hover:bg-[#7a3f12] text-[#fde68a] w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-b-[3px] border-r-[3px] border-t-2 border-l-2 border-[#382503] shadow-[0_3px_0px_#2a1b12] active:translate-y-[3px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 flex items-center justify-center text-lg sm:text-xl font-bold"
                  title="Copy Code"
                >
                  <span className="absolute inset-0 border-t border-l border-white/10 rounded-lg pointer-events-none" />
                  {copied ? "✓" : "⎘"}
                </button>
              </div>
            </div>

            {/* Visibility Toggle */}
            {isHost && (
              <div className="flex items-center gap-1 p-1 rounded-xl border-2 border-[#5c2e0b]/30" style={{
                background: 'linear-gradient(135deg, rgba(244,222,179,0.5) 0%, rgba(222,194,140,0.5) 100%)',
              }}>
                <button
                  onClick={() => setIsPublic(false)}
                  className={`px-5 sm:px-6 py-2 rounded-lg text-base sm:text-lg font-bold uppercase tracking-wider transition-all duration-150 ${
                    !isPublic
                      ? 'bg-[#5c2e0b] text-[#fde68a] shadow-md'
                      : 'text-[#8b6840] hover:text-[#5c2e0b]'
                  }`}
                >
                  🔒 Private
                </button>
                <button
                  onClick={() => setIsPublic(true)}
                  className={`px-5 sm:px-6 py-2 rounded-lg text-base sm:text-lg font-bold uppercase tracking-wider transition-all duration-150 ${
                    isPublic
                      ? 'bg-[#5c2e0b] text-[#fde68a] shadow-md'
                      : 'text-[#8b6840] hover:text-[#5c2e0b]'
                  }`}
                >
                  🌐 Public
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8944F] to-transparent opacity-50" />
              <div className="w-2 h-2 rotate-45 bg-[#B8944F] opacity-60" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8944F] to-transparent opacity-50" />
            </div>

            {/* Players Section */}
            <div className="w-full flex flex-col gap-3">
              <p className="text-sm sm:text-base text-[#8b6840] uppercase tracking-widest text-center font-bold">
                Players
              </p>

              {/* Player 1 — Host */}
              <div
                className="w-full flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl border-2 border-[#5c2e0b]/40"
                style={{
                  background: 'linear-gradient(135deg, rgba(244,222,179,0.8) 0%, rgba(222,194,140,0.8) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#b45309] border-2 border-[#5c2e0b] flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]">
                    {(players.length > 0 ? players[0].username : username || "H").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[#382503] uppercase tracking-wider">
                    {players.length > 0 ? players[0].username : username || "HOST"}
                  </span>
                </div>
                <span
                  className="text-base sm:text-lg font-bold tracking-widest uppercase px-3 py-1 rounded-md"
                  style={{
                    color: '#9B2C2C',
                    background: 'rgba(155, 44, 44, 0.1)',
                    border: '1px solid rgba(155, 44, 44, 0.25)',
                  }}
                >
                  Host
                </span>
              </div>

              {/* Player 2 — Guest / Waiting */}
              <div
                className={`w-full flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl border-2 transition-all ${
                  players.length > 1
                    ? 'border-[#5c2e0b]/40'
                    : 'border-dashed border-[#B8944F]/50'
                }`}
                style={{
                  background: players.length > 1
                    ? 'linear-gradient(135deg, rgba(244,222,179,0.8) 0%, rgba(222,194,140,0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(244,222,179,0.3) 0%, rgba(222,194,140,0.3) 100%)',
                  boxShadow: players.length > 1
                    ? 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.1)'
                    : 'none',
                }}
              >
                {players.length > 1 ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#2B6CB0] border-2 border-[#1A365D] flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]">
                        {players[1].username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[#382503] uppercase tracking-wider">
                        {players[1].username}
                      </span>
                    </div>
                    <span
                      className="text-base sm:text-lg font-bold tracking-widest uppercase px-3 py-1 rounded-md"
                      style={{
                        color: '#2B6CB0',
                        background: 'rgba(43, 108, 176, 0.1)',
                        border: '1px solid rgba(43, 108, 176, 0.25)',
                      }}
                    >
                      Guest
                    </span>
                  </>
                ) : (
                  <div className="w-full flex flex-col items-center py-1.5 gap-1">
                    <span className="text-lg sm:text-xl text-[#B8944F] font-bold uppercase tracking-wider">
                      Waiting for opponent...
                    </span>
                    <span className="text-sm sm:text-base text-[#B8944F]/80">
                      {isPublic ? 'Visible in public lobby' : 'Share the room code above'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8944F] to-transparent opacity-50" />
              <div className="w-2 h-2 rotate-45 bg-[#B8944F] opacity-60" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8944F] to-transparent opacity-50" />
            </div>

            {/* Action Button */}
            <div className="w-full flex justify-center">
              {isHost ? (
                <button
                  onClick={startGame}
                  disabled={players.length < 2}
                  className="bg-[#b45309] hover:bg-[#d97706] disabled:bg-[#8B6F3A] disabled:opacity-50 disabled:cursor-not-allowed text-[#fffbeb] font-bold text-2xl sm:text-3xl px-12 sm:px-16 py-3 sm:py-3.5 rounded-xl border-b-[4px] border-r-[4px] border-t-[3px] border-l-[3px] border-[#382503] shadow-[0_4px_0px_#2a1b12] active:translate-y-[4px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 uppercase tracking-widest relative overflow-hidden"
                >
                  <span className="absolute inset-0 border-t-[3px] border-l-[3px] border-white/15 rounded-lg pointer-events-none" />
                  <span className="relative z-10">⚔ Play</span>
                </button>
              ) : (
                <div
                  className="px-12 sm:px-16 py-3 rounded-xl text-xl sm:text-2xl font-bold uppercase tracking-widest text-center border-2 border-[#5c2e0b]/30 text-[#8b6840]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(244,222,179,0.5) 0%, rgba(222,194,140,0.5) 100%)',
                  }}
                >
                  Waiting for Host...
                </div>
              )}
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
