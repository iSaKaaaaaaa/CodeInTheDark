import React from 'react';

export default function GameBoard() {
  return (
    <div className="flex-1 bg-amber-900/40 rounded-xl border-4 border-black p-4 relative backdrop-blur-sm">
      <div className="w-full h-full border-4 border-amber-950 bg-amber-100/80 rounded-lg flex items-center justify-center">
        <p className="text-amber-900 text-2xl animate-pulse">Game Board Grid</p>
      </div>
    </div>
  );
}