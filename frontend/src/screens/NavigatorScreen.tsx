import { useRef, useState, useCallback, useEffect } from "react";
import * as Blockly from "blockly";
import { useSocketStore } from "../store/useSocketStore";

import GameHeader from "../components/driver/GameHeader";
import GameBoard from "../components/driver/GameBoard";
import ChatBox from "../components/driver/ChatBox";
import BlockCodePanel from "../components/driver/BlockCodePanel";

export default function NavigatorScreen() {
  const { socket } = useSocketStore();

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

  // --- State ของการเล่นเกม ---
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [playerX, setPlayerX] = useState(7);
  const [playerY, setPlayerY] = useState(14);
  const [direction, setDirection] = useState<"up" | "right" | "down" | "left">(
    "up",
  );
  const [isWin, setIsWin] = useState(false);
  const [isLose, setIsLose] = useState(false);

  const [panelKey, setPanelKey] = useState(0);

  const MAX_BLOCKS = 25;
  const [blocksLeft, setBlocksLeft] = useState(MAX_BLOCKS);

  // ซิงก์สถานะเกมจาก Driver มายัง Navigator
  useEffect(() => {
    if (!socket) return;

    socket.on("sync_game_state", (state) => {
      setPlayerX(state.playerX);
      setPlayerY(state.playerY);
      setDirection(state.direction);
      if (state.blocksLeft !== undefined) setBlocksLeft(state.blocksLeft);
      if (state.isWin !== undefined) setIsWin(state.isWin);
      if (state.isLose !== undefined) setIsLose(state.isLose);
      if (state.reset) {
        setPanelKey((prev) => prev + 1);
      }
    });

    socket.on("sync_blockly", (xmlText) => {
      if (workspaceRef.current && xmlText) {
        try {
          const xml = Blockly.utils.xml.textToDom(xmlText);
          workspaceRef.current.clear();
          Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
        } catch (e) {
          console.error("Failed to parse Blockly XML from sync", e);
        }
      }
    });

    socket.on("highlight_block", (blockId) => {
      if (workspaceRef.current) {
        workspaceRef.current.highlightBlock(blockId);
      }
    });

    return () => {
      socket.off("sync_game_state");
      socket.off("sync_blockly");
      socket.off("highlight_block");
    };
  }, [socket]);

  // ฟังก์ชันจัดการ Workspace
  const handleWorkspaceReady = useCallback(
    (ws: Blockly.WorkspaceSvg) => {
      workspaceRef.current = ws;
      // ฝั่ง Navigator ไม่สามารถเขียนโค้ดได้ จึงไม่ต้องตั้งค่า maxBlocks
    },
    [],
  );

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center flex flex-col p-4 md:p-6 font-pixel gap-4 cursor-default"
      style={{ backgroundImage: "url('/ingame.png')" }}
    >
      <GameHeader role="NAVIGATOR" />

      <div className="flex flex-1 gap-6 w-full max-w-[1600px] mx-auto items-stretch">
        <div className="w-[55%] flex flex-col gap-4">
          <GameBoard
            playerX={playerX}
            playerY={playerY}
            direction={direction}
            walls={WALLS}
            role="navigator"
          />
          <ChatBox />
        </div>

        <BlockCodePanel
          key={panelKey}
          blocksLeft={blocksLeft}
          onReady={handleWorkspaceReady}
          readOnly={true}
        />
      </div>

      {isWin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-amber-100 border-8 border-black p-8 rounded-xl flex flex-col items-center gap-6 shadow-2xl">
            <h2 className="text-6xl font-pixel font-bold text-orange-600 drop-shadow-sm animate-bounce">
              Victory!
            </h2>
            <p className="text-4xl">⭐ ⭐ ⭐</p>
            <p className="text-2xl text-black">Waiting for driver to restart...</p>
          </div>
        </div>
      )}

      {isLose && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-amber-100 border-8 border-black p-8 rounded-xl flex flex-col items-center gap-6 shadow-2xl">
            <h2 className="text-6xl font-pixel font-bold text-red-600 drop-shadow-sm">
              GAME OVER
            </h2>
            <p className="text-2xl text-black">
              block left = 0, you have no more blocks to run
            </p>
            <p className="text-2xl text-black">Waiting for driver to restart...</p>
          </div>
        </div>
      )}
    </div>
  );
}
