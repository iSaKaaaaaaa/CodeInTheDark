import { useEffect, useRef } from "react";
import * as Blockly from "blockly";
import { Socket } from "socket.io-client";
import { SWAP_TIME } from "../constants/game";

interface UseGameSyncOptions {
  socket: Socket | null;
  role: "driver" | "navigator" | null;
  setRole: (role: "driver" | "navigator") => void;
  workspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>;
  availableQuotaRef: React.MutableRefObject<number>;
  setPlayerX: (v: number) => void;
  setPlayerY: (v: number) => void;
  setDirection: (v: "up" | "right" | "down" | "left") => void;
  setBlocksLeft: (v: number) => void;
  setAvailableQuota: (v: number) => void;
  setIsWin: (v: boolean) => void;
  setIsLose: (v: boolean) => void;
  setLoseReason: (v: "blocks" | "time" | null) => void;
  setDungeonTimeLeft: (time: number | ((prev: number) => number)) => void;
  setSwapTimeLeft: (time: number | ((prev: number) => number)) => void;
  setShowSwapAlert: (v: boolean) => void;
  setExecutionError: (v: string | null) => void;
  setPanelKey: (fn: (prev: number) => number) => void;
}

/**
 * Custom Hook จัดการซิงโครไนซ์สถานะเกมและบล็อกคำสั่ง (useGameSync):
 * - รับข้อมูล sync_game_state เพื่ออัปเดตตำแหน่งผู้เล่น, ทิศทาง, เวลา, และผลการเล่น
 * - ซิงก์ผังบล็อก Blockly (sync_blockly) สำหรับ Navigator (พร้อมบล็อก Event ไม่ให้ส่งย้อนกลับ)
 * - ซิงก์การไฮไลต์บล็อกขณะกำลังรัน (highlight_block)
 * - ดักจับอีเวนต์สลับบทบาท (role_swap) เมื่ออีกฝ่ายส่งสัญญาณเปลี่ยนบทบาท
 */
export function useGameSync({
  socket,
  role,
  setRole,
  workspaceRef,
  availableQuotaRef,
  setPlayerX,
  setPlayerY,
  setDirection,
  setBlocksLeft,
  setAvailableQuota,
  setIsWin,
  setIsLose,
  setLoseReason,
  setDungeonTimeLeft,
  setSwapTimeLeft,
  setShowSwapAlert,
  setExecutionError,
  setPanelKey,
}: UseGameSyncOptions) {
  const roleRef = useRef(role);
  roleRef.current = role;

  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ดักจับข้อมูลซิงก์สถานะเกมและบล็อกคำสั่งจาก Socket.IO
  useEffect(() => {
    if (!socket) return;

    const onSync = (state: any) => {
      // Driver จะไม่รับสถานะปกติเพื่อป้องกันการเขียนทับ ยกเว้นกรณีรีเซ็ตเกม
      if (roleRef.current === "driver" && !state.reset) return;

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
      if (state.dungeonTimeLeft !== undefined) setDungeonTimeLeft(state.dungeonTimeLeft);
      if (state.swapTimeLeft !== undefined) setSwapTimeLeft(state.swapTimeLeft);
      if (state.showSwapAlert !== undefined) setShowSwapAlert(state.showSwapAlert);
      if (state.executionError !== undefined) setExecutionError(state.executionError);

      if (state.reset) {
        setIsWin(false);
        setIsLose(false);
        setLoseReason(null);
        setExecutionError(null);
        setPanelKey((prev) => prev + 1);
      }
    };

    const onSyncBlockly = (xmlText: string) => {
      // มีเฉพาะ Navigator เท่านั้นที่รับ XML ผังบล็อก เพื่อไม่ให้ล้างบล็อกของ Driver
      if (roleRef.current === "driver") return;

      if (workspaceRef.current && xmlText) {
        try {
          const xml = Blockly.utils.xml.textToDom(xmlText);
          // ปิดการส่ง Event ชั่วคราวเพื่อป้องกัน Loop การส่งข้อมูลสะท้อนกลับ
          Blockly.Events.disable();
          try {
            workspaceRef.current.clear();
            Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
          } finally {
            Blockly.Events.enable();
          }
        } catch (e) {
          console.error("Failed to parse Blockly XML from sync", e);
        }
      }
    };

    const onHighlight = (blockId: string | null) => {
      if (roleRef.current === "driver") return;

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
  }, [
    socket,
    workspaceRef,
    availableQuotaRef,
    setPlayerX,
    setPlayerY,
    setDirection,
    setBlocksLeft,
    setAvailableQuota,
    setIsWin,
    setIsLose,
    setLoseReason,
    setDungeonTimeLeft,
    setSwapTimeLeft,
    setShowSwapAlert,
    setExecutionError,
    setPanelKey,
  ]);

  // จัดการเมื่อได้รับสัญญาณสลับบทบาท (Role Swap Receiver)
  useEffect(() => {
    if (!socket) return;

    const onRoleSwap = (data: { newRole: "driver" | "navigator"; swapTimeLeft?: number }) => {
      setRole(data.newRole);
      setSwapTimeLeft(data.swapTimeLeft ?? SWAP_TIME);
      setShowSwapAlert(true);
      setExecutionError(null);
      setBlocksLeft(availableQuotaRef.current);
      if (workspaceRef.current) {
        workspaceRef.current.clear();
      }

      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => {
        setShowSwapAlert(false);
      }, 3000);
    };

    socket.on("role_swap", onRoleSwap);

    return () => {
      socket.off("role_swap", onRoleSwap);
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
    };
  }, [
      if (workspaceRef.current) {
        workspaceRef.current.clear();
      }

      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => {
        setShowSwapAlert(false);
      }, 3000);
    };

    socket.on("role_swap", onRoleSwap);

    return () => {
      socket.off("role_swap", onRoleSwap);
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
    };
  }, [
    socket,
    setRole,
    setSwapTimeLeft,
    setShowSwapAlert,
    workspaceRef,
    availableQuotaRef,
    setBlocksLeft,
    setExecutionError,
  ]);
}
