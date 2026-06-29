import React from 'react';
import GameHeader from '../components/driver/GameHeader';
import GameBoard from '../components/driver/GameBoard';
import ChatBox from '../components/driver/ChatBox';
import BlockCodePanel from '../components/driver/BlockCodePanel';

export default function DriverScreen() {
  return (
    <div
      className="w-full min-h-screen bg-cover bg-center flex flex-col p-4 md:p-6 font-pixel gap-4 cursor-default"
      // ฉากหลังตอนเล่นเกม (รูปที่มีแท่นนอนอียิปต์)
      style={{ backgroundImage: "url('/ingame.png')" }}
    >
      <GameHeader />

      <div className="flex flex-1 gap-6 w-full max-w-[1600px] mx-auto">
        <div className="w-[55%] flex flex-col gap-4">
          <GameBoard />
          <ChatBox />
        </div>
        <BlockCodePanel />
      </div>
    </div>
  );
}