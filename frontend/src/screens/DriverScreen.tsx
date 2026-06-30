import React, { useRef, useState } from "react";
import * as Blockly from "blockly";

// อิมพอร์ต Component ย่อย (เช็ก Path ให้ตรงกับโฟลเดอร์ของคุณด้วยนะครับ)
import GameBoard from "../components/GameBoard";
import BlocklyEditor from "../components/BlocklyEditor";

export default function DriverScreen() {
  // --- ข้อมูลแผนที่ ---
  const MAP = [
    "##########",
    "#......#.#",
    "####.#.#.#",
    "#....#...#",
    "#..#.#.#.#",
    "####.#.#.#",
    "#....#.#.#",
    "#..#.###.#",
    "#..#..#..#",
    "#####.####",
  ];
  const WALLS = MAP.flatMap((row, y) =>
    [...row].map((cell, x) => (cell === "#" ? { x, y } : null)).filter(Boolean),
  ) as { x: number; y: number }[];

  const isWall = (x: number, y: number) => {
    return WALLS.some((wall) => wall.x === x && wall.y === y);
  };

  // --- State ของเกม ---
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [playerX, setPlayerX] = useState(5);
  const [playerY, setPlayerY] = useState(8);
  const [direction, setDirection] = useState<"up" | "right" | "down" | "left">(
    "up",
  );
  const [isWin, setIsWin] = useState(false);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // --- ระบบรันโค้ด 4 ทิศทาง ---
  const runProgram = async () => {
    if (!workspaceRef.current) return;
    setIsWin(false);

    const topBlocks = workspaceRef.current.getTopBlocks(true);
    if (topBlocks.length === 0) return;

    const commands: string[] = [];
    let block = topBlocks[0];
    while (block) {
      commands.push(block.type);
      block = block.getNextBlock() as any;
    }

    let currentX = playerX;
    let currentY = playerY;
    let currentDirection = direction;

    for (const cmd of commands) {
      let nextX = currentX;
      let nextY = currentY;

      // ลอจิกเดินตามทิศทาง
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

      // กันออกนอกแมพ
      nextX = Math.max(0, Math.min(9, nextX));
      nextY = Math.max(0, Math.min(9, nextY));

      // เช็กกำแพง
      if (!isWall(nextX, nextY)) {
        currentX = nextX;
        currentY = nextY;
        setPlayerX(currentX);
        setPlayerY(currentY);
      }

      setDirection(currentDirection);
      await sleep(300);

      // เช็กชนะ
      if (currentX === 6 && currentY === 1) {
        setIsWin(true);
        workspaceRef.current.clear();
        return;
      }
    }
    workspaceRef.current.clear();
  };

  return (
    <div className="w-full min-h-screen bg-neutral-900 p-4 md:p-8 flex flex-col items-center gap-6">
      <h1 className="text-white text-5xl font-pixel font-bold uppercase drop-shadow-md">
        DRIVER
      </h1>

      <div className="flex flex-col xl:flex-row gap-8 w-full max-w-6xl justify-center items-start">
        {/* ฝั่งซ้าย: กระดานเกม */}
        <div className="flex flex-col gap-4">
          <GameBoard
            playerX={playerX}
            playerY={playerY}
            direction={direction}
            walls={WALLS}
          />
        </div>

        {/* ฝั่งขวา: กล่องเขียนโค้ด Blockly */}
        <div className="flex flex-col gap-4 w-full md:w-[500px]">
          <div className="h-[500px] border-4 border-black rounded-xl overflow-hidden bg-white shadow-xl">
            <BlocklyEditor
              onReady={(ws) => {
                workspaceRef.current = ws;
              }}
            />
          </div>
          <button
            className="bg-orange-600 border-4 border-black text-white font-pixel font-bold py-4 text-3xl rounded-xl hover:bg-orange-700 active:scale-95 transition-all shadow-lg"
            onClick={runProgram}
          >
            RUN PROGRAM ▶
          </button>
        </div>
      </div>

      {/* ป๊อปอัปเมื่อชนะ */}
      {isWin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-amber-100 border-8 border-black p-8 rounded-xl flex flex-col items-center gap-6 shadow-2xl">
            <h2 className="text-6xl font-pixel font-bold text-orange-600 drop-shadow-sm">
              Victory!
            </h2>
            <p className="text-4xl">⭐ ⭐ ⭐</p>
            <button
              className="bg-green-500 border-4 border-black text-white font-pixel font-bold py-3 px-8 text-2xl rounded-lg hover:bg-green-600 active:scale-95 transition-all"
              onClick={() => {
                setPlayerX(5);
                setPlayerY(8);
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
