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

  // ระดับความเร่งด่วนของเวลาสลับบทบาท (Role Swap)
  const isSwapWarning = swapTimeLeft !== undefined && swapTimeLeft <= 20 && swapTimeLeft > 10;
  const isSwapUrgent = (swapTimeLeft !== undefined && swapTimeLeft <= 10) || swapProgress <= 8.5;

  // ระดับความเร่งด่วนของเวลาด่านทั้งหมด (Stage Time: 300s)
  const isStageWarning = dungeonTimeLeft <= 60 && dungeonTimeLeft > 30;
  const isStageCritical = dungeonTimeLeft <= 30 && dungeonTimeLeft > 10;
  const isStageFinal = dungeonTimeLeft <= 10 && dungeonTimeLeft > 0;
  const stageProgress = Math.max(0, Math.min(100, (dungeonTimeLeft / 300) * 100));

  return (
    <header className="w-full flex flex-col lg:flex-row items-center justify-between gap-3 font-pixel">
      {/* ─── LEFT & CENTER GROUP: ROLE + SWAP COUNTDOWN BAR BESIDE IT ─── */}
      <div className="w-full lg:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-5 flex-1 min-w-0">
        {/* 1. Role Title & Subtitle — คำว่า คนขับ/ผู้นำทาง อยู่หน้าหน้าที่ที่ต้องทำ */}
        <div className="flex flex-col items-start shrink-0 px-1">
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-wider font-pixel leading-none ${
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
              className={`px-2 py-0.5 rounded-md font-thai font-bold text-xs sm:text-sm border ${
                isDriver
                  ? "bg-amber-500/20 text-amber-200 border-amber-400/70"
                  : "bg-sky-500/20 text-sky-200 border-sky-400/70"
              }`}
              style={{ textShadow: "1px 1px 0 #000" }}
            >
              {isDriver ? "คนขับ" : "ผู้นำทาง"}
            </span>
            <span
              className="text-xs sm:text-sm font-thai font-medium text-gray-200/95"
              style={{ textShadow: "1px 1px 0 #000" }}
            >
              {isDriver
                ? "ลากบล็อกคำสั่งเดินและกด RUN"
                : "ดูแผนที่เขาวงกตและพิมพ์บอกทาง"}
            </span>
          </div>
        </div>

        {/* 2. Role Swap Countdown Bar — วางอยู่ข้างๆ Role ในแนวเดียวกัน */}
        <div
          className={`w-full sm:w-auto flex-1 max-w-[380px] border-2 rounded-xl px-4 py-2 backdrop-blur-sm flex flex-col justify-center gap-1.5 transition-all duration-300 ${
            isSwapUrgent
              ? "border-red-500 bg-red-950/75 shadow-[0_0_18px_rgba(239,68,68,0.5)]"
              : isSwapWarning
                ? "border-orange-400 bg-[#2a1205]/90"
                : isDriver
                  ? "bg-[#140b06]/90 border-[#8B5E3C]/80 shadow-lg"
                  : "bg-[#140b06]/90 border-sky-800/80 shadow-lg"
          }`}
        >
          {/* Top Label & Timer */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 font-thai">
              <span
                className={`text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap ${
                  isSwapUrgent ? "text-red-200" : "text-[#fde68a]"
                }`}
              >
                สลับบทบาทใน (Role Swap):
              </span>
              {isSwapUrgent && (
                <span className="text-red-400 text-xs font-bold animate-pulse whitespace-nowrap">
                  (ใกล้สลับ)
                </span>
              )}
            </div>

            <span
              className={`font-pixel font-bold text-2xl sm:text-3xl tracking-wider leading-none ${
                isSwapUrgent
                  ? "text-red-400 animate-pulse"
                  : isSwapWarning
                    ? "text-orange-300"
                    : isDriver
                      ? "text-amber-300"
                      : "text-sky-300"
              }`}
              style={{ textShadow: "1.5px 1.5px 0 #000" }}
            >
              {swapTime}
            </span>
          </div>

          {/* Progress Bar Track & Fill */}
          <div className="w-full h-2.5 bg-black/85 rounded-full border border-[#4a2612] overflow-hidden relative shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 linear ${
                isSwapUrgent
                  ? "bg-red-500 animate-pulse"
                  : isSwapWarning
                    ? "bg-orange-500"
                    : isDriver
                      ? "bg-gradient-to-r from-amber-600 to-amber-400"
                      : "bg-gradient-to-r from-sky-600 to-sky-400"
              }`}
              style={{ width: `${swapProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── RIGHT GROUP: STAGE TIME & UTILITY CONTROLS ─── */}
      <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
        {/* Blocks Left Counter (if active for Driver) */}
        {blocksLeft !== undefined && (
          <div className="bg-[#140b06]/95 border-2 border-[#8B5E3C]/80 rounded-xl px-3 py-1.5 shadow-xl backdrop-blur-md flex flex-col items-center justify-center min-w-[76px]">
            <span className="text-[#fde68a] text-[11px] font-medium font-thai tracking-wide leading-none mb-0.5">
              บล็อกที่เหลือ
            </span>
            <span
              className="text-white text-xl sm:text-2xl font-pixel font-bold leading-none"
              style={{ textShadow: "1px 1px 0 #000" }}
            >
              {blocksLeft}
            </span>
          </div>
        )}

        {/* Utility Menu (Sound Volume + Leave Stage) */}
        <TopRightMenu inline />

        {/* Stage Time Box — เรียบง่าย เปลี่ยนสีและหลอดเวลาตามความเร่งด่วน */}
        <div
          className={`border-2 rounded-2xl px-5 sm:px-6 py-2 backdrop-blur-md flex flex-col items-center justify-center min-w-[160px] sm:min-w-[180px] transition-all duration-300 relative overflow-hidden ${
            isStageFinal
              ? "bg-red-950/95 border-red-400 shadow-[0_0_24px_rgba(239,68,68,0.8)] animate-pulse"
              : isStageCritical
                ? "bg-red-950/90 border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.6)]"
                : isStageWarning
                  ? "bg-[#2b1206]/95 border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                  : "bg-[#1c0f07]/95 border-amber-600/90 shadow-xl"
          }`}
        >
          <span
            className={`text-xs sm:text-sm font-medium font-thai tracking-wider leading-none mb-1 whitespace-nowrap ${
              isStageFinal || isStageCritical
                ? "text-red-200 font-bold"
                : isStageWarning
                  ? "text-orange-200"
                  : "text-amber-200/90"
            }`}
          >
            {isStageFinal || isStageCritical
              ? "เวลาใกล้หมด (STAGE TIME)"
              : "เวลาด่าน (STAGE TIME)"}
          </span>

          <span
            className={`text-3xl sm:text-4xl font-pixel font-bold tracking-[0.08em] leading-none text-center transition-colors duration-200 ${
              isStageFinal || isStageCritical
                ? "text-red-300 animate-pulse"
                : isStageWarning
                  ? "text-orange-300"
                  : "text-white"
            }`}
            style={{
              textShadow:
                isStageFinal || isStageCritical
                  ? "2px 2px 0px #450a0a, 3px 3px 0px #000"
                  : "2px 2px 0px #78350f, 3px 3px 0px #000",
            }}
          >
            {dungeonTime}
          </span>

          {/* หลอดเวลาด่าน (Stage Progress Bar) */}
          <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden mt-1.5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-1000 linear ${
                isStageFinal || isStageCritical
                  ? "bg-red-500 animate-pulse"
                  : isStageWarning
                    ? "bg-orange-500"
                    : "bg-amber-500"
              }`}
              style={{ width: `${stageProgress}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
