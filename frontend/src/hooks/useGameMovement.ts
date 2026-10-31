import { useCallback, useEffect, useMemo, useRef } from "react";
import * as Blockly from "blockly";
import { Socket } from "socket.io-client";
import { DUNGEON_TIME, SWAP_TIME } from "../constants/game";
import { extractWorkspaceCommands } from "../blockly/generator";

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
  isHost: boolean;
  username: string;
  workspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>;
  availableQuotaRef: React.MutableRefObject<number>;
  tutorialStepRef?: React.MutableRefObject<number>;
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

/**
 * Custom Hook จัดการการเคลื่อนที่ของตัวละครและการประมวลผลบล็อกคำสั่ง (useGameMovement):
 * - สกัดบล็อกคำสั่งจาก Blockly Workspace และรันแบบ Asynchronous ทีละสเต็ป
 * - ไฮไลต์บล็อกที่กำลังทำงานทั้งในฝั่ง Driver และส่งต่อไปยัง Navigator แบบ Real-time
 * - ตรวจสอบการชนสิ่งกีดขวาง (Collision Detection):
 *   - กำแพง (Wall): ชนแล้วหยุดเดินทันที แจ้งเตือน "Hit The Wall"
 *   - หิน (Rock): ชนแล้วหยุดเดินทันที แจ้งเตือน "Hit The Rock"
 *   - หนาม (Spike): เด้งกลับไปยังช่องปลอดภัยก่อนหน้า (Bounce Back) แจ้งเตือน "Hit The Spike"
 *   - กับดัก (Trap): ตกหลุมพราง วาร์ปกลับจุดเริ่มต้น (START) แจ้งเตือน "Fall In Trap"
 * - ตรวจสอบเงื่อนไขชนะ (Goal Tile) และแพ้ (โควตาบล็อกหมด) พร้อมส่งข้อมูล Transaction ไปยัง Backend
 * - ยกเลิก Async Execution Loop ทันทีด้วย `runIdRef` หากมีการสลับบทบาทหรือรีเซ็ตเกม
 */
