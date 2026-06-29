import React from 'react';
import PixelButton from '../PixelButton';

interface BlockOption {
  label: string;
  icon?: string;
}

// รายการบล็อกคำสั่งที่ลากมาวางได้ — เพิ่ม/ลดบล็อกใหม่ทำได้ที่เดียว
const moveBlocks: BlockOption[] = [
  { label: 'Move Forward' },
  { label: 'Move Left', icon: '↰' },
  { label: 'Move Right', icon: '↱' },
];

interface BlockCodePanelProps {
  blocksLeft?: number;
  onRun?: () => void;
}

export default function BlockCodePanel({ blocksLeft = 29, onRun }: BlockCodePanelProps) {
  return (
    <div className="w-[45%] bg-amber-100/90 rounded-xl border-4 border-black flex flex-col relative overflow-hidden shadow-2xl">
      <div className="flex bg-amber-200/50 border-b-4 border-black">
        <div className="w-1/2 p-4 text-center border-r-4 border-black">
          <h2 className="text-black text-2xl font-bold">Block Code</h2>
        </div>
        <div className="w-1/2 p-4 text-center relative flex flex-col items-center justify-center">
          <div className="absolute -top-3 bg-orange-700 text-white px-3 py-1 rounded-full border-2 border-black text-xs">
            {blocksLeft} BLOCK LEFT
          </div>
          <h2 className="text-black text-2xl font-bold mt-2">Your Program</h2>
        </div>
      </div>

      <div className="flex flex-1">
        <div className="w-1/2 border-r-4 border-black p-4 flex flex-col gap-3">
          {moveBlocks.map((block) => (
            <PixelButton
              key={block.label}
              variant="wood"
              className="rounded-lg p-3 text-left flex justify-between"
            >
              <span>{block.label}</span>
              {block.icon && <span>{block.icon}</span>}
            </PixelButton>
          ))}
        </div>
        <div className="w-1/2 p-4"></div>
      </div>

      <PixelButton
        variant="orange"
        className="absolute bottom-4 right-4 rounded-full px-6 py-3 text-xl flex items-center gap-2 transition-transform"
        onClick={onRun}
      >
        RUN PROGRAM <span>▶</span>
      </PixelButton>
    </div>
  );
}