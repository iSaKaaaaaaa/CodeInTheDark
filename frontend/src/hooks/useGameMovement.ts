import { useCallback } from "react";
import * as Blockly from "blockly";
import { Socket } from "socket.io-client";
import { DUNGEON_TIME } from "../constants/game";

interface MapData {
  walls: { x: number; y: number }[];
  traps: { x: number; y: number }[];
  rocks: { x: number; y: number }[];
  spikes: { x: number; y: number }[];
  start: { x: number; y: number };
  goal: { x: number; y: number };
}

interface UseGameMovementOptions {
  socket: Socket | null;
  role: "driver" | "navigator" | null;
  workspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>;
  availableQuotaRef: React.MutableRefObject<number>;
  mapData: MapData;
  playerX: number;
  playerY: number;
  direction: "up" | "right" | "down" | "left";
  blocksLeft: number;
  availableQuota: number;
  dungeonTimeLeft: number;
  swapTimeLeft: number;
  showSwapAlert: boolean;
  isWin: boolean;
  isLose: boolean;
  loseReason: "blocks" | "time" | null;
  executionError: string | null;
  maxBlocks: number;
  setPlayerX: (v: number) => void;
  setPlayerY: (v: number) => void;
  setDirection: (v: "up" | "right" | "down" | "left") => void;
  setIsWin: (v: boolean) => void;
  setIsLose: (v: boolean) => void;
  setLoseReason: (v: "blocks" | "time" | null) => void;
  setBlocksLeft: (v: number) => void;
  setAvailableQuota: (v: number) => void;
  setExecutionError: (v: string | null) => void;
  setDungeonTimeLeft: (time: number | ((prev: number) => number)) => void;
  setSwapTimeLeft: (time: number | ((prev: number) => number)) => void;
  setPanelKey: (fn: (prev: number) => number) => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useGameMovement({
  socket,
  role,
  workspaceRef,
  availableQuotaRef,
  mapData,
  playerX,
  playerY,
  direction,
  blocksLeft,
  availableQuota,
  dungeonTimeLeft,
  swapTimeLeft,
  showSwapAlert,
  isWin,
  isLose,
  loseReason,
  executionError,
  maxBlocks,
  setPlayerX,
  setPlayerY,
  setDirection,
  setIsWin,
  setIsLose,
  setLoseReason,
  setBlocksLeft,
  setAvailableQuota,
  setExecutionError,
  setDungeonTimeLeft,
  setSwapTimeLeft,
  setPanelKey,
}: UseGameMovementOptions) {
  const { walls: WALLS, traps: TRAPS, rocks: ROCKS, spikes: SPIKES, start: START, goal: GOAL } = mapData;

  const isWall = (x: number, y: number) => WALLS.some((w) => w.x === x && w.y === y);
  const isTrap = (x: number, y: number) => TRAPS.some((t) => t.x === x && t.y === y);
  const isRock = (x: number, y: number) => ROCKS.some((r) => r.x === x && r.y === y);
  const isSpike = (x: number, y: number) => SPIKES.some((s) => s.x === x && s.y === y);

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
        executionError,
        ...stateOverrides,
      });
    }
  };

  const runProgram = async () => {
    if (!workspaceRef.current || role !== "driver") return;
    setIsWin(false);
    setIsLose(false);
    setExecutionError(null);
    emitGameState({ executionError: null });

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
      if (socket) socket.emit("highlight_block", cmdBlock.id);

      const cmd = cmdBlock.type;
      let nextX = currentX;
      let nextY = currentY;

      if (cmd === "move_up") { nextY--; currentDirection = "up"; }
      else if (cmd === "move_down") { nextY++; currentDirection = "down"; }
      else if (cmd === "move_left") { nextX--; currentDirection = "left"; }
      else if (cmd === "move_right") { nextX++; currentDirection = "right"; }

      nextX = Math.max(0, Math.min(14, nextX));
      nextY = Math.max(0, Math.min(14, nextY));

      let bounceX = currentX;
      let bounceY = currentY;

      if (!isWall(nextX, nextY) && !isRock(nextX, nextY)) {
        currentX = nextX;
        currentY = nextY;
        setPlayerX(currentX);
        setPlayerY(currentY);
      } else if (isWall(nextX, nextY)) {
        setExecutionError("Hit The Wall");
        emitGameState({ executionError: "Hit The Wall" });
        workspaceRef.current.highlightBlock(null);
        if (socket) socket.emit("highlight_block", null);
        await sleep(350);
        break;
      } else if (isRock(nextX, nextY)) {
        setExecutionError("Hit The Rock");
        emitGameState({ executionError: "Hit The Rock" });
        workspaceRef.current.highlightBlock(null);
        if (socket) socket.emit("highlight_block", null);
        await sleep(350);
        break;
      }

      setDirection(currentDirection);

      if (isSpike(currentX, currentY)) {
        setExecutionError("Hit The Spike");
        emitGameState({ playerX: currentX, playerY: currentY, direction: currentDirection, executionError: "Hit The Spike" });
        await sleep(350);

        if (currentDirection === "up") bounceY = currentY + 1;
        if (currentDirection === "down") bounceY = currentY - 1;
        if (currentDirection === "left") bounceX = currentX + 1;
        if (currentDirection === "right") bounceX = currentX - 1;

        currentX = bounceX;
        currentY = bounceY;
        setPlayerX(currentX);
        setPlayerY(currentY);
        setDirection(currentDirection);
        emitGameState({ playerX: currentX, playerY: currentY, direction: currentDirection });
        workspaceRef.current.highlightBlock(null);
        if (socket) socket.emit("highlight_block", null);
        await sleep(350);
        break;
      }

      if (isTrap(currentX, currentY)) {
        setExecutionError("Fall In Trap");
        emitGameState({ playerX: currentX, playerY: currentY, direction: currentDirection, executionError: "Fall In Trap" });
        await sleep(350);

        currentX = START.x;
        currentY = START.y;
        currentDirection = "up";
        setPlayerX(currentX);
        setPlayerY(currentY);
        setDirection(currentDirection);
        emitGameState({ playerX: currentX, playerY: currentY, direction: currentDirection });
        workspaceRef.current.highlightBlock(null);
        if (socket) socket.emit("highlight_block", null);
        await sleep(350);
        break;
      }

      emitGameState({ playerX: currentX, playerY: currentY, direction: currentDirection });
      await sleep(350);

      if (currentX === GOAL.x && currentY === GOAL.y) {
        setIsWin(true);
        const nextQuota = availableQuotaRef.current - blocksToUse;
        if (socket) {
          socket.emit("game_win");
          const timeUsed = Math.max(0, DUNGEON_TIME - dungeonTimeLeft);
          socket.emit("end_game", {
            result: "win",
            timeUsed,
            blocksUsed: maxBlocks - nextQuota
          });
        }
        workspaceRef.current.highlightBlock(null);
        if (socket) socket.emit("highlight_block", null);

        await sleep(500);
        setIsWin(true);

        availableQuotaRef.current = nextQuota;
        setAvailableQuota(nextQuota);
        setBlocksLeft(nextQuota);
        workspaceRef.current.clear();

        emitGameState({
          playerX: currentX, playerY: currentY, direction: currentDirection,
          isWin: true, availableQuota: nextQuota, blocksLeft: nextQuota,
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
      if (socket) {
        const timeUsed = Math.max(0, DUNGEON_TIME - dungeonTimeLeft);
        socket.emit("end_game", {
          result: "lose_blocks",
          timeUsed,
          blocksUsed: maxBlocks - nextQuota
        });
      }
      emitGameState({
        playerX: currentX, playerY: currentY, direction: currentDirection,
        isLose: true, loseReason: "blocks", availableQuota: nextQuota, blocksLeft: nextQuota,
      });
    } else {
      emitGameState({
        playerX: currentX, playerY: currentY, direction: currentDirection,
        availableQuota: nextQuota, blocksLeft: nextQuota,
      });
    }
  };

  const resetGameToNewStart = useCallback(() => {
    if (role !== "driver") return;
    setPlayerX(START.x);
    setPlayerY(START.y);
    setDirection("up");
    setIsWin(false);
    setIsLose(false);
    setLoseReason(null);
    setDungeonTimeLeft(300);
    setSwapTimeLeft(120);

    if (workspaceRef.current) {
      workspaceRef.current.clear();
    }

    availableQuotaRef.current = maxBlocks;
    setAvailableQuota(maxBlocks);
    setBlocksLeft(maxBlocks);

    setPanelKey((prev) => prev + 1);

    if (socket) {
      socket.emit("sync_game_state", {
        playerX: START.x, playerY: START.y, direction: "up",
        blocksLeft: maxBlocks, availableQuota: maxBlocks,
        isWin: false, isLose: false, loseReason: null,
        dungeonTimeLeft: 300, swapTimeLeft: 120, reset: true,
      });
      socket.emit("sync_blockly", "<xml></xml>");

      // Driver เองก็ต้องเคลียร์ chat (เพราะ sync_game_state ส่งไปให้คนอื่นเท่านั้น)
      // ใช้ emit event กลับมาหาตัวเอง
      socket.emit("reset_chat");
    }
  }, [role, socket, START.x, START.y, maxBlocks]);

  return { runProgram, resetGameToNewStart, emitGameState };
}
