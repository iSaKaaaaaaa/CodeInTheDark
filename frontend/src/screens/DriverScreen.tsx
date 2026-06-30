import { useRef, useState } from "react";
import * as Blockly from "blockly";

// อิมพอร์ต Component ย่อยที่มีสไตล์สวยงามธีมอียิปต์/พิกเซล
import GameHeader from "../components/driver/GameHeader";
import GameBoard from "../components/driver/GameBoard";
import ChatBox from "../components/driver/ChatBox";
import BlockCodePanel from "../components/driver/BlockCodePanel";

export default function DriverScreen() {
  // --- ข้อมูลแผนที่เขาวงกต ---
  const MAP = [
    "###############",
    "#........#....#",
    "#........#....#",
    "####..#..###..#",
    "#.....#.......#",
    "#.....#.......#",
    "#..#..#..###..#",
    "#..#..#....#..#",
    "####..#....#..#",
    "#.....#....#..#",
    "#.....#....#..#",
    "#..#..######..#",
    "#..#.....#....#",
    "#..#.....#....#",
    "######...######",
  ];
  const WALLS = MAP.flatMap((row, y) =>
    [...row].map((cell, x) => (cell === "#" ? { x, y } : null)).filter(Boolean),
  ) as { x: number; y: number }[];

  const isWall = (x: number, y: number) => {
    return WALLS.some((wall) => wall.x === x && wall.y === y);
  };

  // --- State ของการเล่นเกม ---
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [playerX, setPlayerX] = useState(7);
  const [playerY, setPlayerY] = useState(14); // เริ่มต้นที่ F11 (x=8, y=14) ในระบบแผนที่ 15x15
  const [direction, setDirection] = useState<"up" | "right" | "down" | "left">(
    "up",
  );
  const [isWin, setIsWin] = useState(false);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // --- ลอจิกการแกะโค้ดบล็อกและรันตามลำดับ ---
  const runProgram = async () => {
    if (!workspaceRef.current) return;
    setIsWin(false);

    // ดึงบล็อกเริ่มต้นใน Workspace
    const topBlocks = workspaceRef.current.getTopBlocks(true);
    if (topBlocks.length === 0) return;

    const commandBlocks: any[] = [];
    let block = topBlocks[0];
    while (block) {
      commandBlocks.push(block);
      block = block.getNextBlock() as any;
    }

    let currentX = playerX;
    let currentY = playerY;
    let currentDirection = direction;

    // ทำตามทีละคำสั่งด้วยเอฟเฟกต์การเคลื่อนไหวทีละขั้น (Sleep 300ms)
    for (const cmdBlock of commandBlocks) {
      // ไฮไลต์บล็อกที่กำลังทำงานในปัจจุบัน
      workspaceRef.current.highlightBlock(cmdBlock.id);

      const cmd = cmdBlock.type;
      let nextX = currentX;
      let nextY = currentY;

      if (cmd === "move_up") {
        nextY--;
        currentDirection = "up";
      } else if (cmd === "move_down") {
        nextY++;
        currentDirection = "down";
      } else if (cmd === "move_left") {
        nextX--;
        currentDirection = "left";
      } else if (cmd === "move_right") {
        nextX++;
        currentDirection = "right";
      }

      // ตรวจจับขอบสนาม (แมพมีขนาด 15x15 ดัชนีสูงสุดคือ 14)
      nextX = Math.max(0, Math.min(14, nextX));
      nextY = Math.max(0, Math.min(14, nextY));

      // เช็กการชนกำแพง
      if (!isWall(nextX, nextY)) {
        currentX = nextX;
        currentY = nextY;
        setPlayerX(currentX);
        setPlayerY(currentY);
      }

      setDirection(currentDirection);
      await sleep(350); // เพิ่ม sleep เล็กน้อยเพื่อให้ผู้เล่นเห็นไฟกะพริบไฮไลต์ชัดขึ้น

      // ตรวจจับจุดหมายเส้นชัย (ประตูทางออก/ธง) อยู่ที่ G1 (x=7, y=1) ในระบบแผนที่ 15x15
      if (currentX === 7 && currentY === 1) {
        setIsWin(true);
        workspaceRef.current.highlightBlock(null); // ยกเลิกไฮไลต์
        return;
      }
    }
    workspaceRef.current.highlightBlock(null); // ยกเลิกไฮไลต์หลังรันเสร็จ โดยเก็บบล็อกโค้ดไว้ไม่ลบออก
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center flex flex-col p-4 md:p-6 font-pixel gap-4 cursor-default"
      style={{ backgroundImage: "url('/ingame.png')" }}
    >
      {/* ส่วนหัวเกมแสดงสถานะและข้อมูลปาร์ตี้ */}
      <GameHeader />

      {/* หน้าจอหลักแบ่งออกเป็น 2 คอลัมน์ตามแบบฉบับดั้งเดิม */}
      <div className="flex flex-1 gap-6 w-full max-w-[1600px] mx-auto items-stretch">
        {/* คอลัมน์ซ้าย: แผนที่เกม และช่องพูดคุย (Chat) */}
        <div className="w-[55%] flex flex-col gap-4">
          <GameBoard
            playerX={playerX}
            playerY={playerY}
            direction={direction}
            walls={WALLS}
          />
          <ChatBox />
        </div>

        {/* คอลัมน์ขวา: พื้นที่รหัสบล็อก (Blockly Workspace ในธีมม้วนปาปิรัส) */}
        <BlockCodePanel
          onReady={(ws) => {
            workspaceRef.current = ws;
          }}
          onRun={runProgram}
        />
      </div>

      {/* โมดัลแจ้งเตือนเมื่อชนะเกม */}
      {isWin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-amber-100 border-8 border-black p-8 rounded-xl flex flex-col items-center gap-6 shadow-2xl">
            <h2 className="text-6xl font-pixel font-bold text-orange-600 drop-shadow-sm animate-bounce">
              Victory!
            </h2>
            <p className="text-4xl">⭐ ⭐ ⭐</p>
            <button
              className="bg-green-500 border-4 border-black text-white font-pixel font-bold py-3 px-8 text-2xl rounded-lg hover:bg-green-600 active:scale-95 transition-all shadow-lg"
              onClick={() => {
                setPlayerX(6);
                setPlayerY(11);
                setDirection("up");
                setIsWin(false);
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

