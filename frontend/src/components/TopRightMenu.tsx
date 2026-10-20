import { useState } from "react";
import { useSocketStore } from "../store/useSocketStore";

export default function TopRightMenu() {
  const { username, avatarUrl, coins, disconnect, currentScreen, leaveStage, isMuted, toggleMute } = useSocketStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const isGame = currentScreen === 'game';

  const handleAction = () => {
    if (isGame) {
      leaveStage();
    } else {
      disconnect();
    }
    setShowConfirm(false);
  };

  return (
    <>
      <div className={`fixed z-50 flex flex-col items-end gap-1.5 ${isGame ? 'top-2 right-2 sm:top-2.5 sm:right-3 md:top-3 md:right-4' : 'top-4 right-4 md:top-6 md:right-6'} font-pixel`}>

        {/* ถ้าไม่ใช่หน้าเกม แสดง User Badge แบบเดิม */}
        {!isGame && (
          <div className="bg-[#b45309] border-b-[4px] border-r-[4px] border-t-2 border-l-2 border-[#382503] shadow-[0_4px_0px_#2a1b12] rounded-md px-4 py-2 sm:px-5 sm:py-3 flex items-center gap-3 text-[#fffbeb]">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm border-2 border-[#382503]" />
            ) : (
              <span role="img" aria-label="user" className="bg-[#fef3c7] text-[#5c2e0b] rounded-sm w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base border-2 border-[#382503] font-bold">👤</span>
            )}
            <span className="font-bold tracking-wider drop-shadow-md text-lg sm:text-xl">{username || "PLAYER"}</span>
            <div className="bg-[#5c2e0b] px-3 py-1 sm:px-4 sm:py-1.5 rounded border-2 border-[#382503] flex items-center gap-1 sm:gap-2 shadow-inner ml-2">
              <span className="text-yellow-400 font-bold text-lg sm:text-xl">🪙</span>
              <span className="text-yellow-400 font-bold text-lg sm:text-xl">{coins}</span>
            </div>
          </div>
        )}

        {/* System Utilities — vertical ในเกม, horizontal นอกเกม */}
        <div className={`flex ${isGame ? 'flex-col' : 'flex-row'} gap-1.5`}>
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`w-9 h-9 sm:w-10 sm:h-10 ${isMuted ? 'bg-[#5c2e0b]' : 'bg-[#b45309] hover:bg-[#d97706]'} border-b-[3px] border-r-[3px] border-t-[2px] border-l-[2px] border-[#382503] rounded-md flex items-center justify-center text-white text-base sm:text-lg shadow-[0_3px_0px_#2a1b12] active:translate-y-[3px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 relative`}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            <span role="img" aria-label="sound" className="drop-shadow-md relative z-10">{isMuted ? "🔇" : "🔊"}</span>
          </button>

          {/* Logout / Leave Button */}
          <button
            className="w-9 h-9 sm:w-10 sm:h-10 bg-[#991b1b] hover:bg-[#b91c1c] border-b-[3px] border-r-[3px] border-t-[2px] border-l-[2px] border-[#450a0a] rounded-md flex items-center justify-center text-white text-base sm:text-lg shadow-[0_3px_0px_#450a0a] active:translate-y-[3px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 relative"
            onClick={() => setShowConfirm(true)}
            title={isGame ? "Leave Stage" : "Log Out"}
          >
            <div className="drop-shadow-md relative z-10 flex items-center justify-center">
              {isGame ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              )}
            </div>
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#3d1f0f] border-[6px] border-[#1a0b05] rounded-xl p-2 shadow-[0_15px_0_rgba(0,0,0,0.8),0_25px_50px_rgba(0,0,0,0.9)] max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200 font-pixel">
            <div className="bg-[#fef3c7] border-[4px] border-[#5c2e16] rounded-lg p-8 relative overflow-hidden flex flex-col items-center gap-6">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#3d1f0f_1.5px,_transparent_1.5px)] bg-[size:12px_12px]" />
              <div className="relative z-10 w-full flex flex-col items-center gap-4">
                <h3 className="text-3xl text-red-800 font-black text-center drop-shadow-sm uppercase tracking-wider">
                  {isGame ? "Leave Stage" : "Confirm Logout"}
                </h3>
                <p className="text-center text-lg text-[#5c2e0b] font-bold">
                  {isGame ? "Are you sure you want to return to the waiting room?" : "Are you sure you want to log out?"}
                </p>
                <div className="flex gap-4 w-full mt-4">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 bg-[#78716c] hover:bg-[#57534e] text-white font-bold text-xl rounded-xl border-b-[4px] border-r-[4px] border-t-2 border-l-2 border-[#292524] shadow-[0_4px_0px_#1c1917] active:translate-y-[4px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 uppercase tracking-widest relative overflow-hidden"
                  >
                    <span className="absolute inset-0 border-t-2 border-l-2 border-white/20 rounded-lg pointer-events-none" />
                    <span className="relative z-10 drop-shadow-md">Cancel</span>
                  </button>
                  <button
                    onClick={handleAction}
                    className="flex-1 py-3 bg-[#991b1b] hover:bg-[#b91c1c] text-white font-bold text-xl rounded-xl border-b-[4px] border-r-[4px] border-t-2 border-l-2 border-[#450a0a] shadow-[0_4px_0px_#2a0606] active:translate-y-[4px] active:border-b-0 active:border-r-0 active:shadow-none transition-all duration-75 uppercase tracking-widest relative overflow-hidden"
                  >
                    <span className="absolute inset-0 border-t-2 border-l-2 border-white/20 rounded-lg pointer-events-none" />
                    <span className="relative z-10 drop-shadow-md">{isGame ? "Leave" : "Log Out"}</span>
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
