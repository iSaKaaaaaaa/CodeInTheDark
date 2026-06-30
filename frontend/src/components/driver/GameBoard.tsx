import React from "react";

interface Props {
  playerX: number;
  playerY: number;
  direction: "up" | "right" | "down" | "left";
  walls?: { x: number; y: number }[];
}

const SIZE = 10;

const getPlayerEmoji = (direction: string) => {
  switch (direction) {
    case "up":
      return "⬆️";
    case "right":
      return "➡️";
    case "down":
      return "⬇️";
    case "left":
      return "⬅️";
    default:
      return "⬆️";
  }
};

export default function GameBoard({
  playerX = 5,
  playerY = 8,
  direction = "up",
  walls = [],
}: Props) {
  return (
    <div className="flex-1 bg-amber-900/40 rounded-xl border-4 border-black p-4 relative backdrop-blur-sm flex items-center justify-center">
      {/* สร้างกริด 10x10 ผ่าน Tailwind CSS เพื่อความสวยงามและตอบสนองตามขนาดกรอบ */}
      <div className="w-full max-w-[500px] aspect-square border-4 border-amber-950 bg-amber-100/80 rounded-lg grid grid-cols-10 grid-rows-10 overflow-hidden shadow-inner">
        {Array.from({ length: SIZE * SIZE }).map((_, index) => {
          const x = index % SIZE;
          const y = Math.floor(index / SIZE);

          const isPlayer = x === playerX && y === playerY;
          const isGoal = x === 6 && y === 1; // ตำแหน่งเส้นชัย
          const isWall = walls.some((wall) => wall.x === x && wall.y === y);

          return (
            <div
              key={index}
              className="border border-amber-900/20 flex items-center justify-center text-xl sm:text-2xl bg-amber-50/50"
            >
              {isPlayer ? (
                <span className="drop-shadow-md">
                  {getPlayerEmoji(direction)}
                </span>
              ) : isGoal ? (
                <span className="drop-shadow-md animate-bounce">🚩</span>
              ) : isWall ? (
                <span className="opacity-80">🧱</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
