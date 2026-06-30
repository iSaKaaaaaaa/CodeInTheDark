interface Props {
  playerX: number;
  playerY: number;
  direction: "up" | "right" | "down" | "left";
  walls?: { x: number; y: number }[];
}

const COL_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
// เพิ่มช่องว่างหัวท้ายเพื่อให้พิกัด A-M ตรงกับ Grid ด้านในของตาราง 15x15 พอดี
const TOP_LABELS = ["", ...COL_LABELS, ""];
const LEFT_LABELS = ["", ...Array.from({ length: 13 }).map((_, i) => String(i + 1)), ""];

export default function GameBoard({
  playerX = 6,
  playerY = 11, // F11 is index (6, 11) in 15x15 grid
  direction = "up",
  walls = [],
}: Props) {
  return (
    <div className="flex-1 bg-amber-900/40 rounded-xl border-4 border-black p-4 relative backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-[520px] flex flex-col gap-2">
        {/* แถบตัวอักษรบอกพิกัดด้านบน (แกน X - ความยาว 15 สล็อตเพื่อเว้นขอบซ้ายขวา) */}
        <div className="flex w-full items-center">
          {/* เว้นพื้นที่ฝั่งซ้ายให้ตรงกับแถบตัวเลขบอกพิกัด */}
          <div className="w-10 mr-2" />
          <div className="flex-1 flex justify-around items-center bg-[#78350f] border-4 border-black text-amber-100 font-bold rounded-full py-1 text-sm md:text-base shadow-md font-pixel">
            {TOP_LABELS.map((lbl, idx) => (
              <span key={idx} className="w-full text-center">
                {lbl}
              </span>
            ))}
          </div>
        </div>

        {/* แถบตัวเลขด้านซ้าย และกระดาน Grid */}
        <div className="flex w-full items-stretch gap-2">
          {/* แถบตัวเลขบอกพิกัดด้านซ้าย (แกน Y - ความยาว 15 สล็อตเพื่อเว้นขอบบนล่าง) */}
          <div className="w-10 flex flex-col justify-around items-center bg-[#78350f] border-4 border-black text-amber-100 font-bold rounded-full py-2 text-xs md:text-sm shadow-md font-pixel">
            {LEFT_LABELS.map((lbl, idx) => (
              <span key={idx} className="h-full flex items-center justify-center">
                {lbl}
              </span>
            ))}
          </div>

          {/* ตารางแผนที่ขนาด 15x15 */}
          <div
            className="flex-1 aspect-square border-4 border-amber-950 bg-amber-100/85 rounded-lg grid overflow-hidden shadow-inner"
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
                  className="border-b border-r border-amber-900/20 flex items-center justify-center bg-amber-50/20 relative"
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
                  ) : isGoal ? (
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
        </div>
      </div>
    </div>
  );
}



