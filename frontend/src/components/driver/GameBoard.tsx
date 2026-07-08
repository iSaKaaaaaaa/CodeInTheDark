interface Props {
  playerX: number;
  playerY: number;
  direction: "up" | "right" | "down" | "left";
  walls?: { x: number; y: number }[];
  role?: "driver" | "navigator" | null;
}

const COL_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const ROW_LABELS = Array.from({ length: 13 }).map((_, i) => String(i + 1));

export default function GameBoard({
  playerX = 6,
  playerY = 11, // F11 is index (6, 11) in 15x15 grid
  direction = "up",
  walls = [],
  role = "driver",
}: Props) {
  // คำนวณเปอร์เซ็นต์ตำแหน่งของตัวละครสำหรับ Fog of War ในพื้นที่ 13x13 (ด้านใน)
  const playerInnerX = playerX - 1;
  const playerInnerY = playerY - 1;
  const playerXPercent = (playerInnerX + 0.5) * (100 / 13);
  const playerYPercent = (playerInnerY + 0.5) * (100 / 13);
  
  const fogMask = role === "navigator" 
    ? `radial-gradient(circle at ${playerXPercent}% ${playerYPercent}%, transparent 0%, transparent 16%, black 38%)`
    : undefined;

  return (
    <div className="flex-1 bg-amber-900/40 rounded-xl border-4 border-black p-4 relative backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-[520px] relative pt-10 pl-10 flex items-center justify-center">
        
        {/* แถบตัวอักษรบอกพิกัดด้านบน (A-M) */}
        <div className="absolute top-0 left-10 right-0 h-10 flex items-start justify-center">
          {/* ขยับซ้ายขวาให้ตรงกับ 13 ช่องด้านใน (86.666% คือ 13/15 ของกระดาน) */}
          <div className="w-[86.666%] h-8 bg-[#d2a356] border-4 border-[#572e18] text-black font-bold rounded-lg flex justify-around items-center shadow-md font-pixel z-10">
            {COL_LABELS.map((lbl, idx) => (
              <span key={idx} className="flex-1 text-center text-sm md:text-base leading-none">
                {lbl}
              </span>
            ))}
          </div>
        </div>

        {/* แถบตัวเลขบอกพิกัดด้านซ้าย (1-13) */}
        <div className="absolute left-0 top-10 bottom-0 w-10 flex items-center justify-end pr-2">
          <div className="h-[86.666%] w-8 bg-[#d2a356] border-4 border-[#572e18] text-black font-bold rounded-lg flex flex-col justify-around items-center shadow-md font-pixel z-10">
            {ROW_LABELS.map((lbl, idx) => (
              <span key={idx} className="flex-1 flex items-center justify-center text-xs md:text-sm leading-none">
                {lbl}
              </span>
            ))}
          </div>
        </div>

        {/* Container สำหรับกระดานเกมและหมอก */}
        <div className="w-full aspect-square relative rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          {/* ตารางแผนที่ขนาด 15x15 */}
          <div
            className="w-full h-full border-4 border-[#572e18] bg-amber-100/85 grid overflow-hidden relative z-0"
            style={{
              gridTemplateColumns: "repeat(15, minmax(0, 1fr))",
              gridTemplateRows: "repeat(15, minmax(0, 1fr))",
            }}
          >
            {Array.from({ length: 15 * 15 }).map((_, index) => {
              const x = index % 15;
              const y = Math.floor(index / 15);

              const isPlayer = x === playerX && y === playerY;
              const isGoal = x === 7 && y === 1; // เป้าหมายอยู่ที่ G1 (index 7, 1)
              const isWall = walls.some((wall) => wall.x === x && wall.y === y);

              return (
                <div
                  key={index}
                  className="border-b border-r border-[#572e18]/20 flex items-center justify-center bg-amber-50/20 relative"
                >
                  {isPlayer ? (
                    <img
                      src="/player.png"
                      alt="Player"
                      className="w-[85%] h-[85%] object-contain z-10 drop-shadow-md transition-transform duration-200"
                      style={{
                        transform: `scale(3) ${direction === "left" ? "scaleX(-1)" : ""}`,
                      }}
                    />
                  ) : (isGoal && role !== "navigator") ? (
                    <span className="drop-shadow-md animate-bounce z-10">🚩</span>
                  ) : isWall ? (
                    <img
                      src="/wall.png"
                      alt="Wall"
                      className="w-full h-full object-cover z-10"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* หมอก Fog of War สำหรับ Navigator */}
          {role === "navigator" && (
            <div 
              className="absolute z-20 pointer-events-none"
              style={{
                top: "6.666%",
                left: "6.666%",
                width: "86.666%",
                height: "86.666%",
                backgroundColor: "rgba(225, 228, 232, 0.85)", // หมอกสีเทาอ่อน สบายตา
                backgroundImage: "radial-gradient(circle at center, rgba(240, 243, 248, 0.6) 0%, rgba(205, 210, 215, 0.9) 100%)",
                maskImage: fogMask,
                WebkitMaskImage: fogMask,
              }}
            >
               {/* ใส่ลูกเล่นเมฆเบาๆ ด้วยเงา */}
               <div className="w-full h-full backdrop-blur-sm opacity-60" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



