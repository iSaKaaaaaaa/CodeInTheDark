import TopRightMenu from "../TopRightMenu";

interface GameHeaderProps {
  role?: string;
  dungeonTime?: string;
  dungeonTimeLeft?: number;
  swapTime?: string;
  swapProgress?: number;
  swapTimeLeft?: number;
  blocksLeft?: number;
}

export default function GameHeader({
  role = "DRIVER",
  dungeonTime = "5:00",
  dungeonTimeLeft = 300,
  swapTime = "02:00",
  swapProgress = 100,
  swapTimeLeft,
  blocksLeft,
}: GameHeaderProps) {
  const isDriver = role.toUpperCase().includes("DRIVER");

  // Role swap bar: colored by current role (Driver = amber, Navigator = sky). Pulses only when swap is imminent.
  const isSwapUrgent = (swapTimeLeft !== undefined && swapTimeLeft <= 10) || swapProgress <= 8.5;
  const swapTheme = isDriver
    ? {
        box: "border-amber-500/80 bg-[#241a06]/90 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
        label: "text-amber-200",
        time: "text-amber-300",
        shadow: "1.5px 1.5px 0 #78350f",
        bar: "bg-gradient-to-r from-amber-600 to-amber-400",
        soon: "text-amber-300",
      }
    : {
        box: "border-sky-500/80 bg-[#06202e]/90 shadow-[0_0_15px_rgba(14,165,233,0.3)]",
        label: "text-sky-200",
        time: "text-sky-300",
        shadow: "1.5px 1.5px 0 #082f49",
        bar: "bg-gradient-to-r from-sky-600 to-sky-400",
        soon: "text-sky-300",
      };

  // Urgency levels for dungeon stage time (300s total: Green -> Yellow -> Orange -> Red)
  const isStageFinal = dungeonTimeLeft <= 10 && dungeonTimeLeft > 0;
  const isStageCritical = dungeonTimeLeft <= 30 && dungeonTimeLeft > 10;
  const isStageWarning = dungeonTimeLeft <= 60 && dungeonTimeLeft > 30;
  const isStageCaution = dungeonTimeLeft <= 150 && dungeonTimeLeft > 60;
  const stageProgress = Math.max(0, Math.min(100, (dungeonTimeLeft / 300) * 100));

  return (
    <header className="w-full flex flex-col lg:flex-row items-center justify-between gap-3 font-game-body">
      {/* ─── LEFT & CENTER GROUP: ROLE + SWAP COUNTDOWN BAR ─── */}
      <div className="w-full lg:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-5 flex-1 min-w-0">
        {/* Role Title & Objective */}
        <div className="flex flex-col items-start shrink-0 px-1">
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-wider font-pixel leading-none ${
              isDriver ? "text-[#fbbf24]" : "text-[#38bdf8]"
            }`}
            style={{
              textShadow: isDriver
                ? "-2px -2px 0 #451a03, 2px -2px 0 #451a03, -2px 2px 0 #451a03, 2px 2px 0 #451a03, 0 4px 0 #9a3412, 0 6px 12px rgba(0,0,0,0.9)"
                : "-2px -2px 0 #082f49, 2px -2px 0 #082f49, -2px 2px 0 #082f49, 2px 2px 0 #082f49, 0 4px 0 #0369a1, 0 6px 12px rgba(0,0,0,0.9)",
            }}
          >
            {role}
          </h1>

          <div className="mt-1 flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-md font-game-sub font-bold text-xs uppercase border ${
                isDriver
                  ? "bg-amber-500/20 text-amber-200 border-amber-400/70"
                  : "bg-sky-500/20 text-sky-200 border-sky-400/70"
              }`}
              style={{ textShadow: "1px 1px 0 #000" }}
            >
              {isDriver ? "DRIVER" : "NAVIGATOR"}
            </span>
            <span
              className="text-xs sm:text-sm font-game-body font-medium text-gray-200/95"
              style={{ textShadow: "1px 1px 0 #000" }}
            >
              {isDriver
                ? "Code movement blocks & press RUN"
                : "Read the map & guide in chat"}
            </span>
          </div>
        </div>

        {/* Role Swap Countdown Bar (colored by current role) */}
        <div
          className={`w-full sm:w-auto flex-1 max-w-[380px] border-2 rounded-xl px-4 py-2 backdrop-blur-sm flex flex-col justify-center gap-1.5 transition-all duration-300 ${swapTheme.box} ${
            isSwapUrgent ? "animate-pulse" : ""
          }`}
        >
          {/* Top Label & Timer */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 font-game-sub">
              <span
                className={`text-xs sm:text-sm font-bold tracking-wide uppercase whitespace-nowrap ${swapTheme.label}`}
              >
                ROLE SWAP IN:
              </span>
              {isSwapUrgent && (
                <span className={`${swapTheme.soon} text-xs font-black animate-pulse uppercase whitespace-nowrap`}>
                  (SWAPPING SOON)
                </span>
              )}
            </div>

            <span
              className={`font-pixel font-bold text-2xl sm:text-3xl tracking-wider leading-none ${swapTheme.time} ${
                isSwapUrgent ? "animate-pulse" : ""
              }`}
              style={{ textShadow: swapTheme.shadow }}
            >
              {swapTime}
            </span>
          </div>

          {/* Progress Bar Track & Fill */}
          <div className="w-full h-2.5 bg-black/85 rounded-full border border-white/10 overflow-hidden relative shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 linear ${swapTheme.bar} ${
                isSwapUrgent ? "animate-pulse" : ""
              }`}
              style={{ width: `${swapProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── RIGHT GROUP: STAGE TIME & UTILITY CONTROLS ─── */}
      <div className="flex items-center justify-end gap-2.5 sm:gap-3.5 shrink-0">
        {/* Blocks Left Counter */}
        {blocksLeft !== undefined && (
          <div className="bg-[#140b06]/95 border-2 border-[#8B5E3C]/80 rounded-xl px-3 py-1.5 shadow-xl backdrop-blur-md flex flex-col items-center justify-center min-w-[76px]">
            <span className="text-[#fde68a] text-[10px] font-bold font-game-sub uppercase tracking-wider leading-none mb-0.5">
              BLOCKS LEFT
            </span>
            <span
              className="text-white text-xl sm:text-2xl font-pixel font-bold leading-none"
              style={{ textShadow: "1px 1px 0 #000" }}
            >
              {blocksLeft}
            </span>
          </div>
        )}

        {/* Stage Time Box (Green -> Yellow -> Orange -> Red) */}
        <div
          className={`border-2 rounded-2xl px-6 sm:px-8 py-2 backdrop-blur-md flex flex-col items-center justify-center min-w-[200px] sm:min-w-[230px] md:min-w-[250px] transition-all duration-300 relative overflow-hidden ${
            isStageFinal || isStageCritical
              ? "bg-red-950/95 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.8)] animate-pulse"
              : isStageWarning
                ? "bg-[#2b1206]/95 border-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.5)]"
                : isStageCaution
                  ? "bg-[#241a06]/95 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                  : "bg-[#052212]/95 border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          }`}
        >
          <span
            className={`text-xs font-bold font-game-sub uppercase tracking-wider leading-none mb-1 whitespace-nowrap ${
              isStageFinal || isStageCritical
                ? "text-red-200"
                : isStageWarning
                  ? "text-orange-200"
                  : isStageCaution
                    ? "text-amber-200/90"
                    : "text-emerald-200/90"
            }`}
          >
            {isStageFinal || isStageCritical
              ? "STAGE TIME CRITICAL"
              : "STAGE TIME"}
          </span>

          <span
            className={`text-3xl sm:text-4xl font-pixel font-bold tracking-[0.08em] leading-none text-center transition-colors duration-200 ${
              isStageFinal || isStageCritical
                ? "text-red-300 animate-pulse"
                : isStageWarning
                  ? "text-orange-300"
                  : isStageCaution
                    ? "text-amber-300"
                    : "text-white"
            }`}
            style={{
              textShadow:
                isStageFinal || isStageCritical
                  ? "2px 2px 0px #450a0a, 3px 3px 0px #000"
                  : isStageWarning
                    ? "2px 2px 0px #7c2d12, 3px 3px 0px #000"
                    : isStageCaution
                      ? "2px 2px 0px #78350f, 3px 3px 0px #000"
                      : "2px 2px 0px #064e3b, 3px 3px 0px #000",
            }}
          >
            {dungeonTime}
          </span>

          {/* Stage Progress Bar */}
          <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden mt-1.5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-1000 linear ${
                isStageFinal || isStageCritical
                  ? "bg-red-500 animate-pulse"
                  : isStageWarning
                    ? "bg-orange-500"
                    : isStageCaution
                      ? "bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400"
                      : "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400"
              }`}
              style={{ width: `${stageProgress}%` }}
            />
          </div>
        </div>

        {/* Utility Menu (Volume + Leave vertically stacked) */}
        <TopRightMenu inline />
      </div>
    </header>
  );
}
