import { useState } from "react";
import { useSocketStore } from "../store/useSocketStore";

export default function TopRightMenu() {
  const { username, disconnect } = useSocketStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    disconnect();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
        <button className="w-10 h-10 bg-amber-800/80 hover:bg-amber-700 border-2 border-black rounded-full flex items-center justify-center text-white text-xl shadow-md">
          <span role="img" aria-label="sound">🔊</span>
        </button>
        <div className="bg-amber-800/80 border-2 border-black rounded-full px-4 py-2 flex items-center gap-2 text-white shadow-md">
          <span className="font-bold tracking-wider">{username || "PLAYER"}</span>
          <span role="img" aria-label="user" className="bg-white text-amber-900 rounded-full w-6 h-6 flex items-center justify-center text-xs">👤</span>
        </div>
        <button 
          className="w-10 h-10 bg-red-600/90 hover:bg-red-500 border-2 border-black rounded-full flex items-center justify-center text-white text-xl shadow-md transition-transform hover:scale-105 active:scale-95" 
          onClick={() => setShowLogoutConfirm(true)}
          title="Log Out"
        >
          <span role="img" aria-label="logout">🚪</span>
        </button>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#f4deb3] border-4 border-[#3d1f0f] rounded-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-6 shadow-2xl font-pixel animate-in fade-in zoom-in duration-200">
            <h3 className="text-3xl text-black font-bold text-center drop-shadow-sm">Confirm Logout</h3>
            <p className="text-center text-xl text-black/80 font-semibold">Are you sure you want to log out?</p>
            <div className="flex gap-4 w-full mt-4">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-gray-400 border-4 border-gray-600 text-black font-bold text-xl rounded-xl hover:bg-gray-300 active:translate-y-1 transition-all shadow-[0_4px_0_rgb(75,85,99)] hover:shadow-[0_2px_0_rgb(75,85,99)]"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-500 border-4 border-red-700 text-white font-bold text-xl rounded-xl hover:bg-red-400 active:translate-y-1 transition-all shadow-[0_4px_0_rgb(153,27,27)] hover:shadow-[0_2px_0_rgb(153,27,27)]"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
