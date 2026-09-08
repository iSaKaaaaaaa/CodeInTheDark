const PLAYER_SPRITES: Record<string, string> = {
  up: "/sprites/player_back.png",
  down: "/sprites/player_front.png",
  left: "/sprites/player_left.png",
  right: "/sprites/player_right.png",
};

interface Props {
  playerX: number;
  playerY: number;
  direction: "up" | "right" | "down" | "left";
  walls?: { x: number; y: number }[];
  traps?: { x: number; y: number }[];
  rocks?: { x: number; y: number }[];
  spikes?: { x: number; y: number }[];
  goal?: { x: number; y: number };
  role?: "driver" | "navigator" | null;
}

const COL_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const ROW_LABELS = Array.from({ length: 13 }).map((_, i) => String(i + 1));

export default function GameBoard({
  playerX = 6,
  playerY = 11, // F11 is index (6, 11) in 15x15 grid
  direction = "up",
  walls = [],
  traps = [],
  rocks = [],
  spikes = [],
  goal = { x: 7, y: 1 },
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
    <div className="flex-1 relative w-full h-full min-h-0 flex items-center justify-center p-2 md:p-4 overflow-hidden @container">
      <div 
        className="relative pt-8 pl-8 md:pt-10 md:pl-10 flex items-center justify-center w-full mx-auto"
        style={{ maxWidth: 'calc(100cqmin - 3rem)' }}
      >
        
        {/* แถบตัวอักษรบอกพิกัดด้านบน (A-M) */}
        <div className="absolute top-0 left-10 right-0 h-10 flex items-start justify-center">
          {/* ขยับซ้ายขวาให้ตรงกับ 13 ช่องด้านใน (86.666% คือ 13/15 ของกระดาน) */}
          <div className="w-[86.666%] h-8 bg-[#d2a356] border-4 border-[#572e18] text-black font-bold rounded-lg flex justify-around items-center shadow-md font-sans z-10">
            {COL_LABELS.map((lbl, idx) => (
              <span key={idx} className="flex-1 text-center text-sm md:text-base leading-none">
                {lbl}
              </span>
            ))}
          </div>
        </div>

        {/* แถบตัวเลขบอกพิกัดด้านซ้าย (1-13) */}
        <div className="absolute left-0 top-10 bottom-0 w-10 flex items-center justify-end pr-2">
          <div className="h-[86.666%] w-8 bg-[#d2a356] border-4 border-[#572e18] text-black font-bold rounded-lg flex flex-col justify-around items-center shadow-md font-sans z-10">
            {ROW_LABELS.map((lbl, idx) => (
              <span key={idx} className="flex-1 flex items-center justify-center text-sm md:text-base leading-none">
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
              const isGoal = x === goal.x && y === goal.y;
              const isWall = walls.some((wall) => wall.x === x && wall.y === y);
              const isTrap = traps.some((trap) => trap.x === x && trap.y === y);
              const isRock = rocks.some((rock) => rock.x === x && rock.y === y);
              const isSpike = spikes.some((spike) => spike.x === x && spike.y === y);
              
              const isSideDirection = direction === "left" || direction === "right";

              return (
                <div
                  key={index}
                  className="border-b border-r border-[#572e18]/20 flex items-center justify-center bg-amber-50/20 relative"
                >
                  {isPlayer ? (
                    <div className="absolute inset-0 flex items-end justify-center z-10">
                      <img
                        src={PLAYER_SPRITES[direction] || "/sprites/player_back.png"}
                        alt="Player"
                        className={`max-w-none object-contain drop-shadow-md transition-all duration-200 origin-bottom ${isSideDirection ? 'w-[150%] h-[150%]' : 'w-[calc(250%-10px)] h-[calc(250%-10px)]'}`}
                        style={{
                          transform: isSideDirection ? "translateY(5%)" : "translateY(15%)",
                          marginBottom: isSideDirection ? "-15%" : "-25%", // ผสมผสาน margin และ transform เพื่อดึงภาพลงมา
                        }}
                      />
                    </div>
                  ) : (isGoal && role !== "navigator") ? (
                    <span className="drop-shadow-md animate-bounce z-10 text-2xl">🚩</span>
                  ) : (isTrap && role !== "navigator") ? (
                    <img src="/sprites/hole.webp" alt="Trap" className="w-[100%] h-[100%] object-contain z-10 drop-shadow-md" title="Trap" />
                  ) : (isRock && role !== "navigator") ? (
                    <img src="/sprites/rock.webp" alt="Rock" className="w-[100%] h-[100%] object-contain z-10 drop-shadow-md" title="Rock" />
                  ) : (isSpike && role !== "navigator") ? (
                    <img src="/sprites/spike.webp" alt="Spike" className="w-[100%] h-[100%] object-contain z-10 drop-shadow-md" title="Spike" />
                  ) : isWall ? (
                    <img
                      src="/sprites/wall.png"
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
                backgroundColor: "rgb(225, 228, 232)", // หมอกทึบ 100%
                backgroundImage: "radial-gradient(circle at center, rgb(240, 243, 248) 0%, rgb(185, 190, 195) 100%)",
                maskImage: fogMask,
                WebkitMaskImage: fogMask,
              }}
            >
               {/* ใส่ลูกเล่นเมฆเบาๆ ด้วยเงา */}
               <div className="w-full h-full backdrop-blur-md opacity-100" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



