import React, { useState } from 'react';
import './App.css'; // import ไว้เฉยๆ ไม่ให้พัง แม้ไฟล์จะว่างเปล่า

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 1. ถ้า Login ผ่านแล้ว ให้โชว์หน้า Driver (เกมเพลย์)
  if (isLoggedIn) {
    return (
      <div 
        className="w-full min-h-screen bg-cover bg-center flex flex-col p-4 md:p-6 font-pixel gap-4 cursor-default"
        // ฉากหลังตอนเล่นเกม (รูปที่มีแท่นนอนอียิปต์)
        style={{ backgroundImage: "url('/ingame.png')" }} 
      >
        <header className="flex justify-between items-start md:items-center w-full">
          <h1 className="text-white text-5xl md:text-6xl font-bold drop-shadow-md">DRIVER</h1>
          <div className="flex flex-col items-center bg-black/60 px-8 py-2 rounded-full border-4 border-black shadow-lg">
            <span className="text-blue-300 font-bold tracking-widest mb-1 text-sm md:text-base">ROLE SWAP</span>
            <div className="w-48 md:w-80 h-4 bg-black rounded-full border-2 border-black overflow-hidden relative">
              <div className="absolute top-0 left-0 h-full bg-green-500 w-full"></div>
            </div>
            <span className="text-white text-xs mt-1">02:00</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-orange-600 font-bold text-sm md:text-base drop-shadow-sm tracking-widest">DUNGEON TIME</span>
            <div className="flex items-center gap-2">
              <span className="text-white text-4xl md:text-5xl font-bold drop-shadow-md">5:00</span>
              <div className="w-10 h-10 border-4 border-orange-600 rounded-full flex items-center justify-center">
                <div className="w-1 h-3 bg-orange-600 rounded-full -mt-1 relative">
                  <div className="absolute bottom-0 right-0 w-2 h-1 bg-orange-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 gap-6 w-full max-w-[1600px] mx-auto">
          <div className="w-[55%] flex flex-col gap-4">
            <div className="flex-1 bg-amber-900/40 rounded-xl border-4 border-black p-4 relative backdrop-blur-sm">
              <div className="w-full h-full border-4 border-amber-950 bg-amber-100/80 rounded-lg flex items-center justify-center">
                <p className="text-amber-900 text-2xl animate-pulse">Game Board Grid</p>
              </div>
            </div>
            <div className="h-40 bg-black/80 rounded-xl border-4 border-black p-3 flex flex-col">
              <span className="text-white font-bold text-xl mb-2 tracking-wider">CHAT BOX</span>
              <div className="flex-1 overflow-y-auto"></div>
              <input type="text" placeholder="Enter the message" className="bg-black/50 border-2 border-gray-700 rounded-lg p-2 text-white outline-none focus:border-orange-500 transition-colors font-pixel" />
            </div>
          </div>
          <div className="w-[45%] bg-amber-100/90 rounded-xl border-4 border-black flex flex-col relative overflow-hidden shadow-2xl">
            <div className="flex bg-amber-200/50 border-b-4 border-black">
              <div className="w-1/2 p-4 text-center border-r-4 border-black">
                <h2 className="text-black text-2xl font-bold">Block Code</h2>
              </div>
              <div className="w-1/2 p-4 text-center relative flex flex-col items-center justify-center">
                <div className="absolute -top-3 bg-orange-700 text-white px-3 py-1 rounded-full border-2 border-black text-xs">29 BLOCK LEFT</div>
                <h2 className="text-black text-2xl font-bold mt-2">Your Program</h2>
              </div>
            </div>
            <div className="flex flex-1">
              <div className="w-1/2 border-r-4 border-black p-4 flex flex-col gap-3">
                <button className="bg-[#D2B48C] border-b-4 border-r-4 border-amber-900 rounded-lg p-3 text-black font-bold text-left hover:brightness-110 active:border-b-0 active:border-r-0 active:translate-y-1 transition-all">Move Forward</button>
                <button className="bg-[#D2B48C] border-b-4 border-r-4 border-amber-900 rounded-lg p-3 text-black font-bold text-left flex justify-between hover:brightness-110 active:border-b-0 active:border-r-0 active:translate-y-1 transition-all"><span>Move Left</span> <span>↰</span></button>
                <button className="bg-[#D2B48C] border-b-4 border-r-4 border-amber-900 rounded-lg p-3 text-black font-bold text-left flex justify-between hover:brightness-110 active:border-b-0 active:border-r-0 active:translate-y-1 transition-all"><span>Move Right</span> <span>↱</span></button>
              </div>
              <div className="w-1/2 p-4"></div>
            </div>
            <button className="absolute bottom-4 right-4 bg-orange-600 text-white px-6 py-3 rounded-full border-4 border-black text-xl font-bold hover:bg-orange-700 active:scale-95 transition-transform flex items-center gap-2 shadow-lg">
              RUN PROGRAM <span>▶</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ถ้ายังไม่ Login ให้โชว์หน้าจอแรก (Landing)
  return (
    <div 
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat cursor-pointer overflow-hidden font-pixel"
      // ฉากหน้าแรกสุดที่เป็นพระอาทิตย์ขึ้น
      style={{ backgroundImage: "url('/landing.png')" }}
      onClick={() => !isLoginModalOpen && setIsLoginModalOpen(true)}
    >
      {!isLoginModalOpen && (
        <>
          <div className="absolute top-1/2 -translate-y-1/2 right-10 md:right-32 flex flex-col items-start leading-none tracking-widest drop-shadow-md">
            <h1 className="text-black text-6xl md:text-8xl lg:text-9xl font-bold">Code In</h1>
            <h1 className="text-black text-6xl md:text-8xl lg:text-9xl font-bold mt-4">The Dark</h1>
          </div>
          <div className="absolute bottom-12 w-full text-center">
            <p className="text-gray-900 font-bold text-2xl md:text-3xl animate-pulse drop-shadow-md">- Click Anywhere to Start -</p>
          </div>
        </>
      )}

      {/* 3. ป๊อปอัป Login */}
      {isLoginModalOpen && (
        <div 
          className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4 transition-opacity duration-300 ease-in-out cursor-default"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <h2 className="text-black text-5xl md:text-7xl mb-10 drop-shadow-xl text-center relative z-10">Code In The Dark</h2>
          <div 
            className="relative w-full max-w-[600px] h-[450px] md:max-w-[800px] md:h-[550px] flex flex-col items-center justify-center cursor-auto"
            // ม้วนกระดาษ
            style={{ 
              backgroundImage: "url('/score.png')", 
              backgroundSize: "130% 130%", 
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              className="absolute top-3 left-10 text-black text-4xl font-bold hover:text-orange-700 transition-colors flex items-center gap-2 z-10 drop-shadow-sm" 
              onClick={() => setIsLoginModalOpen(false)}
            >
              <span>&#8592;</span>
            </button>
            <div className="w-full px-16 md:px-32 py-8 flex flex-col gap-6 mt-8">
              <div className="flex flex-col gap-1">
                <label className="text-black text-xl font-bold drop-shadow-sm">Username</label>
                <input type="text" className="bg-amber-100/70 p-3 rounded-lg border-4 border-black text-black text-xl outline-none focus:bg-amber-100 focus:border-orange-600 transition-colors shadow-inner font-pixel" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-black text-xl font-bold drop-shadow-sm">Password</label>
                <input type="password" className="bg-amber-100/70 p-3 rounded-lg border-4 border-black text-black text-xl outline-none focus:bg-amber-100 focus:border-orange-600 transition-colors shadow-inner font-pixel" />
              </div>
              <div className="flex justify-center gap-8 mt-4">
                <button className="bg-amber-100 text-black px-6 py-2 rounded-full border-4 border-black text-xl hover:bg-amber-200 shadow-md transition-transform active:scale-95">Sign up</button>
                <button 
                  onClick={() => setIsLoggedIn(true)} 
                  className="bg-orange-600 text-white px-6 py-2 rounded-full border-4 border-black text-xl hover:bg-orange-700 shadow-md transition-transform active:scale-95"
                >
                  Log in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;