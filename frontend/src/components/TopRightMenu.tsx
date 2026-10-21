import { useState } from "react";
import { useSocketStore } from "../store/useSocketStore";

interface TopRightMenuProps {
  inline?: boolean;
}

export default function TopRightMenu({ inline = false }: TopRightMenuProps) {
  const {
    username,
    avatarUrl,
    coins,
    disconnect,
    currentScreen,
    leaveStage,
    isMuted,
    toggleMute,
    volume,
    setVolume,
  } = useSocketStore();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showVolumePopup, setShowVolumePopup] = useState(false);

  const isGame = currentScreen === "game";

  const handleAction = () => {
    if (isGame) {
      leaveStage();
    } else {
      disconnect();
    }
    setShowConfirm(false);
  };

  // ในหน้าเกม ถ้าไม่ได้เรียกแบบ inline ให้ซ่อนตัวลอยไว้ (เพราะ GameHeader จัดการปุ่ม inline ให้อยู่ข้างเวลาด่าน)
  if (isGame && !inline) {
    return null;
  }

  // โหมด Inline: แสดงปุ่มปรับเสียงและออกจากด่านในแถวเดียวกับ GameHeader
  if (inline) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 relative font-pixel">
        {/* Volume Button */}
        <div className="relative">
          <button
            onClick={() => setShowVolumePopup((prev) => !prev)}
            className={`w-9 h-9 sm:w-10 sm:h-10 ${
              isMuted || volume === 0 ? "bg-[#5c2e0b]" : "bg-[#b45309] hover:bg-[#d97706]"
            } border-b-[3px] border-r-[3px] border-t-[2px] border-l-[2px] border-[#382503] rounded-xl flex items-center justify-center text-white text-base shadow-[0_3px_0px_#2a1b12] active:translate-y-[3px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75`}
            title="ระดับเสียง (Volume)"
          >
            <div className="drop-shadow-md flex items-center justify-center">
              {isMuted || volume === 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
              )}
            </div>
          </button>

          {/* Volume Slider Popover */}
          {showVolumePopup && (
            <div className="absolute right-0 top-full mt-2 bg-[#2a1306]/95 border-2 border-[#b8944f] rounded-xl p-3 shadow-2xl flex flex-col items-center gap-2 min-w-[180px] z-50 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 font-pixel">
              <div className="flex items-center justify-between w-full text-base font-bold text-amber-200">
                <span className="font-thai font-medium">เสียงเกม</span>
                <span>{isMuted ? "ปิดเสียง" : `${volume}%`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const newVol = Number(e.target.value);
                  setVolume(newVol);
                  if (isMuted && newVol > 0) {
                    toggleMute();
                  }
                }}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-black/60 rounded-lg"
              />
              <button
                onClick={toggleMute}
                className="w-full text-sm font-thai font-medium py-1.5 bg-amber-700/80 hover:bg-amber-600 rounded-lg text-white border border-amber-900 transition-colors uppercase tracking-wider"
              >
                {isMuted ? "เปิดเสียง" : "ปิดเสียง"}
              </button>
            </div>
          )}
        </div>

        {/* Leave Stage Button */}
        <button
          className="w-9 h-9 sm:w-10 sm:h-10 bg-[#991b1b] hover:bg-[#b91c1c] border-b-[3px] border-r-[3px] border-t-[2px] border-l-[2px] border-[#450a0a] rounded-xl flex items-center justify-center text-white text-base shadow-[0_3px_0px_#450a0a] active:translate-y-[3px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75"
          onClick={() => setShowConfirm(true)}
          title="ออกจากด่าน (Leave Stage)"
        >
          <div className="drop-shadow-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          </div>
        </button>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/75 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-[#3d1f0f] border-[6px] border-[#1a0b05] rounded-2xl p-2 shadow-[0_15px_0_rgba(0,0,0,0.8),0_25px_50px_rgba(0,0,0,0.9)] max-w-md w-full mx-auto animate-in fade-in zoom-in duration-200">
              <div className="bg-[#fef3c7] border-[4px] border-[#5c2e16] rounded-xl p-6 sm:p-8 relative overflow-hidden flex flex-col items-center gap-5">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#3d1f0f_1.5px,_transparent_1.5px)] bg-[size:12px_12px]" />
                <div className="relative z-10 w-full flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 border-2 border-red-800 flex items-center justify-center text-red-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  </div>
                  <h3 className="text-2xl sm:text-3xl text-red-800 font-bold font-thai tracking-wide">
                    ยืนยันการออกจากด่าน
                  </h3>
                  <p className="text-center text-base sm:text-lg text-[#5c2e0b] font-thai font-medium leading-relaxed">
                    คุณแน่ใจหรือไม่ว่าต้องการออกจากด่านและกลับไปยังห้องรอ?
                  </p>
                </div>
                <div className="relative z-10 flex items-center justify-center gap-4 w-full pt-2">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#334155] font-bold rounded-xl border-b-[4px] border-[#94a3b8] active:translate-y-[2px] active:border-b-0 transition-all font-thai text-base"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleAction}
                    className="flex-1 py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold rounded-xl border-b-[4px] border-[#7f1d1d] active:translate-y-[2px] active:border-b-0 transition-all font-thai text-base"
                  >
                    ออกจากด่าน
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`fixed z-50 flex flex-col items-end gap-2 ${isGame ? "top-2 right-2 md:top-3 md:right-4" : "top-4 right-4 md:top-6 md:right-6"} font-pixel`}>

        {/* ถ้าไม่ใช่หน้าเกม แสดง User Badge และ Coin Icon */}
        {!isGame && (
          <div className="bg-[#b45309] border-b-[4px] border-r-[4px] border-t-2 border-l-2 border-[#382503] shadow-[0_4px_0px_#2a1b12] rounded-md px-4 py-2 sm:px-5 sm:py-3 flex items-center gap-3 text-[#fffbeb]">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm border-2 border-[#382503]" />
            ) : (
              <span className="bg-[#fef3c7] text-[#5c2e0b] rounded-sm w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base border-2 border-[#382503] font-bold">
                P
              </span>
            )}
            <span className="font-bold tracking-wider drop-shadow-md text-lg sm:text-xl">{username || "ผู้เล่น"}</span>
            <div className="bg-[#5c2e0b] px-3 py-1 sm:px-4 sm:py-1.5 rounded border-2 border-[#382503] flex items-center gap-1.5 sm:gap-2 shadow-inner ml-2">
              {/* Coin Icon แทนคำว่า COINS */}
              <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 drop-shadow-sm" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
                <circle cx="12" cy="12" r="7" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />
                <path d="M12 7v10M9.5 9.5h4.5a1.5 1.5 0 0 1 0 3h-4a1.5 1.5 0 0 0 0 3h5" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-yellow-400 font-bold text-lg sm:text-xl font-pixel">{coins}</span>
            </div>
          </div>
        )}

        {/* System Utilities — vertical ในเกม, horizontal นอกเกม */}
        <div className={`flex ${isGame ? "flex-col" : "flex-row"} items-center gap-2 relative`}>
          {/* Volume Button & Slider Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowVolumePopup((prev) => !prev)}
              className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 ${isMuted || volume === 0 ? "bg-[#5c2e0b]" : "bg-[#b45309] hover:bg-[#d97706]"} border-b-[3px] border-r-[3px] border-t-[2px] border-l-[2px] border-[#382503] rounded-lg flex items-center justify-center text-white text-base sm:text-lg shadow-[0_3px_0px_#2a1b12] active:translate-y-[3px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 relative`}
              title="ระดับเสียง (Volume)"
            >
              <div className="drop-shadow-md relative z-10 flex items-center justify-center">
                {isMuted || volume === 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                )}
              </div>
            </button>

            {/* Volume Slider Popover */}
            {showVolumePopup && (
              <div
                className="absolute right-full top-0 mr-2 bg-[#2a1306]/95 border-2 border-[#b8944f] rounded-xl p-3 shadow-2xl flex flex-col items-center gap-2 min-w-[180px] z-50 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 font-pixel"
              >
                <div className="flex items-center justify-between w-full text-base sm:text-lg font-bold text-amber-200">
                  <span className="font-thai font-medium">เสียงเกม</span>
                  <span>{isMuted ? "ปิดเสียง" : `${volume}%`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVol = Number(e.target.value);
                    setVolume(newVol);
                    if (isMuted && newVol > 0) {
                      toggleMute();
                    }
                  }}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-black/60 rounded-lg"
                />
                <button
                  onClick={toggleMute}
                  className="w-full text-sm sm:text-base font-thai font-medium py-1.5 bg-amber-700/80 hover:bg-amber-600 rounded-lg text-white border border-amber-900 transition-colors uppercase tracking-wider"
                >
                  {isMuted ? "เปิดเสียง" : "ปิดเสียง"}
                </button>
              </div>
            )}
          </div>

          {/* Logout / Leave Button */}
          <button
            className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#991b1b] hover:bg-[#b91c1c] border-b-[3px] border-r-[3px] border-t-[2px] border-l-[2px] border-[#450a0a] rounded-lg flex items-center justify-center text-white text-base sm:text-lg shadow-[0_3px_0px_#450a0a] active:translate-y-[3px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 relative"
            onClick={() => setShowConfirm(true)}
            title={isGame ? "ออกจากด่าน (Leave Stage)" : "ออกจากระบบ (Logout)"}
          >
            <div className="drop-shadow-md relative z-10 flex items-center justify-center">
              {isGame ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/75 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-[#3d1f0f] border-[6px] border-[#1a0b05] rounded-2xl p-2 shadow-[0_15px_0_rgba(0,0,0,0.8),0_25px_50px_rgba(0,0,0,0.9)] max-w-md w-full mx-auto animate-in fade-in zoom-in duration-200">
            <div className="bg-[#fef3c7] border-[4px] border-[#5c2e16] rounded-xl p-6 sm:p-8 relative overflow-hidden flex flex-col items-center gap-5">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#3d1f0f_1.5px,_transparent_1.5px)] bg-[size:12px_12px]" />
              <div className="relative z-10 w-full flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 border-2 border-red-800 flex items-center justify-center text-red-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                </div>
                <h3 className="text-2xl sm:text-3xl text-red-800 font-bold font-thai tracking-wide">
                  {isGame ? "ยืนยันการออกจากด่าน" : "ยืนยันการออกจากระบบ"}
                </h3>
                <p className="text-center text-base sm:text-lg text-[#5c2e0b] font-thai font-medium leading-relaxed">
                  {isGame
                    ? "คุณแน่ใจหรือไม่ว่าต้องการออกจากด่านและกลับไปยังห้องรอ?"
                    : "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบบัญชีผู้ใช้นี้?"}
                </p>
                <div className="flex gap-3 sm:gap-4 w-full mt-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 bg-[#78716c] hover:bg-[#57534e] text-white font-bold text-lg sm:text-xl rounded-xl border-b-[4px] border-r-[4px] border-t-2 border-l-2 border-[#292524] shadow-[0_4px_0px_#1c1917] active:translate-y-[4px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 font-thai relative overflow-hidden"
                  >
                    <span className="absolute inset-0 border-t-2 border-l-2 border-white/20 rounded-lg pointer-events-none" />
                    <span className="relative z-10 drop-shadow-md">ยกเลิก</span>
                  </button>
                  <button
                    onClick={handleAction}
                    className="flex-1 py-3 bg-[#991b1b] hover:bg-[#b91c1c] text-white font-bold text-lg sm:text-xl rounded-xl border-b-[4px] border-r-[4px] border-t-2 border-l-2 border-[#450a0a] shadow-[0_4px_0px_#2a0606] active:translate-y-[4px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 font-thai relative overflow-hidden"
                  >
                    <span className="absolute inset-0 border-t-2 border-l-2 border-white/20 rounded-lg pointer-events-none" />
                    <span className="relative z-10 drop-shadow-md">
                      {isGame ? "ออกจากด่าน" : "ออกจากระบบ"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
