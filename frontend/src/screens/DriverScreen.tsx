import { useRef, useState, useCallback, useEffect } from "react";
import * as Blockly from "blockly";

import GameHeader from "../components/driver/GameHeader";
import GameBoard from "../components/driver/GameBoard";
import ChatBox from "../components/driver/ChatBox";
import BlockCodePanel from "../components/driver/BlockCodePanel";

export default function DriverScreen() {
  // --- ข้อมูลแผนที่ ---
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
  const [playerY, setPlayerY] = useState(13);
  const [direction, setDirection] = useState<"up" | "right" | "down" | "left">(
    "up",
  );
  const [isWin, setIsWin] = useState(false);
  const [isLose, setIsLose] = useState(false);

  // 🌟 [เพิ่มจุดนี้] ใช้ Key เป็นตัวบังคับให้ BlockCodePanel Re-mount (เกิดใหม่) เมื่อกดเล่นอีกครั้ง
  const [panelKey, setPanelKey] = useState(0);

  const MAX_BLOCKS = 25;
  const [availableQuota, setAvailableQuota] = useState(MAX_BLOCKS);
  const [blocksLeft, setBlocksLeft] = useState(MAX_BLOCKS);

  const availableQuotaRef = useRef(MAX_BLOCKS);

  // ควบคุม maxBlocks ผ่าน useEffect ปกติ
  useEffect(() => {
    availableQuotaRef.current = availableQuota;
    if (workspaceRef.current) {
      workspaceRef.current.options.maxBlocks = availableQuota;
    }
  }, [availableQuota]);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // ฟังก์ชันจัดการ Workspace
  const handleWorkspaceReady = useCallback((ws: Blockly.WorkspaceSvg) => {
    workspaceRef.current = ws;
    ws.options.maxBlocks = availableQuotaRef.current;

    ws.addChangeListener((event) => {
      if (
        event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.BLOCK_DELETE ||
        event.type === Blockly.Events.BLOCK_MOVE
      ) {
        const used = ws.getAllBlocks(false).length;
        setBlocksLeft(Math.max(0, availableQuotaRef.current - used));
      }
    });
  }, []);

  // 🌟 [แก้ไขฟังก์ชันนี้] รีเซ็ตแบบทำลายแผงบล็อกเดิมทิ้งเพื่อบังคับปลดล็อกลากวาง
  const resetGameToNewStart = () => {
    setPlayerX(7);
    setPlayerY(13);
    setDirection("up");
    setIsWin(false);
    setIsLose(false);

    // 1. ล้างกระดาน
    if (workspaceRef.current) {
      workspaceRef.current.clear();
    }

    // 2. คืนค่าตัวเลขโควต้ากลับไปที่ 25
    availableQuotaRef.current = MAX_BLOCKS;
    setAvailableQuota(MAX_BLOCKS);
    setBlocksLeft(MAX_BLOCKS);

    // 3. 🔥 เปลี่ยนค่า Key เพื่อลบ Blockly Component ทิ้งแล้วสร้างใหม่แกะกล่องทันที
    setPanelKey((prev) => prev + 1);
  };

  // --- ลอจิกการรันและหักโควต้าหลังจบโปรแกรม ---
  const runProgram = async () => {
    if (!workspaceRef.current) return;
    setIsWin(false);
    setIsLose(false);

    const topBlocks = workspaceRef.current.getTopBlocks(true);
    if (topBlocks.length === 0) return;

    const blocksToUse = workspaceRef.current.getAllBlocks(false).length;

    const commandBlocks: any[] = [];
    let block = topBlocks[0];
    while (block) {
      commandBlocks.push(block);
      block = block.getNextBlock() as any;
    }

    let currentX = playerX;
    let currentY = playerY;
    let currentDirection = direction;

    for (const cmdBlock of commandBlocks) {
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

      nextX = Math.max(0, Math.min(14, nextX));
      nextY = Math.max(0, Math.min(14, nextY));

      if (!isWall(nextX, nextY)) {
        currentX = nextX;
        currentY = nextY;
        setPlayerX(currentX);
        setPlayerY(currentY);
      }

      setDirection(currentDirection);
      await sleep(350);

      if (currentX === 7 && currentY === 1) {
        workspaceRef.current.highlightBlock(null);
        await sleep(500);
        setIsWin(true);

        const nextQuota = availableQuotaRef.current - blocksToUse;
        availableQuotaRef.current = nextQuota;
        setAvailableQuota(nextQuota);
        workspaceRef.current.clear();
        return;
      }
    }

    workspaceRef.current.highlightBlock(null);
    await sleep(500);

    const nextQuota = availableQuotaRef.current - blocksToUse;
    availableQuotaRef.current = nextQuota;
    setAvailableQuota(nextQuota);
    workspaceRef.current.clear();

    if (nextQuota <= 0) {
      setIsLose(true);
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center flex flex-col p-4 md:p-6 font-pixel gap-4 cursor-default"
      style={{ backgroundImage: "url('/ingame.png')" }}
    >
      <GameHeader />

      <div className="flex flex-1 gap-6 w-full max-w-[1600px] mx-auto items-stretch">
        <div className="w-[55%] flex flex-col gap-4">
          <GameBoard
            playerX={playerX}
            playerY={playerY}
            direction={direction}
            walls={WALLS}
          />
          <ChatBox />
        </div>

        {/* 🌟 [แก้ไขจุดนี้] ใส่ key={panelKey} เข้าไปเพื่อให้คอมโพเนนต์ยอมเกิดใหม่พร้อมปลดล็อกบล็อกทั้งหมด */}
        <BlockCodePanel
          key={panelKey}
          blocksLeft={blocksLeft}
          onReady={handleWorkspaceReady}
          onRun={runProgram}
        />
      </div>

      {/* --- โมดัลเมื่อชนะเกม --- */}
      {isWin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-amber-100 border-8 border-black p-8 rounded-xl flex flex-col items-center gap-6 shadow-2xl">
            <h2 className="text-6xl font-pixel font-bold text-orange-600 drop-shadow-sm animate-bounce">
              Victory!
            </h2>
            <p className="text-4xl">⭐ ⭐ ⭐</p>
            <button
              className="bg-green-500 border-4 border-black text-white font-pixel font-bold py-3 px-8 text-2xl rounded-lg hover:bg-green-600 active:scale-95 transition-all shadow-lg"
              onClick={resetGameToNewStart}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* --- โมดัลเมื่อแพ้เกม --- */}
      {isLose && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-amber-100 border-8 border-black p-8 rounded-xl flex flex-col items-center gap-6 shadow-2xl">
            <h2 className="text-6xl font-pixel font-bold text-red-600 drop-shadow-sm">
              GAME OVER
            </h2>
            <p className="text-2xl text-black">
              block left = 0, you have no more blocks to run
            </p>
            <button
              className="bg-orange-600 border-4 border-black text-white font-pixel font-bold py-3 px-8 text-2xl rounded-lg hover:bg-orange-700 active:scale-95 transition-all shadow-lg"
              onClick={resetGameToNewStart}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
