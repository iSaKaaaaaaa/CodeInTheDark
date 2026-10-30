import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { DUNGEON_TIME, MAX_BLOCKS, SWAP_TIME } from "../constants/game";

interface UseGameTimerOptions {
  socket: Socket | null;
  role: "driver" | "navigator" | null;
  setRole: (role: "driver" | "navigator") => void;
  tutorialStepRef: React.MutableRefObject<number>;
  isWinRef: React.MutableRefObject<boolean>;
  isLoseRef: React.MutableRefObject<boolean>;
  workspaceRef: React.MutableRefObject<any>;
  availableQuotaRef: React.MutableRefObject<number>;
  setIsLose: (v: boolean) => void;
  setLoseReason: (v: "blocks" | "time" | null) => void;
  setShowSwapAlert: (v: boolean) => void;
  setBlocksLeft: (v: number) => void;
  setExecutionError: (v: string | null) => void;
  setDungeonTimeLeft: (time: number | ((prev: number) => number)) => void;
  setSwapTimeLeft: (time: number | ((prev: number) => number)) => void;
}

export function useGameTimer({
  socket,
  role,
  setRole,
  tutorialStepRef,
  isWinRef,
  isLoseRef,
  workspaceRef,
  availableQuotaRef,
  setIsLose,
  setLoseReason,
  setShowSwapAlert,
  setBlocksLeft,
  setExecutionError,
  setDungeonTimeLeft,
  setSwapTimeLeft,
}: UseGameTimerOptions) {
  const isSwappingRef = useRef(false);

  useEffect(() => {
    isSwappingRef.current = false;
    if (role !== "driver") return;
    const timer = setInterval(() => {
      // หยุดเวลาไว้ตลอดช่วงฝึกสอน (Tutorial ทุกขั้นตอน รวมถึงโหมดทดลอง 10, 11, 12, 20, 22 และการ์ดเตือน 5)
      if (tutorialStepRef.current !== 99) return;

      setDungeonTimeLeft((prev) => {
        if (isWinRef.current || isLoseRef.current) return prev;

        if (prev <= 1 && !isWinRef.current && !isLoseRef.current) {
          setIsLose(true);
          setLoseReason("time");
          if (socket) {
            socket.emit("sync_game_state", {
              dungeonTimeLeft: 0,
              isLose: true,
              loseReason: "time",
            });
            const blocksUsed = MAX_BLOCKS - availableQuotaRef.current;
            socket.emit("end_game", {
              result: "lose_time",
              timeUsed: DUNGEON_TIME,
              blocksUsed
            });
          }
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
          if (isSwappingRef.current) return prev;
          isSwappingRef.current = true;

          const myNewRole: "driver" | "navigator" = "navigator";
          const partnerNewRole: "driver" | "navigator" = "driver";

          // Immediately switch role so the swap alert banner displays the player's true new role
          setRole(myNewRole);
          setShowSwapAlert(true);
          setExecutionError(null);
          if (workspaceRef.current) {
            workspaceRef.current.clear();
            setBlocksLeft(availableQuotaRef.current);
          }

          if (socket) {
            socket.emit("sync_game_state", { showSwapAlert: true });
            socket.emit("trigger_role_swap", { newRole: partnerNewRole, swapTimeLeft: SWAP_TIME });
          }

          setTimeout(() => {
            setShowSwapAlert(false);
            if (socket)
              socket.emit("sync_game_state", { showSwapAlert: false });
          }, 3000);

          next = SWAP_TIME;
        }
        if (socket) socket.emit("sync_game_state", { swapTimeLeft: next });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [role, socket, setRole]);
}
