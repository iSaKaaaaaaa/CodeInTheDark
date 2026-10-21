import { useState, useMemo } from "react";

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
const ROW_LABELS = Array.from({ length: 13 }, (_, i) => String(i + 1));
const GRID_INDICES = Array.from({ length: 15 * 15 }, (_, i) => i);

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
  const [hoveredCoord, setHoveredCoord] = useState<{ x: number; y: number } | null>(null);

  // ใช้ Set เพื่อเช็คตำแหน่งสิ่งกีดขวางในตาราง 15x15 ด้วยความเร็ว O(1) แทนการวน .some() ทุกช่องเวลาขยับเมาส์
  const wallSet = useMemo(() => new Set(walls.map((w) => `${w.x},${w.y}`)), [walls]);
  const trapSet = useMemo(() => new Set(traps.map((t) => `${t.x},${t.y}`)), [traps]);
  const rockSet = useMemo(() => new Set(rocks.map((r) => `${r.x},${r.y}`)), [rocks]);
  const spikeSet = useMemo(() => new Set(spikes.map((s) => `${s.x},${s.y}`)), [spikes]);

  // คำนวณเปอร์เซ็นต์ตำแหน่งของตัวละครสำหรับ Fog of War ในพื้นที่ 13x13 (ด้านใน)
  const playerInnerX = playerX - 1;
  const playerInnerY = playerY - 1;
  const playerXPercent = (playerInnerX + 0.5) * (100 / 13);
  const playerYPercent = (playerInnerY + 0.5) * (100 / 13);

  const goalInnerX = goal.x - 1;
  const goalInnerY = goal.y - 1;

  const playerCoordStr =
    playerInnerX >= 0 && playerInnerX < 13 && playerInnerY >= 0 && playerInnerY < 13
      ? `${COL_LABELS[playerInnerX]}${ROW_LABELS[playerInnerY]}`
      : "--";

  const goalCoordStr =
    goalInnerX >= 0 && goalInnerX < 13 && goalInnerY >= 0 && goalInnerY < 13
      ? `${COL_LABELS[goalInnerX]}${ROW_LABELS[goalInnerY]}`
      : `${COL_LABELS[goal.x] || "?"}${goal.y}`;

  const fogMask =
    role === "navigator"
      ? `radial-gradient(circle at ${playerXPercent}% ${playerYPercent}%, transparent 0%, transparent 16%, black 38%)`
      : undefined;

  return (
    <div className="flex-1 relative w-full h-full min-h-0 flex flex-col items-center justify-center p-2 overflow-hidden">
      {/* Wrapper นี้ควบคุมขนาดให้พอดีกับความสูงหรือความกว้างของหน้าจอ โดยคง aspect-ratio ไว้ */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center w-full p-1">
        <div
          className="relative flex-col items-center justify-center h-full max-h-full max-w-full"
          style={{
            aspectRatio: "1 / 1",
            paddingTop: "2.75rem", // เผื่อที่ให้ Header พิกัด A-M
            paddingLeft: "2.75rem", // เผื่อที่ให้ Sidebar พิกัด 1-13
          }}
        >
          {/* Top-Left Corner Coordinate Badge — แสดงพิกัดตัวละคร หรือพิกัดเมาส์ที่ชี้ */}
          <div className="absolute top-0 left-0 w-[2.75rem] h-[2.75rem] flex items-center justify-center p-1 font-pixel">
            <div
              className={`w-full h-full rounded-lg border-2 border-[#572e18] flex items-center justify-center font-bold text-base sm:text-lg transition-all shadow-md ${
                hoveredCoord
                  ? "bg-amber-400 text-[#2a1306] scale-105 ring-2 ring-amber-300"
                  : "bg-[#d2a356] text-[#2a1306]"
              }`}
              style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.6)" }}
              title={hoveredCoord ? "พิกัดที่ชี้ (Cursor Coordinate)" : "พิกัดของคุณ (Your Position)"}
            >
              {hoveredCoord
                ? `${COL_LABELS[hoveredCoord.x]}${ROW_LABELS[hoveredCoord.y]}`
                : playerCoordStr}
            </div>
          </div>

          {/* แถบตัวอักษรบอกพิกัดด้านบน (A-M) */}
          <div className="absolute top-0 left-[2.75rem] right-0 h-[2.75rem] flex items-center justify-center font-pixel">
            <div className="w-[86.666%] h-9 md:h-10 bg-[#d2a356] border-4 border-[#572e18] text-[#2a1306] rounded-lg flex justify-around items-center shadow-lg z-10 px-1">
              {COL_LABELS.map((lbl, idx) => {
                const isColActive = hoveredCoord?.x === idx;
                const isPlayerCol = playerInnerX === idx;
                return (
                  <span
                    key={idx}
                    className={`flex-1 text-center text-lg sm:text-xl md:text-2xl font-bold leading-none select-none tracking-tight transition-all duration-150 ${
                      isColActive
                        ? "text-red-700 font-black scale-125 bg-amber-200/90 rounded py-0.5 shadow-sm"
                        : isPlayerCol
                          ? "text-[#5c2e0b] bg-amber-300/80 rounded py-0.5 font-black ring-1 ring-[#5c2e0b]/40"
                          : ""
                    }`}
                    style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.6)" }}
                  >
                    {lbl}
                  </span>
                );
              })}
            </div>
          </div>

          {/* แถบตัวเลขบอกพิกัดด้านซ้าย (1-13) */}
          <div className="absolute left-0 top-[2.75rem] bottom-0 w-[2.75rem] flex items-center justify-end pr-1 font-pixel">
            <div className="h-[86.666%] w-9 md:w-10 bg-[#d2a356] border-4 border-[#572e18] text-[#2a1306] rounded-lg flex flex-col justify-around items-center shadow-lg z-10 py-1">
              {ROW_LABELS.map((lbl, idx) => {
                const isRowActive = hoveredCoord?.y === idx;
                const isPlayerRow = playerInnerY === idx;
                return (
                  <span
                    key={idx}
                    className={`flex-1 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold leading-none select-none transition-all duration-150 ${
                      isRowActive
                        ? "text-red-700 font-black scale-125 bg-amber-200/90 rounded px-1 shadow-sm"
                        : isPlayerRow
                          ? "text-[#5c2e0b] bg-amber-300/80 rounded px-1 font-black ring-1 ring-[#5c2e0b]/40"
                          : ""
                    }`}
                    style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.6)" }}
                  >
                    {lbl}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Container สำหรับกระดานเกมและหมอก */}
          <div
            className="w-full h-full relative rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            onMouseLeave={() => setHoveredCoord(null)}
          >
            {/* ตารางแผนที่ขนาด 15x15 */}
            <div
              className="w-full h-full border-4 border-[#572e18] bg-amber-100/90 grid overflow-hidden relative z-0"
              style={{
                gridTemplateColumns: "repeat(15, minmax(0, 1fr))",
                gridTemplateRows: "repeat(15, minmax(0, 1fr))",
              }}
            >
              {GRID_INDICES.map((index) => {
                const x = index % 15;
                const y = Math.floor(index / 15);
                const key = `${x},${y}`;

                const isInner = x >= 1 && x <= 13 && y >= 1 && y <= 13;
                const innerX = x - 1;
                const innerY = y - 1;

                const isPlayer = x === playerX && y === playerY;
                const isGoal = x === goal.x && y === goal.y;
                const isWall = wallSet.has(key);
                const isTrap = trapSet.has(key);
                const isRock = rockSet.has(key);
                const isSpike = spikeSet.has(key);

                const isSideDirection = direction === "left" || direction === "right";

                const isHovered = isInner && hoveredCoord?.x === innerX && hoveredCoord?.y === innerY;
                const isCrosshair = isInner && hoveredCoord && (hoveredCoord.x === innerX || hoveredCoord.y === innerY);

                // Checkerboard pattern for inner playable tiles
                const checkerBg = isInner
                  ? (innerX + innerY) % 2 === 0
                    ? "bg-[#fffbeb]/70"
                    : "bg-[#fef3c7]/50"
                  : "bg-amber-900/30";

                return (
                  <div
                    key={index}
                    onMouseEnter={() => {
                      if (isInner) {
                        setHoveredCoord({ x: innerX, y: innerY });
                      }
                    }}
                    className={`border-b border-r border-[#572e18]/40 flex items-center justify-center relative transition-colors duration-75 ${checkerBg} ${
                      isHovered
                        ? "ring-2 ring-inset ring-amber-500 bg-amber-300/60"
                        : isCrosshair
                          ? "bg-amber-200/40"
                          : ""
                    }`}
                  >
                    {isPlayer ? (
                      <div className="absolute inset-0 flex items-end justify-center z-10">
                        <img
                          src={PLAYER_SPRITES[direction] || "/sprites/player_back.png"}
                          alt="Player"
                          className={`max-w-none object-contain drop-shadow-md transition-all duration-200 origin-bottom ${
                            isSideDirection ? "w-[150%] h-[150%]" : "w-[calc(250%-10px)] h-[calc(250%-10px)]"
                          }`}
                          style={{
                            transform: isSideDirection ? "translateY(5%)" : "translateY(15%)",
                            marginBottom: isSideDirection ? "-15%" : "-25%",
                          }}
                        />
                      </div>
                    ) : isGoal && role !== "navigator" ? (
                      <div className="relative flex items-center justify-center w-full h-full z-10">
                        <div className="absolute inset-0 bg-amber-400/30 rounded-md animate-pulse pointer-events-none" />
                        <svg
                          viewBox="0 0 32 32"
                          className="w-[85%] h-[85%] object-contain drop-shadow-[0_2px_8px_rgba(234,88,12,0.8)]"
                        >
                          <rect x="6" y="4" width="3" height="24" rx="1.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                          <circle cx="7.5" cy="4" r="2.5" fill="#fbbf24" stroke="#78350f" strokeWidth="0.8" />
                          <path
                            d="M9 5 L26 10 L9 16 Z"
                            fill="#dc2626"
                            stroke="#7f1d1d"
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M11 7 L23 10.5 L11 14 Z"
                            fill="#ef4444"
                          />
                          <ellipse cx="7.5" cy="27" rx="4" ry="2" fill="#78350f" />
                        </svg>
                      </div>
                    ) : isTrap && role !== "navigator" ? (
                      <img src="/sprites/hole.webp" alt="Trap" className="w-[100%] h-[100%] object-contain z-10 drop-shadow-md" title="Trap" />
                    ) : isRock && role !== "navigator" ? (
                      <img src="/sprites/rock.webp" alt="Rock" className="w-[100%] h-[100%] object-contain z-10 drop-shadow-md" title="Rock" />
                    ) : isSpike && role !== "navigator" ? (
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
                  backgroundColor: "rgb(225, 228, 232)",
                  backgroundImage: "radial-gradient(circle at center, rgb(240, 243, 248) 0%, rgb(185, 190, 195) 100%)",
                  maskImage: fogMask,
                  WebkitMaskImage: fogMask,
                }}
              >
                <div className="w-full h-full backdrop-blur-md opacity-100" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prominent Coordinates Status Bar */}
      <div className="mt-1.5 w-full max-w-[540px] flex items-center justify-between bg-[#2a1306]/95 border-2 border-[#b8944f] rounded-xl px-4 py-2 shadow-xl backdrop-blur-md font-pixel shrink-0 text-base sm:text-lg">
        <div className="flex items-center gap-2">
          <span className="text-[#d5bba2] text-xs sm:text-sm font-thai font-medium">ตำแหน่ง:</span>
          <span
            className="text-emerald-400 font-bold tracking-wider text-xl sm:text-2xl font-pixel bg-black/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/50 shadow-inner"
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            {playerCoordStr}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#d5bba2] text-xs sm:text-sm font-thai font-medium">เป้าหมาย:</span>
          {role === "navigator" ? (
            <span className="text-sky-300 font-thai text-xs sm:text-sm font-medium bg-black/60 px-2.5 py-1 rounded-lg border border-sky-500/40">
              รอ Driver แจ้งพิกัด
            </span>
          ) : (
            <span
              className="text-amber-300 font-bold tracking-wider text-xl sm:text-2xl font-pixel bg-black/60 px-2.5 py-0.5 rounded-lg border border-amber-500/50 shadow-inner"
              style={{ textShadow: "1px 1px 0 #000" }}
            >
              {goalCoordStr}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#d5bba2] text-xs sm:text-sm font-thai font-medium">เคอร์เซอร์:</span>
          <span
            className="text-sky-300 font-bold tracking-wider text-xl sm:text-2xl font-pixel bg-black/60 px-2.5 py-0.5 rounded-lg border border-sky-500/50 min-w-[2.75rem] text-center shadow-inner"
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            {hoveredCoord ? `${COL_LABELS[hoveredCoord.x]}${ROW_LABELS[hoveredCoord.y]}` : "--"}
          </span>
        </div>
      </div>
    </div>
  );
}
