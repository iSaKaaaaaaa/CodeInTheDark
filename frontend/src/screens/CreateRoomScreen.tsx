import { useEffect, useState } from "react";
import { useSocketStore } from "../store/useSocketStore";
import TopRightMenu from "../components/TopRightMenu";

/**
 * หน้าจอห้องรอเริ่มเกม (Lobby / Create Room Screen):
 * - แสดงรหัสห้อง 6 หลัก พร้อมปุ่มคัดลอกลงคลิปบอร์ด
 * - สวิตช์สลับสถานะห้องเป็นแบบ PRIVATE หรือ PUBLIC (เฉพาะ Host)
 * - แสดงรายชื่อผู้เล่นในห้อง (Player 1 Host และ Player 2 Guest)
 * - ปุ่ม Start Game เมื่อผู้เล่นครบ 2 คน (เฉพาะ Host ที่มีสิทธิ์สั่งเริ่ม)
 */
export default function CreateRoomScreen() {
  const { username, roomCode, role, players, leaveRoom, createRoom, startGame, isPublic, setRoomVisibility } = useSocketStore();
  const isHost = players.length > 0 ? players[0].username === username : role === 'driver';
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomCode && role === 'driver') {
      createRoom();
    }
  }, [roomCode, role, createRoom]);

  // คัดลอกรหัสห้องลงคลิปบอร์ด
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
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center font-pixel cursor-default p-3 sm:p-4"
      style={{ backgroundImage: "url('/ui/land-waitroom.png')" }}
    >
      {/* ฟิลเตอร์แสงและเงาของฉากหลัง */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7c2d12]/30 via-transparent to-[#450a0a]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      <TopRightMenu />

      {/* หัวข้อห้องรอ */}
      <h2
        className="text-[#fde68a] text-4xl sm:text-5xl md:text-6xl mb-2.5 sm:mb-3.5 uppercase text-center relative z-10 font-bold tracking-widest font-pixel"
        style={{ textShadow: "4px 4px 0px #2a1b12, -2px -2px 0px #2a1b12, 2px -2px 0px #2a1b12, -2px 2px 0px #2a1b12, 0 6px 10px rgba(0,0,0,0.8)" }}
      >
        LOBBY
      </h2>

      {/* แผงควบคุมห้องม้วนกระดาษโบราณ */}
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
          className="relative z-10 mx-1.5 px-6 sm:px-8 md:px-10 py-5 sm:py-6"
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

          {/* Back button */}
          <button
            className="absolute top-3 left-4 text-[#8B5E3C] hover:text-[#C4553A] active:translate-y-0.5 transition-all duration-75 text-2xl sm:text-3xl font-bold leading-none p-1 rounded-lg"
            onClick={leaveRoom}
            title="Back"
            style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.15)' }}
          >
            ←
          </button>

          <div className="flex flex-col items-center gap-3.5 sm:gap-4 font-game-body">
            {/* Room Name + Code */}
            <div className="flex flex-col items-center gap-1.5">
              <p
                className="text-3xl sm:text-4xl text-[#4a2408] font-bold uppercase tracking-wider font-pixel text-center"
                style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.4)' }}
              >
                {roomName}
              </p>
              <div className="flex items-center gap-3 sm:gap-3.5 bg-[#ecd29d]/70 px-5 py-2 rounded-xl border-2 border-[#b8944f]/60 shadow-inner">
                <span className="text-xs sm:text-sm text-[#7c532b] font-bold font-game-sub uppercase tracking-wider">
                  ROOM CODE:
                </span>
                <span
                  className="text-3xl sm:text-4xl md:text-5xl text-[#382503] font-bold tracking-[0.24em] uppercase font-pixel"
                  style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.5)' }}
                >
                  {roomCode || "------"}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="relative bg-[#5c2e0b] hover:bg-[#7a3f12] text-[#fde68a] w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-b-[3px] border-r-[3px] border-t-2 border-l-2 border-[#382503] shadow-[0_3px_0px_#2a1b12] active:translate-y-[3px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 flex items-center justify-center text-lg sm:text-xl font-bold cursor-pointer"
                  title="Copy Code"
                >
                  <span className="absolute inset-0 border-t border-l border-white/10 rounded-lg pointer-events-none" />
                  {copied ? "✓" : "⎘"}
                </button>
              </div>
            </div>

            {/* Visibility Toggle */}
            {isHost && (
              <div className="flex items-center gap-1.5 p-1 rounded-xl border-2 border-[#5c2e0b]/40 shadow-inner font-game-sub" style={{
                background: 'linear-gradient(135deg, rgba(244,222,179,0.7) 0%, rgba(222,194,140,0.7) 100%)',
              }}>
                <button
                  onClick={() => setRoomVisibility(false)}
                  className={`px-5 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 ${
                    !isPublic
                      ? 'bg-[#5c2e0b] text-[#fde68a] shadow-md border border-[#382503]'
                      : 'text-[#7c532b] hover:text-[#5c2e0b]'
                  }`}
                >
                  PRIVATE
                </button>
                <button
                  onClick={() => setRoomVisibility(true)}
                  className={`px-5 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 ${
                    isPublic
                      ? 'bg-[#5c2e0b] text-[#fde68a] shadow-md border border-[#382503]'
                      : 'text-[#7c532b] hover:text-[#5c2e0b]'
                  }`}
                >
                  PUBLIC
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#9A7A3D] to-transparent opacity-60" />
              <div className="w-2 h-2 rotate-45 bg-[#8B6F3A] opacity-80" />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#9A7A3D] to-transparent opacity-60" />
            </div>

            {/* Players Section */}
            <div className="w-full flex flex-col gap-2.5 sm:gap-3 font-game-body">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs sm:text-sm text-[#7c532b] font-bold font-game-sub uppercase tracking-wider">
                  PLAYERS ({players.length > 0 ? players.length : 1}/2)
                </span>
                <span className="text-xs text-[#7c532b] font-game-body font-medium">
                  Need 2 players to start
                </span>
              </div>

              {/* Player 1 — Host */}
              <div
                className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-[#5c2e0b]/45 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, rgba(248,228,190,0.95) 0%, rgba(228,200,150,0.95) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.1)',
                }}
              >
                <div className="flex items-center gap-3 sm:gap-3.5">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#b45309] border-2 border-[#5c2e0b] flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-[inset_0_-2.5px_0_rgba(0,0,0,0.25)] font-pixel">
                    {(players.length > 0 ? players[0].username : username || "H").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-2xl sm:text-3xl font-bold text-[#382503] uppercase tracking-wider font-pixel leading-none">
                      {players.length > 0 ? players[0].username : username || "HOST"}
                    </span>
                    <span className="text-xs text-[#7c532b] font-game-sub font-semibold mt-0.5 uppercase tracking-wide">
                      Room Host
                    </span>
                  </div>
                </div>
                <span
                  className="text-xs sm:text-sm font-bold px-3 py-1 rounded-lg font-game-sub uppercase tracking-wider"
                  style={{
                    color: '#9B2C2C',
                    background: 'rgba(155, 44, 44, 0.12)',
                    border: '2px solid rgba(155, 44, 44, 0.35)',
                  }}
                >
                  HOST
                </span>
              </div>

              {/* Player 2 — Guest / Waiting */}
              <div
                className={`w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 transition-all ${
                  players.length > 1
                    ? 'border-[#5c2e0b]/45 shadow-md'
                    : 'border-dashed border-[#B8944F]/80 shadow-inner'
                }`}
                style={{
                  background: players.length > 1
                    ? 'linear-gradient(135deg, rgba(248,228,190,0.95) 0%, rgba(228,200,150,0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(244,222,179,0.35) 0%, rgba(222,194,140,0.35) 100%)',
                  boxShadow: players.length > 1
                    ? 'inset 0 1px 0 rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.1)'
                    : 'none',
                }}
              >
                {players.length > 1 ? (
                  <>
                    <div className="flex items-center gap-3 sm:gap-3.5">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#2B6CB0] border-2 border-[#1A365D] flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-[inset_0_-2.5px_0_rgba(0,0,0,0.25)] font-pixel">
                        {players[1].username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-2xl sm:text-3xl font-bold text-[#382503] uppercase tracking-wider font-pixel leading-none">
                          {players[1].username}
                        </span>
                        <span className="text-xs text-[#2B6CB0] font-game-sub font-semibold mt-0.5 uppercase tracking-wide">
                          Player 2
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-xs sm:text-sm font-bold px-3 py-1 rounded-lg font-game-sub uppercase tracking-wider"
                      style={{
                        color: '#2B6CB0',
                        background: 'rgba(43, 108, 176, 0.12)',
                        border: '2px solid rgba(43, 108, 176, 0.35)',
                      }}
                    >
                      READY
                    </span>
                  </>
                ) : (
                  <div className="w-full flex flex-col items-center py-2 sm:py-2.5 gap-1">
                    <span className="text-base sm:text-lg md:text-xl text-[#7c532b] font-bold font-game-sub uppercase tracking-wider animate-pulse">
                      Waiting for Player 2 to join...
                    </span>
                    <span className="text-xs text-[#9a7047] font-game-body font-medium">
                      {isPublic ? 'Open in public room list' : 'Share 6-digit room code with your friend'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#9A7A3D] to-transparent opacity-60" />
              <div className="w-2 h-2 rotate-45 bg-[#8B6F3A] opacity-80" />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#9A7A3D] to-transparent opacity-60" />
            </div>

            {/* Action Button */}
            <div className="w-full flex justify-center">
              {isHost ? (
                <button
                  onClick={startGame}
                  disabled={players.length < 2}
                  className="bg-[#b45309] hover:bg-[#d97706] disabled:bg-[#8B6F3A] disabled:opacity-50 disabled:cursor-not-allowed text-[#fffbeb] font-bold text-base sm:text-lg px-12 sm:px-16 py-3 sm:py-3.5 rounded-2xl border-b-[4px] border-r-[4px] border-t-2 border-l-2 border-[#382503] shadow-[0_5px_0px_#2a1b12] active:translate-y-[4px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 uppercase tracking-wide relative overflow-hidden font-bungee"
                  style={{ textShadow: "2px 2px 0px #000" }}
                >
                  <span className="absolute inset-0 border-t-2 border-l-2 border-white/20 rounded-xl pointer-events-none" />
                  <span className="relative z-10">START GAME ➔</span>
                </button>
              ) : (
                <div
                  className="px-10 sm:px-14 py-3 rounded-2xl text-base sm:text-lg font-bold uppercase tracking-wider text-center border-2 border-[#5c2e0b]/40 text-[#7c532b] shadow-inner font-game-sub"
                  style={{
                    background: 'linear-gradient(135deg, rgba(244,222,179,0.6) 0%, rgba(222,194,140,0.6) 100%)',
                  }}
                >
                  Waiting for host to start...
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
