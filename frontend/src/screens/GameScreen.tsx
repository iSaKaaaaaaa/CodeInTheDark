import { useRef, useState, useCallback, useEffect } from "react";
import * as Blockly from "blockly";
import { useSocketStore } from "../store/useSocketStore";

import GameHeader from "../components/driver/GameHeader";
import GameBoard from "../components/driver/GameBoard";
import ChatBox from "../components/driver/ChatBox";
import BlockCodePanel from "../components/driver/BlockCodePanel";

export default function GameScreen() {
  const { socket, role, setRole } = useSocketStore();

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
  const [playerY, setPlayerY] = useState(14);
  const [direction, setDirection] = useState<"up" | "right" | "down" | "left">(
    "up",
  );
  const [isWin, setIsWin] = useState(false);
  const [isLose, setIsLose] = useState(false);
  const [loseReason, setLoseReason] = useState<"blocks" | "time" | null>(null);

  const isWinRef = useRef(false);
  const isLoseRef = useRef(false);
  const roleRef = useRef(role);

  useEffect(() => {
    isWinRef.current = isWin;
    isLoseRef.current = isLose;
    roleRef.current = role;
  }, [isWin, isLose, role]);

  const [panelKey, setPanelKey] = useState(0);

  const MAX_BLOCKS = 25;
  const [availableQuota, setAvailableQuota] = useState(MAX_BLOCKS);
  const [blocksLeft, setBlocksLeft] = useState(MAX_BLOCKS);

  const availableQuotaRef = useRef(MAX_BLOCKS);

  useEffect(() => {
    availableQuotaRef.current = availableQuota;
    if (workspaceRef.current) {
      workspaceRef.current.options.maxBlocks = availableQuota;
    }
  }, [availableQuota]);

  // --- Timer State ---
  const [dungeonTimeLeft, setDungeonTimeLeft] = useState(120); // 5 นาที
  const [swapTimeLeft, setSwapTimeLeft] = useState(30); // 2 นาที
  const [showSwapAlert, setShowSwapAlert] = useState(false);

  // Driver Timer Logic
  useEffect(() => {
    if (role !== "driver") return;
    const timer = setInterval(() => {
      setDungeonTimeLeft((prev) => {
        if (isWinRef.current || isLoseRef.current) return prev;

        if (prev <= 1 && !isWinRef.current && !isLoseRef.current) {
          setIsLose(true);
          setLoseReason("time");
          if (socket)
            socket.emit("sync_game_state", {
              dungeonTimeLeft: 0,
              isLose: true,
              loseReason: "time",
            });
          return 0;
        }
        if (prev <= 0) return 0;

        const next = Math.max(0, prev - 1);
        if (socket) socket.emit("sync_game_state", { dungeonTimeLeft: next });
        return next;
      });

      setSwapTimeLeft((prev) => {
        if (isWinRef.current || isLoseRef.current) return prev;

        let next = prev - 1;
        if (next <= 0) {
          setShowSwapAlert(true);
          if (socket) {
            socket.emit("sync_game_state", { showSwapAlert: true });
            socket.emit("trigger_role_swap", { newRole: "driver" });
          }

          // ซ่อนแจ้งเตือนหลังจาก 3 วินาทีและสลับบทบาท
          setTimeout(() => {
            setShowSwapAlert(false);
            if (socket)
              socket.emit("sync_game_state", { showSwapAlert: false });
            setRole("navigator");
            if (workspaceRef.current) {
              workspaceRef.current.clear();
              setBlocksLeft(availableQuotaRef.current);
            }
          }, 3000);

          next = 30; // รีเซ็ตเวลาหลอดใหม่
        }
        if (socket) socket.emit("sync_game_state", { swapTimeLeft: next });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [role, socket, setRole]);

  // Navigator Sync Logic
  useEffect(() => {
    if (!socket || role !== "navigator") return;

    const onSync = (state: any) => {
      if (state.playerX !== undefined) setPlayerX(state.playerX);
      if (state.playerY !== undefined) setPlayerY(state.playerY);
      if (state.direction !== undefined) setDirection(state.direction);
      if (state.blocksLeft !== undefined) setBlocksLeft(state.blocksLeft);
      if (state.availableQuota !== undefined) {
        setAvailableQuota(state.availableQuota);
        availableQuotaRef.current = state.availableQuota;
      }
      if (state.isWin !== undefined) setIsWin(state.isWin);
      if (state.isLose !== undefined) setIsLose(state.isLose);
      if (state.loseReason !== undefined) setLoseReason(state.loseReason);
      if (state.dungeonTimeLeft !== undefined)
        setDungeonTimeLeft(state.dungeonTimeLeft);
      if (state.swapTimeLeft !== undefined) setSwapTimeLeft(state.swapTimeLeft);
      if (state.showSwapAlert !== undefined)
        setShowSwapAlert(state.showSwapAlert);

      if (state.reset) {
        setPanelKey((prev) => prev + 1);
      }
    };

    const onSyncBlockly = (xmlText: string) => {
      if (workspaceRef.current && xmlText) {
        try {
          const xml = Blockly.utils.xml.textToDom(xmlText);
          workspaceRef.current.clear();
          Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
        } catch (e) {
          console.error("Failed to parse Blockly XML from sync", e);
        }
      }
    };

    const onHighlight = (blockId: string | null) => {
      if (workspaceRef.current) {
        workspaceRef.current.highlightBlock(blockId);
      }
    };

    socket.on("sync_game_state", onSync);
    socket.on("sync_blockly", onSyncBlockly);
    socket.on("highlight_block", onHighlight);

    return () => {
      socket.off("sync_game_state", onSync);
      socket.off("sync_blockly", onSyncBlockly);
      socket.off("highlight_block", onHighlight);
    };
  }, [socket, role]);

  // Handle Role Swap Receiver
  useEffect(() => {
    if (!socket) return;
    const onRoleSwap = (data: { newRole: "driver" | "navigator" }) => {
      setTimeout(() => {
        setRole(data.newRole);
        if (workspaceRef.current) {
          workspaceRef.current.clear();
          setBlocksLeft(availableQuotaRef.current);
        }
      }, 3000);
    };
    socket.on("role_swap", onRoleSwap);
    return () => {
      socket.off("role_swap", onRoleSwap);
    };
  }, [socket, setRole]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // ฟังก์ชันจัดการ Workspace
  const handleWorkspaceReady = useCallback(
    (ws: Blockly.WorkspaceSvg) => {
      workspaceRef.current = ws;
      ws.options.maxBlocks = availableQuotaRef.current;

      ws.addChangeListener((event) => {
        // ถ้าเป็น Driver เมื่อมีการแก้ไข Block ให้ส่ง XML ไปให้ Navigator
        if (roleRef.current === "driver") {
          if (
            event.type === Blockly.Events.BLOCK_CREATE ||
            event.type === Blockly.Events.BLOCK_DELETE ||
            event.type === Blockly.Events.BLOCK_MOVE ||
            event.type === Blockly.Events.BLOCK_CHANGE
          ) {
            const used = ws.getAllBlocks(false).length;
            const newBlocksLeft = Math.max(0, availableQuotaRef.current - used);
            setBlocksLeft(newBlocksLeft);

            if (socket) {
              const xml = Blockly.Xml.workspaceToDom(ws);
              const xmlText = Blockly.Xml.domToText(xml);
              socket.emit("sync_blockly", xmlText);
              socket.emit("sync_game_state", { blocksLeft: newBlocksLeft });
            }
          }
        }
      });
    },
    [role, socket],
  );

  const resetGameToNewStart = () => {
    if (role !== "driver") return; // Only driver can reset
    setPlayerX(7);
    setPlayerY(14);
    setDirection("up");
    setIsWin(false);
    setIsLose(false);
    setLoseReason(null);
    setDungeonTimeLeft(120);
    setSwapTimeLeft(30);

    if (workspaceRef.current) {
      workspaceRef.current.clear();
    }

    availableQuotaRef.current = MAX_BLOCKS;
    setAvailableQuota(MAX_BLOCKS);
    setBlocksLeft(MAX_BLOCKS);

    setPanelKey((prev) => prev + 1);

    if (socket) {
      socket.emit("sync_game_state", {
        playerX: 7,
        playerY: 14,
        direction: "up",
        blocksLeft: MAX_BLOCKS,
        availableQuota: MAX_BLOCKS,
        isWin: false,
        isLose: false,
        loseReason: null,
        dungeonTimeLeft: 120,
        swapTimeLeft: 30,
        reset: true,
      });
      socket.emit("sync_blockly", "<xml></xml>");
    }
  };

  const emitGameState = (stateOverrides: any = {}) => {
    if (role === "driver" && socket) {
      socket.emit("sync_game_state", {
        playerX,
        playerY,
        direction,
        blocksLeft,
        availableQuota,
        isWin,
        isLose,
        loseReason,
        dungeonTimeLeft,
        swapTimeLeft,
        showSwapAlert,
        ...stateOverrides,
      });
    }
  };

  const runProgram = async () => {
    if (!workspaceRef.current || role !== "driver") return;
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

      if (socket) {
        socket.emit("highlight_block", cmdBlock.id);
      }

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

      // ส่ง State ไปให้ Navigator
      emitGameState({
        playerX: currentX,
        playerY: currentY,
        direction: currentDirection,
      });

      await sleep(350);

      if (currentX === 7 && currentY === 1) {
        workspaceRef.current.highlightBlock(null);
        if (socket) socket.emit("highlight_block", null);

        await sleep(500);
        setIsWin(true);

        const nextQuota = availableQuotaRef.current - blocksToUse;
        availableQuotaRef.current = nextQuota;
        setAvailableQuota(nextQuota);
        setBlocksLeft(nextQuota);
        workspaceRef.current.clear();

        emitGameState({
          playerX: currentX,
          playerY: currentY,
          direction: currentDirection,
          isWin: true,
          availableQuota: nextQuota,
          blocksLeft: nextQuota,
        });
        return;
      }
    }

    workspaceRef.current.highlightBlock(null);
    if (socket) socket.emit("highlight_block", null);

    await sleep(500);

    const nextQuota = availableQuotaRef.current - blocksToUse;
    availableQuotaRef.current = nextQuota;
    setAvailableQuota(nextQuota);
    setBlocksLeft(nextQuota);
    workspaceRef.current.clear();

    if (nextQuota <= 0) {
      setIsLose(true);
      setLoseReason("blocks");
      emitGameState({
        playerX: currentX,
        playerY: currentY,
        direction: currentDirection,
        isLose: true,
        loseReason: "blocks",
        availableQuota: nextQuota,
        blocksLeft: nextQuota,
      });
    } else {
      emitGameState({
        playerX: currentX,
        playerY: currentY,
        direction: currentDirection,
        availableQuota: nextQuota,
        blocksLeft: nextQuota,
      });
    }
  };

  const BOUNDARY_WALLS = WALLS.filter(
    (wall) => wall.x === 0 || wall.x === 14 || wall.y === 0 || wall.y === 14,
  );

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center flex flex-col p-4 md:p-6 font-pixel gap-4 cursor-default"
      style={{ backgroundImage: "url('/ingame.png')" }}
    >
      <GameHeader
        role={role === "driver" ? "DRIVER" : "NAVIGATOR"}
        dungeonTime={formatTime(dungeonTimeLeft)}
        swapTime={formatTime(swapTimeLeft)}
        swapProgress={(swapTimeLeft / 30) * 100}
      />

      <div className="flex flex-1 gap-6 w-full max-w-[1600px] mx-auto items-stretch">
        <div className="w-[55%] flex flex-col gap-4">
          <GameBoard
            playerX={playerX}
            playerY={playerY}
            direction={direction}
            walls={role === "driver" ? BOUNDARY_WALLS : WALLS}
            role={role || "driver"}
          />
          <ChatBox />
        </div>

        <BlockCodePanel
          key={panelKey}
          blocksLeft={blocksLeft}
          onReady={handleWorkspaceReady}
          onRun={role === "driver" ? runProgram : undefined}
          readOnly={role !== "driver"}
        />
      </div>

      {isWin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-amber-100 border-8 border-black p-8 rounded-xl flex flex-col items-center gap-6 shadow-2xl">
            <h2 className="text-6xl font-pixel font-bold text-orange-600 drop-shadow-sm animate-bounce">
              Victory!
            </h2>
            <p className="text-4xl">⭐ ⭐ ⭐</p>
            {role === "driver" ? (
              <button
                className="bg-green-500 border-4 border-black text-white font-pixel font-bold py-3 px-8 text-2xl rounded-lg hover:bg-green-600 active:scale-95 transition-all shadow-lg"
                onClick={resetGameToNewStart}
              >
                Play Again
              </button>
            ) : (
              <p className="text-2xl text-black">
                Waiting for driver to restart...
              </p>
            )}
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
              {loseReason === "time"
                ? "Time's up! You ran out of dungeon time."
                : "block left = 0, you have no more blocks to run"}
            </p>
            {role === "driver" ? (
              <button
                className="bg-orange-600 border-4 border-black text-white font-pixel font-bold py-3 px-8 text-2xl rounded-lg hover:bg-orange-700 active:scale-95 transition-all shadow-lg"
                onClick={resetGameToNewStart}
              >
                Try Again
              </button>
            ) : (
              <p className="text-2xl text-black">
                Waiting for driver to restart...
              </p>
            )}
          </div>
        </div>
      )}

      {showSwapAlert && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="w-full h-64 bg-[#78350f]/80 border-y-8 border-[#f59e0b] flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm">
            <h2
              className="text-7xl md:text-8xl font-pixel font-bold text-white tracking-widest text-center mb-4"
              style={{
                textShadow:
                  "4px 4px 0px #b91c1c, -2px -2px 0px #b91c1c, 2px -2px 0px #b91c1c, -2px 2px 0px #b91c1c, 2px 2px 0px #b91c1c",
              }}
            >
              ROLE SWAP !!
            </h2>
            <p
              className="text-4xl md:text-5xl font-pixel font-bold text-white tracking-widest text-center uppercase"
              style={{ textShadow: "3px 3px 0px #000" }}
            >
              NOW YOU A {role === "driver" ? "NAVIGATOR" : "DRIVER"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
