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
  let barColor = "bg-green-500";
  if (swapProgress <= 25) {
    barColor = "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]"; // Add glowing effect when critical
  } else if (swapProgress <= 50) {
    barColor = "bg-orange-500";
  }

  return (
    <header className="grid grid-cols-3 items-center w-full">
      <h1 
        className="text-white text-5xl md:text-6xl font-bold uppercase justify-self-start"
        style={{ textShadow: "1px 1px 0 #ea580c, 2px 2px 0 #ea580c, 3px 3px 0 #ea580c, 4px 4px 0 #ea580c, 5px 5px 4px rgba(0,0,0,0.8)" }}
      >
        {role}
      </h1>

      <div className="flex flex-col items-center bg-black/80 px-8 md:px-16 py-3 rounded-full border-4 border-black shadow-2xl justify-self-center">
        <span className="text-blue-300 font-bold tracking-widest mb-1 text-xl md:text-2xl drop-shadow-sm">
          ROLE SWAP
        </span>
        <div className="w-72 md:w-[600px] h-4 md:h-5 bg-gray-900 rounded-full border-2 border-black overflow-hidden relative shadow-inner">
          <div
            className={`absolute top-0 left-0 h-full ${barColor} transition-all duration-1000 linear`}
            style={{ width: `${swapProgress}%` }}
          ></div>
        </div>
        <span className="text-white text-xl md:text-2xl mt-2 font-bold tracking-widest drop-shadow-md">{swapTime}</span>
      </div>

      <div className="flex flex-col items-center justify-self-end bg-black/70 backdrop-blur-sm px-6 py-3 rounded-2xl border-4 border-[#333] shadow-2xl">
        <span className="text-orange-600 font-bold text-xl md:text-2xl drop-shadow-sm tracking-widest mb-1">
          DUNGEON TIME
        </span>
        <div className="flex items-center gap-2">
          <span className="text-white text-5xl md:text-6xl font-bold drop-shadow-md">
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
