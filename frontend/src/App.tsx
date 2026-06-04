import { useRef, useState } from "react";
import * as Blockly from "blockly";

import BlocklyEditor from "./components/BlocklyEditor";
import GameBoard from "./components/GameBoard";

import "./App.css";

function App() {
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

  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  const [playerX, setPlayerX] = useState(5);

  const [playerY, setPlayerY] = useState(8);

  const [direction, setDirection] = useState<"up" | "right" | "down" | "left">(
    "up",
  );

  const [isWin, setIsWin] = useState(false);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

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
      if (cmd === "move_forward") {
        let nextX = currentX;
        let nextY = currentY;

        switch (currentDirection) {
          case "up":
            nextY--;
            break;

          case "down":
            nextY++;
            break;

          case "left":
            nextX--;
            break;

          case "right":
            nextX++;
            break;
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
        await sleep(300);
        // เช็กชนะ
        if (currentX === 6 && currentY === 1) {
          setIsWin(true);

          workspaceRef.current.clear();

          return;
        }
      }

      if (cmd === "turn_left") {
        switch (currentDirection) {
          case "up":
            currentDirection = "left";
            break;

          case "left":
            currentDirection = "down";
            break;

          case "down":
            currentDirection = "right";
            break;

          case "right":
            currentDirection = "up";
            break;
        }

        setDirection(currentDirection);
        await sleep(300);
        if (currentX === 6 && currentY === 1) {
          setIsWin(true);

          workspaceRef.current.clear();

          return;
        }
      }

      if (cmd === "turn_right") {
        switch (currentDirection) {
          case "up":
            currentDirection = "right";
            break;

          case "right":
            currentDirection = "down";
            break;

          case "down":
            currentDirection = "left";
            break;

          case "left":
            currentDirection = "up";
            break;
        }

        setDirection(currentDirection);
        await sleep(300);
        if (currentX === 6 && currentY === 1) {
          setIsWin(true);

          workspaceRef.current.clear();

          return;
        }
      }

      await sleep(300);
    }

    workspaceRef.current.clear();
  };

  return (
    <>
      <div className="app">
        <div>
          <h1>Code In The Dark</h1>

          <GameBoard
            playerX={playerX}
            playerY={playerY}
            direction={direction}
            walls={WALLS}
          />
        </div>

        <div>
          <BlocklyEditor
            onReady={(ws) => {
              workspaceRef.current = ws;
            }}
          />

          <button className="run-btn" onClick={runProgram}>
            RUN
          </button>
        </div>
        {isWin && (
          <div className="victory-overlay">
            <div className="victory-popup">
              <h2>Victory</h2>

              <p>⭐ ⭐ ⭐</p>

              <button
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
    </>
  );
}

export default App;
