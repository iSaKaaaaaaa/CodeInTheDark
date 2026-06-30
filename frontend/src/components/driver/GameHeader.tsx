interface GameHeaderProps {
  role?: string;
  dungeonTime?: string;
  swapTime?: string;
  swapProgress?: number; // รับค่า 0 - 100 เพื่อคำนวณความยาวหลอด
}

export default function GameHeader({
  role = "DRIVER",
  dungeonTime = "5:00",
  swapTime = "02:00",
  swapProgress = 100,
}: GameHeaderProps) {
  return (
    <header className="flex justify-between items-start md:items-center w-full">
      <h1 className="text-white text-5xl md:text-6xl font-bold drop-shadow-md uppercase">
        {role}
      </h1>

      <div className="flex flex-col items-center bg-black/60 px-8 py-2 rounded-full border-4 border-black shadow-lg">
        <span className="text-blue-300 font-bold tracking-widest mb-1 text-sm md:text-base">
          ROLE SWAP
        </span>
        <div className="w-48 md:w-80 h-4 bg-black rounded-full border-2 border-black overflow-hidden relative">
          {/* ปรับความกว้างของหลอดตามค่า swapProgress */}
          <div
            className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-1000 linear"
            style={{ width: `${swapProgress}%` }}
          ></div>
        </div>
        <span className="text-white text-xs mt-1">{swapTime}</span>
      </div>

      <div className="flex flex-col items-end">
        <span className="text-orange-600 font-bold text-sm md:text-base drop-shadow-sm tracking-widest">
          DUNGEON TIME
        </span>
        <div className="flex items-center gap-2">
          <span className="text-white text-4xl md:text-5xl font-bold drop-shadow-md">
            {dungeonTime}
          </span>
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