export function useGameMovement({
  socket,
  role,
  isHost,
  username,
  workspaceRef,
  availableQuotaRef,
  tutorialStepRef,
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

  const roleRef = useRef(role);
  roleRef.current = role;
  const runIdRef = useRef(0);

  // ยกเลิกการรันโปรแกรมที่ค้างอยู่ทันทีหากผู้เล่นถูกสลับออกจากบทบาท Driver
  useEffect(() => {
    if (role !== "driver") {
      runIdRef.current++;
      if (workspaceRef.current) {
        workspaceRef.current.highlightBlock(null);
      }
      if (socket) {
        socket.emit("highlight_block", null);
      }
    }
  }, [role, socket, workspaceRef]);

  // สร้าง Set เพื่อการตรวจสอบสิ่งกีดขวางความเร็วระดับ O(1)
  const wallSet = useMemo(() => new Set(WALLS.map((w) => `${w.x},${w.y}`)), [WALLS]);
  const trapSet = useMemo(() => new Set(TRAPS.map((t) => `${t.x},${t.y}`)), [TRAPS]);
  const rockSet = useMemo(() => new Set(ROCKS.map((r) => `${r.x},${r.y}`)), [ROCKS]);
  const spikeSet = useMemo(() => new Set(SPIKES.map((s) => `${s.x},${s.y}`)), [SPIKES]);

  const isWall = (x: number, y: number) => wallSet.has(`${x},${y}`);
  const isTrap = (x: number, y: number) => trapSet.has(`${x},${y}`);
  const isRock = (x: number, y: number) => rockSet.has(`${x},${y}`);
  const isSpike = (x: number, y: number) => spikeSet.has(`${x},${y}`);

  // ส่งสถานะเกมปัจจุบันผ่าน Socket.IO
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

  // รันโปรแกรมบล็อกคำสั่งที่ผู้เล่นต่อไว้ใน Workspace
  const runProgram = async () => {
    if (!workspaceRef.current || roleRef.current !== "driver") return;
    const isPractice = tutorialStepRef?.current !== undefined && tutorialStepRef.current !== 99;

    const currentRunId = ++runIdRef.current;

    setIsWin(false);
    setIsLose(false);
    setExecutionError(null);
    emitGameState({ executionError: null });

    const { commandBlocks, blockTypes, totalBlocks: blocksToUse } = extractWorkspaceCommands(workspaceRef.current);
    if (commandBlocks.length === 0) return;

    let runSuccess = false;
    let runFailReason: string | null = null;

    let currentX = playerX;
    let currentY = playerY;
    let currentDirection = direction;

    // บันทึกประวัติการเดิน (ตำแหน่งเริ่มต้น)
    const pathHistory: { x: number; y: number }[] = [{ x: currentX, y: currentY }];

    for (const cmdBlock of commandBlocks) {
      if (runIdRef.current !== currentRunId || roleRef.current !== "driver") {
        workspaceRef.current?.highlightBlock(null);
        if (socket) socket.emit("highlight_block", null);
        return;
      }

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

      if (!isWall(nextX, nextY) && !isRock(nextX, nextY)) {
        currentX = nextX;
        currentY = nextY;
        setPlayerX(currentX);
        setPlayerY(currentY);
      } else if (isWall(nextX, nextY)) {
        runFailReason = "hit_wall";
        setExecutionError("Hit The Wall");
        if (socket && !isPractice) {
          socket.emit("obstacle_hit", { type: "wall", x: nextX, y: nextY, playerName: username });
        }
        emitGameState({ playerX: currentX, playerY: currentY, direction: currentDirection, executionError: "Hit The Wall" });
        workspaceRef.current.highlightBlock(null);
        if (socket) socket.emit("highlight_block", null);
        await sleep(350);
        break;
      } else if (isRock(nextX, nextY)) {
        runFailReason = "hit_rock";
        setExecutionError("Hit The Rock");
        if (socket && !isPractice) {
          socket.emit("obstacle_hit", { type: "rock", x: nextX, y: nextY, playerName: username });
        }
        emitGameState({ playerX: currentX, playerY: currentY, direction: currentDirection, executionError: "Hit The Rock" });
        workspaceRef.current.highlightBlock(null);
        if (socket) socket.emit("highlight_block", null);
        await sleep(350);
        break;
      }

      setDirection(currentDirection);

      if (isSpike(currentX, currentY)) {
        runFailReason = "hit_spike";
        setExecutionError("Hit The Spike");
        if (socket && !isPractice) {
          socket.emit("obstacle_hit", { type: "spike", x: currentX, y: currentY, playerName: username });
        }
        emitGameState({ playerX: currentX, playerY: currentY, direction: currentDirection, executionError: "Hit The Spike" });
        await sleep(350);

        const targetIndex = Math.max(0, pathHistory.length - 2);
        const bounceTarget = pathHistory[targetIndex];

        currentX = bounceTarget.x;
        currentY = bounceTarget.y;

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
        runFailReason = "fell_in_trap";
        setExecutionError("Fall In Trap");
        if (socket && !isPractice) {
          socket.emit("obstacle_hit", { type: "trap", x: currentX, y: currentY, playerName: username });
        }
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

      // บันทึกตำแหน่งที่ปลอดภัยลงในประวัติ
      pathHistory.push({ x: currentX, y: currentY });

      await sleep(350);
      if (runIdRef.current !== currentRunId || roleRef.current !== "driver") {
        workspaceRef.current?.highlightBlock(null);
        if (socket) socket.emit("highlight_block", null);
        return;
      }

      if (!isPractice && currentX === GOAL.x && currentY === GOAL.y) {
        runSuccess = true;
        setIsWin(true);
        const nextQuota = availableQuotaRef.current - blocksToUse;
        if (socket) {
          socket.emit("run_result", { blocks: blockTypes, success: true, failReason: null });
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

    // ตอนฝึกสอน (isPractice) ไม่ลดจำนวนบล็อกที่เหลือ
    const nextQuota = isPractice ? maxBlocks : availableQuotaRef.current - blocksToUse;
    availableQuotaRef.current = nextQuota;
    setAvailableQuota(nextQuota);
    setBlocksLeft(nextQuota);
    workspaceRef.current.clear();

    if (!isPractice && socket && blockTypes.length > 0 && !runSuccess) {
      socket.emit("run_result", { blocks: blockTypes, success: false, failReason: runFailReason });
    }

    if (!isPractice && nextQuota <= 0) {
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
    if (!isHost) return;
    runIdRef.current++;
    setPlayerX(START.x);
    setPlayerY(START.y);
    setDirection("up");
    setIsWin(false);
    setIsLose(false);
    setLoseReason(null);
    setDungeonTimeLeft(DUNGEON_TIME);
    setSwapTimeLeft(SWAP_TIME);

    if (workspaceRef.current) {
      workspaceRef.current.highlightBlock(null);
      workspaceRef.current.clear();
    }
    if (socket) {
      socket.emit("highlight_block", null);
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
        dungeonTimeLeft: DUNGEON_TIME, swapTimeLeft: SWAP_TIME, reset: true,
      });
      socket.emit("sync_blockly", "<xml></xml>");

      socket.emit("reset_chat");
      socket.emit("reset_game");
    }
  }, [isHost, socket, START.x, START.y, maxBlocks, setPlayerX, setPlayerY, setDirection, setIsWin, setIsLose, setLoseReason, setDungeonTimeLeft, setSwapTimeLeft, workspaceRef, availableQuotaRef, setAvailableQuota, setBlocksLeft, setPanelKey]);

  return { runProgram, resetGameToNewStart, emitGameState };
}
