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
      <div className={`fixed z-50 flex flex-col items-end gap-3 ${isGame ? 'top-6 right-4 md:right-8' : 'top-6 right-6'} font-pixel`}>
        <div className="bg-amber-800/80 border-2 border-black rounded-full px-4 py-2 flex items-center gap-3 text-white shadow-md">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-black" />
          ) : (
            <span role="img" aria-label="user" className="bg-white text-amber-900 rounded-full w-8 h-8 flex items-center justify-center text-xs">👤</span>
          )}
          <span className="font-bold tracking-wider">{username || "PLAYER"}</span>
          <span className="text-yellow-400 font-bold ml-2">🪙 {coins}</span>
        </div>
        <button 
          onClick={toggleMute}
          className={`w-12 h-12 ${isMuted ? 'bg-gray-600 hover:bg-gray-500' : 'bg-amber-800/80 hover:bg-amber-700'} border-2 border-black rounded-full flex items-center justify-center text-white text-2xl shadow-md transition-transform hover:scale-105 active:scale-95`}
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
        >
          <span role="img" aria-label="sound">{isMuted ? "🔇" : "🔊"}</span>
        </button>
        <button 
          className="w-12 h-12 bg-red-800 hover:bg-red-700 border-2 border-black rounded-full flex items-center justify-center text-white text-2xl shadow-md transition-transform hover:scale-105 active:scale-95" 
          onClick={() => setShowConfirm(true)}
          title={isGame ? "Leave Stage" : "Log Out"}
        >
          {isGame ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          )}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#3d1f0f] border-[6px] border-[#1a0b05] rounded-3xl p-2 shadow-[0_15px_0_rgba(0,0,0,0.8),0_25px_50px_rgba(0,0,0,0.9)] max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200 font-pixel">
            <div className="bg-[#f4deb3] border-[4px] border-[#5c2e16] rounded-2xl p-8 relative overflow-hidden flex flex-col items-center gap-6">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#3d1f0f_1.5px,_transparent_1.5px)] bg-[size:12px_12px]" />
              <div className="relative z-10 w-full flex flex-col items-center gap-6">
                <h3 className="text-4xl text-red-800 font-black text-center drop-shadow-sm">
                  {isGame ? "Leave Stage" : "Confirm Logout"}
                </h3>
                <p className="text-center text-xl text-black/80 font-semibold">
                  {isGame ? "Are you sure you want to return to the waiting room?" : "Are you sure you want to log out?"}
                </p>
                <div className="flex gap-4 w-full mt-2">
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 bg-[#78716c] border-[3px] border-[#44403c] text-white font-bold text-xl rounded-full hover:bg-[#57534e] active:scale-95 transition-all shadow-[0_4px_0_#44403c] active:shadow-none active:translate-y-1"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAction}
                    className="flex-1 py-3 bg-[#ea580c] border-[3px] border-[#c2410c] text-white font-bold text-xl rounded-full hover:bg-[#c2410c] active:scale-95 transition-all shadow-[0_4px_0_#9a3412] active:shadow-none active:translate-y-1"
                  >
                    {isGame ? "Leave" : "Log Out"}
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
