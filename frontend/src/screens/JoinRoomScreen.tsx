import { useCallback, useEffect, useState } from "react";
import { useSocketStore, getBackendUrl } from "../store/useSocketStore";
import TopRightMenu from "../components/TopRightMenu";

interface PublicRoom {
  code: string;
  host: string;
  players: number;
}

/**
 * หน้าจอเข้าร่วมห้องเล่น (Join Room Screen):
 * - แท็บที่ 1: ROOM CODE สำหรับพิมพ์รหัสตัวเลข 6 หลักเพื่อเข้าห้องแบบเจาะจง
 * - แท็บที่ 2: PUBLIC ROOMS ดึงรายการห้องสาธารณะที่กำลังรอผู้เล่นคนที่ 2 พร้อมระบบรีเฟรชอัตโนมัติทุก 5 วินาที
 */
export default function JoinRoomScreen() {
  const { setScreen, joinRoom, joinError } = useSocketStore();
  const [inputCode, setInputCode] = useState('');
  const [tab, setTab] = useState<'code' | 'public'>('code');
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState(false);

  // ดึงข้อมูลรายการห้องสาธารณะที่ยังว่างจาก REST API /api/rooms/public
  const loadPublicRooms = useCallback(async () => {
    setLoadingRooms(true);
    setRoomsError(false);
    try {
      const res = await fetch(`${getBackendUrl()}/api/rooms/public`);
      if (!res.ok) throw new Error('bad status');
      setPublicRooms(await res.json());
    } catch {
      setRoomsError(true);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  // ดึงข้อมูลเมื่อเปิดแท็บ public และตั้งเวลาดึงซ้ำทุก 5 วินาที
  useEffect(() => {
    if (tab !== 'public') return;
    loadPublicRooms();
    const id = setInterval(loadPublicRooms, 5000);
    return () => clearInterval(id);
  }, [tab, loadPublicRooms]);

  // จัดการเมื่อกดเข้าร่วมห้องด้วยรหัส 6 หลัก
  const handleJoinPrivate = () => {
    if (inputCode.trim().length === 6) {
      joinRoom(inputCode.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinPrivate();
    }
  };

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center font-pixel cursor-default p-3 sm:p-4"
      style={{ backgroundImage: "url('/ui/land-waitroom.png')" }}
    >
      {/* ฟิลเตอร์แสงและเงาของฉากหลัง */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7c2d12]/30 via-transparent to-[#450a0a]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      <TopRightMenu />

      {/* หัวข้อหน้าจอ */}
      <h2
        className="text-[#fde68a] text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 uppercase text-center relative z-10 font-bold tracking-widest font-pixel"
        style={{ textShadow: "4px 4px 0px #2a1b12, -2px -2px 0px #2a1b12, 2px -2px 0px #2a1b12, -2px 2px 0px #2a1b12, 0 6px 10px rgba(0,0,0,0.8)" }}
      >
        JOIN ROOM
      </h2>

      {/* แผงควบคุมม้วนกระดาษโบราณ */}
      <div className="relative w-[min(94vw,660px)] mx-auto z-10">
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
          className="relative z-10 mx-1.5 px-6 sm:px-8 md:px-10 py-6 sm:py-7"
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
            onClick={() => setScreen('select')}
            title="Back"
            style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.15)' }}
          >
            ←
          </button>

          <div className="flex flex-col items-center gap-4 sm:gap-5 font-game-body">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl border-2 border-[#5c2e0b]/40 shadow-inner font-game-sub" style={{
              background: 'linear-gradient(135deg, rgba(244,222,179,0.7) 0%, rgba(222,194,140,0.7) 100%)',
            }}>
              <button
                onClick={() => setTab('code')}
                className={`px-5 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 ${
                  tab === 'code'
                    ? 'bg-[#5c2e0b] text-[#fde68a] shadow-md border border-[#382503]'
                    : 'text-[#7c532b] hover:text-[#5c2e0b]'
                }`}
              >
                ROOM CODE
              </button>
              <button
                onClick={() => setTab('public')}
                className={`px-5 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 ${
                  tab === 'public'
                    ? 'bg-[#5c2e0b] text-[#fde68a] shadow-md border border-[#382503]'
                    : 'text-[#7c532b] hover:text-[#5c2e0b]'
                }`}
              >
                PUBLIC ROOMS
              </button>
            </div>

            {/* Divider */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#9A7A3D] to-transparent opacity-60" />
              <div className="w-2 h-2 rotate-45 bg-[#8B6F3A] opacity-80" />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#9A7A3D] to-transparent opacity-60" />
            </div>

            {/* Tab Content */}
            {tab === 'code' ? (
              /* === Enter Code Tab === */
              <div className="w-full flex flex-col items-center gap-3.5 sm:gap-4 font-game-body">
                <div className="flex flex-col items-center gap-1">
                  <p
                    className="text-xl sm:text-2xl text-[#4a2408] uppercase tracking-wide font-bungee"
                    style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.4)' }}
                  >
                    PRIVATE ROOM
                  </p>
                  <p className="text-sm sm:text-base text-[#7c532b] font-game-body font-medium text-center">
                    Enter 6-digit room code from host
                  </p>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={handleKeyDown}
                  className="w-full max-w-[390px] bg-[#fef3c7] p-3 sm:p-4 rounded-2xl border-3 border-[#5c2e0b] text-[#382503] font-pixel text-4xl sm:text-5xl font-bold text-center tracking-[0.32em] outline-none focus:bg-white focus:border-[#b45309] focus:ring-4 focus:ring-[#f59e0b]/40 shadow-inner transition-colors placeholder:text-[#8b4513]/35 placeholder:tracking-[0.24em]"
                  placeholder="000000"
                  autoFocus
                />

                {joinError && (
                  <div className="w-full bg-[#7f1d1d]/90 text-[#fef2f2] border-2 border-[#b91c1c] px-4 py-2.5 rounded-xl text-center text-sm sm:text-base font-bold shadow-md font-game-body">
                    ⚠ {joinError}
                  </div>
                )}

                <button
                  onClick={handleJoinPrivate}
                  disabled={inputCode.trim().length !== 6}
                  className="bg-[#b45309] hover:bg-[#d97706] disabled:bg-[#8B6F3A] disabled:opacity-50 disabled:cursor-not-allowed text-[#fffbeb] font-bold text-base sm:text-lg px-12 sm:px-16 py-3 sm:py-3.5 rounded-2xl border-b-[4px] border-r-[4px] border-t-2 border-l-2 border-[#382503] shadow-[0_5px_0px_#2a1b12] active:translate-y-[4px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 uppercase tracking-wide relative overflow-hidden font-bungee mt-1"
                  style={{ textShadow: "2px 2px 0px #000" }}
                >
                  <span className="absolute inset-0 border-t-2 border-l-2 border-white/20 rounded-xl pointer-events-none" />
                  <span className="relative z-10">JOIN LOBBY ➔</span>
                </button>
              </div>
            ) : (
              /* === Public Lobby Tab === */
              <div className="w-full flex flex-col gap-3 font-game-body">
                <div className="flex items-center justify-between px-1">
                  <p
                    className="text-lg sm:text-xl text-[#4a2408] uppercase tracking-wide font-bungee"
                    style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.4)' }}
                  >
                    OPEN ROOMS
                  </p>
                  <button
                    onClick={loadPublicRooms}
                    className="text-xs sm:text-sm font-bold text-[#7c532b] hover:text-[#5c2e0b] tracking-wider uppercase transition-colors font-game-sub"
                  >
                    ↻ REFRESH
                  </button>
                </div>

                {/* Room List */}
                <div className="w-full flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#B8944F transparent' }}>
                  {joinError && (
                    <div className="w-full bg-[#7f1d1d]/90 text-[#fef2f2] border-2 border-[#b91c1c] px-4 py-2 rounded-xl text-center text-sm font-bold">
                      ⚠ {joinError}
                    </div>
                  )}
                  {roomsError && (
                    <p className="text-center text-sm font-semibold text-[#9B2C2C] py-4">Could not load rooms. Try REFRESH.</p>
                  )}
                  {!roomsError && !loadingRooms && publicRooms.length === 0 && (
                    <p className="text-center text-sm sm:text-base font-semibold text-[#7c532b] py-6">
                      No public rooms right now.<br />Ask a friend for a code, or host your own!
                    </p>
                  )}
                  {publicRooms.map((room) => (
                    <div
                      key={room.code}
                      className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border-2 border-[#5c2e0b]/45 hover:border-[#b45309] transition-all cursor-pointer group shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0.5"
                      style={{
                        background: 'linear-gradient(135deg, rgba(248,228,190,0.95) 0%, rgba(228,200,150,0.95) 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.1)',
                      }}
                      onClick={() => joinRoom(room.code)}
                    >
                      <div className="flex items-center gap-3 sm:gap-3.5">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#b45309] border-2 border-[#5c2e0b] flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)] font-pixel">
                          {room.host.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xl sm:text-2xl font-bold text-[#382503] uppercase tracking-wider font-pixel leading-none">
                            {room.host}'s Room
                          </span>
                          <span className="text-xs text-[#7c532b] font-game-body font-medium mt-0.5">
                            {room.players}/2 Explorers (Waiting)
                          </span>
                        </div>
                      </div>
                      <span
                        className="shrink-0 bg-[#b45309] group-hover:bg-[#d97706] text-[#fffbeb] font-bold text-sm sm:text-base px-4 sm:px-5 py-2 rounded-xl border-b-[4px] border-r-[4px] border-t-2 border-l-2 border-[#382503] shadow-[0_3px_0_#2a1b12] group-active:translate-y-[3px] group-active:border-b-0 group-active:border-r-0 group-active:shadow-none tracking-wider uppercase transition-all font-game-sub"
                        style={{ textShadow: "1px 1px 0 #000" }}
                      >
                        JOIN ➔
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
