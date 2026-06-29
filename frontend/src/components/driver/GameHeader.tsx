import React from 'react';

export default function GameHeader() {
  return (
    <header className="flex justify-between items-start md:items-center w-full">
      <h1 className="text-white text-5xl md:text-6xl font-bold drop-shadow-md">DRIVER</h1>

      <div className="flex flex-col items-center bg-black/60 px-8 py-2 rounded-full border-4 border-black shadow-lg">
        <span className="text-blue-300 font-bold tracking-widest mb-1 text-sm md:text-base">
          ROLE SWAP
        </span>
        <div className="w-48 md:w-80 h-4 bg-black rounded-full border-2 border-black overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-green-500 w-full"></div>
        </div>
        <span className="text-white text-xs mt-1">02:00</span>
      </div>

      <div className="flex flex-col items-end">
        <span className="text-orange-600 font-bold text-sm md:text-base drop-shadow-sm tracking-widest">
          DUNGEON TIME
        </span>
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
  );
}