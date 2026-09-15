import { useEffect } from "react";
import * as Blockly from "blockly";
import { Socket } from "socket.io-client";

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
  setSelectedMapIndex: (v: number) => void;
  setExecutionError: (v: string | null) => void;
  setPanelKey: (fn: (prev: number) => number) => void;
}

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
  setSelectedMapIndex,
  setExecutionError,
  setPanelKey,
}: UseGameSyncOptions) {
  // Navigator Sync Logic
  useEffect(() => {
    if (!socket) return;

    const onSync = (state: any) => {
      // Driver ignores syncs EXCEPT when it's a reset
      if (role === "driver" && !state.reset) return;
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
      if (state.selectedMapIndex !== undefined)
        setSelectedMapIndex(state.selectedMapIndex);
      if (state.executionError !== undefined)
        setExecutionError(state.executionError);

      if (state.roleSwapped) {
        setRole("driver");
        setExecutionError(null); // เคลียร์ error
        if (workspaceRef.current) {
          workspaceRef.current.clear();
          setBlocksLeft(availableQuotaRef.current);
        }
      }

      if (state.reset) {
        // Full reset for Navigator when Host resets the game
        if (state.playerX !== undefined) setPlayerX(state.playerX);
        if (state.playerY !== undefined) setPlayerY(state.playerY);
        if (state.direction !== undefined) setDirection(state.direction);
        setIsWin(false);
        setIsLose(false);
        setLoseReason(null);
        setExecutionError(null);
        if (state.dungeonTimeLeft !== undefined) setDungeonTimeLeft(state.dungeonTimeLeft);
        if (state.swapTimeLeft !== undefined) setSwapTimeLeft(state.swapTimeLeft);
        if (state.availableQuota !== undefined) {
          setAvailableQuota(state.availableQuota);
          availableQuotaRef.current = state.availableQuota;
        }
        if (state.blocksLeft !== undefined) setBlocksLeft(state.blocksLeft);
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
      setShowSwapAlert(true);
      setTimeout(() => {
        setRole(data.newRole);
        setShowSwapAlert(false);
        setExecutionError(null); // เคลียร์ error
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
  }, [socket, setRole, setShowSwapAlert, workspaceRef, availableQuotaRef, setBlocksLeft, setExecutionError]);
}
