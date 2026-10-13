interface GameHeaderProps {
  role?: string;
  dungeonTime?: string;
  swapTime?: string;
  swapProgress?: number;
  blocksLeft?: number;
}

export default function GameHeader({
  role = "DRIVER",
  dungeonTime = "5:00",
  swapTime = "02:00",
  swapProgress = 100,
  blocksLeft,
}: GameHeaderProps) {
  let barColor = "bg-green-500";
  if (swapProgress <= 25) {
    barColor = "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]";
  } else if (swapProgress <= 50) {
    barColor = "bg-orange-500";
  }

  const blocksWarning = blocksLeft !== undefined && blocksLeft <= 10;
  const blocksCritical = blocksLeft !== undefined && blocksLeft <= 5;

  return (
    <header className="flex items-center justify-between w-full gap-2 flex-wrap">
      {/* Role */}
      <h1
        className="text-white text-4xl md:text-5xl lg:text-6xl font-bold uppercase shrink-0"
        style={{ textShadow: "1px 1px 0 #ea580c, 2px 2px 0 #ea580c, 3px 3px 0 #ea580c, 4px 4px 4px rgba(0,0,0,0.8)" }}
      >
        {role}
      </h1>

      {/* Swap Bar — center */}
      <div className="flex flex-col items-center bg-black/80 px-5 md:px-8 lg:px-12 py-2 rounded-full border-2 border-black shadow-lg min-w-0 flex-1 max-w-[500px]">
        <span className="text-blue-300 font-bold tracking-widest text-sm md:text-base lg:text-lg drop-shadow-sm">
          ROLE SWAP
        </span>
        <div className="w-full h-3 md:h-4 bg-gray-900 rounded-full border-2 border-black overflow-hidden relative shadow-inner">
          <div
            className={`absolute top-0 left-0 h-full ${barColor} transition-all duration-1000 linear`}
            style={{ width: `${swapProgress}%` }}
          />
        </div>
        <span className="text-white text-lg md:text-xl lg:text-2xl mt-1 font-bold tracking-widest drop-shadow-md">{swapTime}</span>
      </div>

      {/* Right group: Blocks + Dungeon Time */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Blocks Left — persistent indicator */}
        {blocksLeft !== undefined && (
          <div className={`flex flex-col items-center bg-black/70 backdrop-blur-sm px-3 md:px-4 py-2 rounded-xl border-2 transition-all duration-300 ${
            blocksCritical
              ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.6)] animate-pulse'
              : blocksWarning
                ? 'border-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.4)]'
                : 'border-[#333]'
          }`}>
            <span className={`font-bold text-xs md:text-sm tracking-widest ${
              blocksCritical ? 'text-red-500' : blocksWarning ? 'text-orange-400' : 'text-[#fde68a]'
            }`}>
              BLOCKS
            </span>
            <span className={`text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-md ${
              blocksCritical ? 'text-red-500' : blocksWarning ? 'text-orange-400' : 'text-white'
            }`}>
              {blocksLeft}
            </span>
          </div>
        )}

        {/* Dungeon Time */}
        <div className="flex flex-col items-center bg-black/70 backdrop-blur-sm px-4 md:px-5 py-2 rounded-xl border-2 border-[#333] shadow-lg">
          <span className="text-orange-600 font-bold text-sm md:text-base drop-shadow-sm tracking-widest">
            DUNGEON
          </span>
          <span className="text-white text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-md">
            {dungeonTime}
          </span>
        </div>
      </div>
    </header>
  );
}
