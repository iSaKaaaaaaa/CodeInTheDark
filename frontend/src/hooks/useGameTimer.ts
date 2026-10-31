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

/**
 * Custom Hook ควบคุมนาฬิกาจับเวลาของเกม (useGameTimer):
 * - ให้สิทธิ์ฝั่ง Driver เป็น Master Clock นับเวลาเพียงฝั่งเดียวเพื่อป้องกันเวลาคลาดเคลื่อน
 * - หยุดเวลาไว้ตลอดช่วงฝึกสอน (Tutorial Briefing)
 * - นับถอยหลังเวลารวมดันเจี้ยน (300 วินาที): หากหมดเวลาจะปรับสถานะเป็นแพ้ (lose_time) และแจ้งบันทึกลง DB
 * - นับถอยหลังเวลาสลับบทบาท (120 วินาที): สลับบทบาท Driver <-> Navigator อัตโนมัติ ล้างบล็อกใน Workspace
 * - ส่งข้อมูลเวลาที่อัปเดตแบบรวมศูนย์ (Batched Sync) ผ่าน Socket.IO ทุก 1 วินาที
 */
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
  const swapAlertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isSwappingRef.current = false;
    // ให้เฉพาะ Driver เท่านั้นที่เป็นตัวนับเวลา (Master Clock)
    if (role !== "driver") return;

    const timer = setInterval(() => {
      // หยุดเวลาไว้ตลอดช่วงฝึกสอน
      if (tutorialStepRef.current !== 99) return;
      if (isWinRef.current || isLoseRef.current) return;

      setDungeonTimeLeft((prevDungeon) => {
        if (isWinRef.current || isLoseRef.current) return prevDungeon;

        // จัดการเมื่อเวลาของดันเจี้ยนหมดลง (แพ้การเล่น)
        if (prevDungeon <= 1) {
          isLoseRef.current = true;
          setIsLose(true);
          setLoseReason("time");
          const blocksUsed = MAX_BLOCKS - availableQuotaRef.current;
          if (socket) {
            socket.emit("sync_game_state", {
              dungeonTimeLeft: 0,
              isLose: true,
              loseReason: "time",
            });
            socket.emit("end_game", {
              result: "lose_time",
              timeUsed: DUNGEON_TIME,
              blocksUsed,
            });
          }
          return 0;
        }

        const nextDungeon = Math.max(0, prevDungeon - 1);

        setSwapTimeLeft((prevSwap) => {
          if (isWinRef.current || isLoseRef.current) return prevSwap;

          let nextSwap = prevSwap - 1;
          // จัดการเมื่อถึงเวลาสลับบทบาท (Role Swap)
          if (nextSwap <= 0) {
            if (isSwappingRef.current) return prevSwap;
            isSwappingRef.current = true;

            const myNewRole: "driver" | "navigator" = "navigator";
            const partnerNewRole: "driver" | "navigator" = "driver";

            // สลับบทบาททันที ล้างบล็อกเดิม และยกยอดโควตาบล็อกที่เหลือไปใช้ต่อ
            setRole(myNewRole);
            setShowSwapAlert(true);
            setExecutionError(null);
            setBlocksLeft(availableQuotaRef.current);
            if (workspaceRef.current) {
              workspaceRef.current.clear();
            }

            if (socket) {
              // 1. ส่งสัญญาณให้ผู้เล่นอีกคนเปลี่ยนเป็น Driver
              socket.emit("trigger_role_swap", { newRole: partnerNewRole, swapTimeLeft: SWAP_TIME });
              // 2. ซิงก์สถานะเกมพร้อมแสดงป้ายแจ้งเตือนการสลับบทบาท
              socket.emit("sync_game_state", {
                dungeonTimeLeft: nextDungeon,
                swapTimeLeft: SWAP_TIME,
                showSwapAlert: true,
              });
            }

            if (swapAlertTimeoutRef.current) clearTimeout(swapAlertTimeoutRef.current);
            swapAlertTimeoutRef.current = setTimeout(() => {
              setShowSwapAlert(false);
              if (socket) {
                socket.emit("sync_game_state", { showSwapAlert: false });
              }
            }, 3000);

            return SWAP_TIME;
          }

          // ส่งข้อมูลเวลาปัจจุบันแบบรวมศูนย์ 1 ครั้งต่อวินาที
          if (socket) {
            socket.emit("sync_game_state", {
              dungeonTimeLeft: nextDungeon,
              swapTimeLeft: nextSwap,
            });
          }
          return nextSwap;
        });

        return nextDungeon;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (swapAlertTimeoutRef.current) {
        clearTimeout(swapAlertTimeoutRef.current);
      }
    };
  }, [
    role,
    socket,
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
  ]);
}
