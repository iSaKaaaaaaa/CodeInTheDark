import React from 'react';

export default function ChatBox() {
  return (
    <div className="h-40 bg-black/80 rounded-xl border-4 border-black p-3 flex flex-col">
      <span className="text-white font-bold text-xl mb-2 tracking-wider">CHAT BOX</span>
      <div className="flex-1 overflow-y-auto"></div>
      <input
        type="text"
        placeholder="Enter the message"
        className="bg-black/50 border-2 border-gray-700 rounded-lg p-2 text-white outline-none focus:border-orange-500 transition-colors font-pixel"
      />
    </div>
  );
}