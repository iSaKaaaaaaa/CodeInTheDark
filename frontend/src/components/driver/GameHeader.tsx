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

/**
 * แถบหัวด้านบนของหน้าจอเกม (GameHeader):
 * - แสดงป้ายบอกบทบาทของผู้เล่น (DRIVER / NAVIGATOR) พร้อมคำแนะนำเป้าหมาย
 * - แถบนับถอยหลังการสลับบทบาท (Role Swap Countdown)
 * - นาฬิกาจับเวลาด่านดันเจี้ยน (Stage Time 300 วินาที พร้อมแถบสีเตือนความเร่งด่วน เขียว -> เหลือง -> ส้ม -> แดง)
 * - เมนูควบคุมเสียงและปุ่มออกจากด่าน (TopRightMenu Inline)
 */
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

  // กำหนดธีมสีของแถบสลับบทบาท (Driver = สีอำพัน/ส้ม, Navigator = สีฟ้า) และกะพริบเตือนเมื่อใกล้หมดเวลา (<= 10 วินาที)
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

  // ระดับความเร่งด่วนของเวลาดันเจี้ยน (เวลารวม 300 วินาที)
  const isStageFinal = dungeonTimeLeft <= 10 && dungeonTimeLeft > 0;
  const isStageCritical = dungeonTimeLeft <= 30 && dungeonTimeLeft > 10;
  const isStageWarning = dungeonTimeLeft <= 60 && dungeonTimeLeft > 30;
  const isStageCaution = dungeonTimeLeft <= 150 && dungeonTimeLeft > 60;
  const stageProgress = Math.max(0, Math.min(100, (dungeonTimeLeft / 300) * 100));

  return (
    <header className="w-full flex flex-col md:flex-row items-center justify-between gap-2 md:gap-3 font-game-body">
      {/* ─── กลุ่มฝั่งซ้ายและตรงกลาง: บทบาทผู้เล่น และแถบนับถอยหลัง Role Swap ─── */}
      <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3.5 lg:gap-5 flex-1 min-w-0">
        {/* ป้ายแสดงบทบาทและเป้าหมาย */}
        <div className="flex flex-col items-start shrink-0 px-1 max-w-full">
          <h1
            className={`font-bold uppercase tracking-wider font-pixel leading-none ${
              isDriver ? "text-[#fbbf24]" : "text-[#38bdf8]"
            }`}
            style={{
              fontSize: "clamp(24px, min(3vw, 5vh), 48px)",
              textShadow: isDriver
                ? "-2px -2px 0 #451a03, 2px -2px 0 #451a03, -2px 2px 0 #451a03, 2px 2px 0 #451a03, 0 4px 0 #9a3412, 0 6px 12px rgba(0,0,0,0.9)"
                : "-2px -2px 0 #082f49, 2px -2px 0 #082f49, -2px 2px 0 #082f49, 2px 2px 0 #082f49, 0 4px 0 #0369a1, 0 6px 12px rgba(0,0,0,0.9)",
            }}
          >
            {role}
          </h1>

          <div className="mt-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span
              className={`px-1.5 py-0.5 rounded-md font-game-sub font-bold uppercase border leading-none ${
                isDriver
                  ? "bg-amber-500/20 text-amber-200 border-amber-400/70"
                  : "bg-sky-500/20 text-sky-200 border-sky-400/70"
              }`}
              style={{
                fontSize: "clamp(9.5px, min(0.8vw, 1.4vh), 13px)",
                textShadow: "1px 1px 0 #000",
              }}
            >
              {isDriver ? "DRIVER" : "NAVIGATOR"}
            </span>
            <span
              className="font-game-body font-medium text-gray-200/95 leading-tight"
              style={{
                fontSize: "clamp(11px, min(1vw, 1.75vh), 17px)",
                textShadow: "1px 1px 0 #000",
              }}
            >
              {isDriver
                ? "Code movement blocks & press RUN"
                : "Read the map & guide in chat"}
            </span>
          </div>
        </div>

        {/* แถบนับถอยหลัง Role Swap */}
        <div
          style={{ padding: "clamp(5px, 0.85vh, 9px) clamp(10px, 1.1vw, 16px)" }}
          className={`w-full sm:w-auto flex-1 max-w-[450px] min-w-[170px] border-2 rounded-xl backdrop-blur-sm flex flex-col justify-center gap-1 transition-all duration-300 ${swapTheme.box} ${
            isSwapUrgent ? "animate-pulse" : ""
          }`}
        >
          {/* ป้ายกำกับและตัวเลขนับถอยหลัง */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-game-sub min-w-0">
              <span
                style={{ fontSize: "clamp(11px, min(1vw, 1.75vh), 16.5px)" }}
                className={`font-bold tracking-wide uppercase whitespace-nowrap ${swapTheme.label}`}
              >
                ROLE SWAP IN:
              </span>
              {isSwapUrgent && (
                <span
                  style={{ fontSize: "clamp(9.5px, min(0.8vw, 1.4vh), 12.5px)" }}
                  className={`${swapTheme.soon} font-black animate-pulse uppercase whitespace-nowrap`}
                >
                  (SWAPPING SOON)
                </span>
              )}
            </div>

            <span
              className={`font-pixel font-bold tracking-wider leading-none shrink-0 ${swapTheme.time} ${
                isSwapUrgent ? "animate-pulse" : ""
              }`}
              style={{
                fontSize: "clamp(18px, min(1.9vw, 3.3vh), 31px)",
                textShadow: swapTheme.shadow,
              }}
            >
              {swapTime}
            </span>
          </div>

          {/* แถบหลอดความคืบหน้า */}
          <div
            style={{ height: "clamp(6px, 0.9vh, 10px)" }}
            className="w-full bg-black/85 rounded-full border border-white/10 overflow-hidden relative shadow-inner"
          >
            <div
              className={`h-full rounded-full transition-all duration-1000 linear ${swapTheme.bar} ${
                isSwapUrgent ? "animate-pulse" : ""
              }`}
              style={{ width: `${swapProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── กลุ่มฝั่งขวา: STAGE TIME และปุ่มเมนูระบบ ─── */}
      <div className="flex items-stretch justify-end gap-2 sm:gap-2.5 shrink-0">
        {/* ตัวนับโควตาบล็อกที่เหลือ */}
        {blocksLeft !== undefined && (
          <div className="bg-[#140b06]/95 border-2 border-[#8B5E3C]/80 rounded-xl px-3 py-1.5 shadow-xl backdrop-blur-md flex flex-col items-center justify-center min-w-[72px]">
            <span className="text-[#fde68a] text-xs font-bold font-game-sub uppercase tracking-wider leading-none mb-0.5">
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

        {/* กล่องเวลารวมดันเจี้ยน (เปลี่ยนสีตามความเร่งด่วน เขียว -> เหลือง -> ส้ม -> แดง) */}
        <div
          style={{
            minWidth: "clamp(124px, 13vw, 225px)",
            padding: "clamp(5px, 0.8vh, 9px) clamp(12px, 1.4vw, 26px)",
          }}
          className={`border-2 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${
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
            style={{ fontSize: "clamp(10.5px, min(0.9vw, 1.6vh), 15px)" }}
            className={`font-bold font-game-sub uppercase tracking-wider leading-none mb-1 whitespace-nowrap ${
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
            className={`font-pixel font-bold tracking-[0.08em] leading-none text-center transition-colors duration-200 ${
              isStageFinal || isStageCritical
                ? "text-red-300 animate-pulse"
                : isStageWarning
                  ? "text-orange-300"
                  : isStageCaution
                    ? "text-amber-300"
                    : "text-white"
            }`}
            style={{
              fontSize: "clamp(21px, min(2.3vw, 3.9vh), 38px)",
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

          {/* แถบแสดงความคืบหน้าของเวลาในด่าน */}
          <div
            style={{ height: "clamp(4px, 0.65vh, 6px)" }}
            className="w-full bg-black/80 rounded-full overflow-hidden mt-1.5 border border-white/10"
          >
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

        {/* เมนูควบคุมระดับเสียงและออกจากเกม */}
        <TopRightMenu inline />
      </div>
    </header>
  );
}
