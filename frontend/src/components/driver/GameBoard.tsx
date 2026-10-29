import { useState, useMemo } from "react";
import type { CSSProperties } from "react";

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
      {/* Wrapper นี้ควบคุมขนาดให้พอดีกับความสูงหรือความกว้างของหน้าจอ โดยคง aspect-ratio 1:1 ไว้เสมอ */}
      <div
        className="relative flex-1 w-full h-full min-h-0 flex items-center justify-center p-1 overflow-hidden"
        style={{ containerType: "size" }}
      >
        <div
          className="relative flex-col items-center justify-center"
          style={
            {
              width: "min(100cqw, 100cqh)",
              height: "min(100cqw, 100cqh)",
              aspectRatio: "1 / 1",
              "--coord-gutter": "clamp(26px, 7.2cqmin, 50px)",
              paddingTop: "var(--coord-gutter)", // เผื่อที่ให้ Header พิกัด A-M ตามสัดส่วนกระดานจริง
              paddingLeft: "var(--coord-gutter)", // เผื่อที่ให้ Sidebar พิกัด 1-13 ตามสัดส่วนกระดานจริง
            } as CSSProperties
          }
        >
          {/* Top-Left Corner Coordinate Badge — แสดงพิกัดตัวละคร หรือพิกัดเมาส์ที่ชี้ */}
          <div
            className="absolute top-0 left-0 flex items-center justify-center p-0.5 sm:p-1 font-pixel"
            style={{ width: "var(--coord-gutter)", height: "var(--coord-gutter)" }}
          >
            <div
              className={`w-full h-full rounded-lg border-2 border-[#572e18] flex items-center justify-center font-bold leading-none transition-all shadow-md ${
                hoveredCoord
                  ? "bg-amber-400 text-[#2a1306] scale-105 ring-2 ring-amber-300"
                  : "bg-[#d2a356] text-[#2a1306]"
              }`}
              style={{
                fontSize: "clamp(10px, 2.7cqmin, 19px)",
                textShadow: "1px 1px 0 rgba(255,255,255,0.6)",
              }}
              title={hoveredCoord ? "Cursor Coordinate" : "Your Position"}
            >
              {hoveredCoord
                ? `${COL_LABELS[hoveredCoord.x]}${ROW_LABELS[hoveredCoord.y]}`
                : playerCoordStr}
            </div>
          </div>

          {/* แถบตัวอักษรบอกพิกัดด้านบน (A-M) */}
          <div
            className="absolute top-0 right-0 flex items-center justify-center font-pixel"
            style={{ left: "var(--coord-gutter)", height: "var(--coord-gutter)" }}
          >
            <div
              className="w-[86.666%] bg-[#d2a356] border-2 md:border-[3px] border-[#572e18] text-[#2a1306] rounded-lg flex justify-around items-center shadow-lg z-10 px-0.5"
              style={{ height: "clamp(20px, 5.8cqmin, 42px)" }}
            >
              {COL_LABELS.map((lbl, idx) => {
                const isColActive = hoveredCoord?.x === idx;
                const isPlayerCol = playerInnerX === idx;
                return (
                  <span
                    key={idx}
                    className={`flex-1 text-center font-bold leading-none select-none tracking-tight transition-all duration-150 ${
                      isColActive
                        ? "text-red-700 font-black scale-115 bg-amber-200/90 rounded py-0.5 shadow-sm"
                        : isPlayerCol
                          ? "text-[#5c2e0b] bg-amber-300/80 rounded py-0.5 font-black ring-1 ring-[#5c2e0b]/40"
                          : ""
                    }`}
                    style={{
                      fontSize: "clamp(10px, 3.5cqmin, 24px)",
                      textShadow: "1px 1px 0 rgba(255,255,255,0.6)",
                    }}
                  >
                    {lbl}
                  </span>
                );
              })}
            </div>
          </div>

          {/* แถบตัวเลขบอกพิกัดด้านซ้าย (1-13) */}
          <div
            className="absolute left-0 bottom-0 flex items-center justify-end pr-0.5 sm:pr-1 font-pixel"
            style={{ top: "var(--coord-gutter)", width: "var(--coord-gutter)" }}
          >
            <div
              className="h-[86.666%] bg-[#d2a356] border-2 md:border-[3px] border-[#572e18] text-[#2a1306] rounded-lg flex flex-col justify-around items-center shadow-lg z-10 py-0.5"
              style={{ width: "clamp(20px, 5.8cqmin, 42px)" }}
            >
              {ROW_LABELS.map((lbl, idx) => {
                const isRowActive = hoveredCoord?.y === idx;
                const isPlayerRow = playerInnerY === idx;
                return (
                  <span
                    key={idx}
                    className={`flex-1 flex items-center justify-center font-bold leading-none select-none transition-all duration-150 ${
                      isRowActive
                        ? "text-red-700 font-black scale-115 bg-amber-200/90 rounded px-0.5 shadow-sm"
                        : isPlayerRow
                          ? "text-[#5c2e0b] bg-amber-300/80 rounded px-0.5 font-black ring-1 ring-[#5c2e0b]/40"
                          : ""
                    }`}
                    style={{
                      fontSize: "clamp(10px, 3.5cqmin, 24px)",
                      textShadow: "1px 1px 0 rgba(255,255,255,0.6)",
                    }}
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
      <div
        style={{
          padding: "clamp(5px, 0.7vh, 8px) clamp(10px, 1.2vw, 18px)",
        }}
        className="mt-1.5 w-full max-w-[640px] flex items-center justify-between gap-2 bg-[#2a1306]/95 border-2 border-[#b8944f] rounded-xl shadow-xl backdrop-blur-md font-pixel shrink-0"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span
            style={{ fontSize: "clamp(10px, min(0.95vw, 1.6vh), 15px)" }}
            className="text-[#d5bba2] font-game-sub uppercase tracking-wider font-semibold"
          >
            POS:
          </span>
          <span
            className="text-emerald-400 font-bold tracking-wider font-pixel bg-black/60 px-2 py-0.5 rounded-lg border border-emerald-500/50 shadow-inner leading-none"
            style={{
              fontSize: "clamp(14px, min(1.55vw, 2.6vh), 24px)",
              textShadow: "1px 1px 0 #000",
            }}
          >
            {playerCoordStr}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span
            style={{ fontSize: "clamp(10px, min(0.95vw, 1.6vh), 15px)" }}
            className="text-[#d5bba2] font-game-sub uppercase tracking-wider font-semibold"
          >
            GOAL:
          </span>
          {role === "navigator" ? (
            <span
              style={{ fontSize: "clamp(10px, min(0.9vw, 1.5vh), 14px)" }}
              className="text-sky-300 font-game-sub font-medium bg-black/60 px-2 py-0.5 rounded-lg border border-sky-500/40 uppercase tracking-wide whitespace-nowrap"
            >
              Awaiting Driver
            </span>
          ) : (
            <span
              className="text-amber-300 font-bold tracking-wider font-pixel bg-black/60 px-2 py-0.5 rounded-lg border border-amber-500/50 shadow-inner leading-none"
              style={{
                fontSize: "clamp(14px, min(1.55vw, 2.6vh), 24px)",
                textShadow: "1px 1px 0 #000",
              }}
            >
              {goalCoordStr}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span
            style={{ fontSize: "clamp(10px, min(0.95vw, 1.6vh), 15px)" }}
            className="text-[#d5bba2] font-game-sub uppercase tracking-wider font-semibold"
          >
            CURSOR:
          </span>
          <span
            className="text-sky-300 font-bold tracking-wider font-pixel bg-black/60 px-2 py-0.5 rounded-lg border border-sky-500/50 min-w-[2.4rem] text-center shadow-inner leading-none"
            style={{
              fontSize: "clamp(14px, min(1.55vw, 2.6vh), 24px)",
              textShadow: "1px 1px 0 #000",
            }}
          >
            {hoveredCoord ? `${COL_LABELS[hoveredCoord.x]}${ROW_LABELS[hoveredCoord.y]}` : "--"}
          </span>
        </div>
      </div>
    </div>
  );
}
