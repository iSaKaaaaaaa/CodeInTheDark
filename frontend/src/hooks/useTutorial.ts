import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Socket } from "socket.io-client";

interface UseTutorialOptions {
  socket: Socket | null;
  role: "driver" | "navigator" | null;
  goalCoord?: string;
  playerPos?: { x: number; y: number };
  walls?: { x: number; y: number }[];
  traps?: { x: number; y: number }[];
}

const COL_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];

// Convert inner-grid tile (x, y in 1..13) to a human coordinate, e.g. (3, 5) -> "C5"
function toCoord(x: number, y: number): string {
  if (x >= 1 && x <= 13 && y >= 1 && y <= 13) return `${COL_LABELS[x - 1]}${y}`;
  return `(${x},${y})`;
}

/*
 * Tutorial step map:
 *   0  = Already completed (waiting for partner)
 *   1  = Welcome & Role intro
 *   2  = Map Focus (Driver: Goal 🚩 & Traps / Navigator: Walls 🧱 & Fog)
 *   3  = 5-Second Countdown / Screen Digest before Interactive
 *
 *   -- DRIVER Interactive --
 *  10  = Spot the Goal 🚩 & Chat coordinates to Navigator
 *  13  = Spot a Trap 🕳 & Chat its coordinate to Navigator (skipped if map has no traps)
 *  11  = Drag a Move block into workspace
 *  12  = Press RUN ▶ to execute & click READY
 *
 *   -- NAVIGATOR Interactive --
 *  20  = Step 1/2: Incoming simulated chat from Driver asking for directions -> Type in Chat
 *  22  = Step 2/2: Inspect View-Only workspace & click READY
 *
 *   5  = Time / Role Swap warning
 *  99  = Tutorial completed!
 */

export function useTutorial({ socket, role, goalCoord, playerPos, walls, traps }: UseTutorialOptions) {
  const [tutorialStep, setTutorialStep] = useState(() => {
    return localStorage.getItem("tutorialCompleted") === "true" ? 0 : 1;
  });
  const [selfReady, setSelfReady] = useState(false);
  const [partnerReady, setPartnerReady] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const justCompletedRef = useRef(false);

  // Keep latest playerPos and walls in refs for real-time collision validation
  const playerPosRef = useRef(playerPos);
  const wallsRef = useRef(walls);
  const trapsRef = useRef(traps);
  useEffect(() => {
    playerPosRef.current = playerPos;
    wallsRef.current = walls;
    trapsRef.current = traps;
  }, [playerPos, walls, traps]);

  // Trap helpers: coordinate list (e.g. ["C5", "H9"]) and whether this map has any traps
  const trapCoords = useMemo(() => (traps || []).map((t) => toCoord(t.x, t.y)), [traps]);
  const hasTraps = trapCoords.length > 0;
  const trapCoord = trapCoords[0] || "";

  // Interactive step completion flags
  const [trapDone, setTrapDone] = useState(false);
  const [dragDone, setDragDone] = useState(false);
  const [runDone, setRunDone] = useState(false);
  const [chatDone, setChatDone] = useState(false);
  const [mockMessage, setMockMessage] = useState<{ sender: string; text: string } | null>(null);

  const tutorialStepRef = useRef(tutorialStep);
  useEffect(() => {
    tutorialStepRef.current = tutorialStep;
  }, [tutorialStep]);

  // 5-second countdown timer for Step 3
  useEffect(() => {
    if (tutorialStep !== 3) {
      setCountdown(5);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (role === "driver") {
            setTutorialStep(10);
          } else {
            setTutorialStep(20);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tutorialStep, role]);

  // Driver Step 10: Prompt driver to spot goal
  useEffect(() => {
    if (tutorialStep === 10 && role === "driver") {
      const t = setTimeout(() => {
        setMockMessage({
          sender: "[SYSTEM]",
          text: `[TUTORIAL] Check the center map for the green Goal Flag (${goalCoord || "A-M, 1-13"}), then send its coordinate in Chat!`,
        });
      }, 400);
      return () => clearTimeout(t);
    }
  }, [tutorialStep, role, goalCoord]);

  // Driver Step 13: Prompt driver to spot a trap
  useEffect(() => {
    if (tutorialStep === 13 && role === "driver") {
      const t = setTimeout(() => {
        setMockMessage({
          sender: "[SYSTEM]",
          text: "[TUTORIAL] The Navigator cannot see traps! Find a trap hole on the center map and send its coordinate in Chat.",
        });
      }, 400);
      return () => clearTimeout(t);
    }
  }, [tutorialStep, role]);

  // Auto-advance Driver:
  // Step 10: goal sent -> step 13 (Trap) if map has traps, else step 11 (Drag block)
  useEffect(() => {
    if (tutorialStep === 10 && chatDone) {
      const t = setTimeout(() => setTutorialStep(hasTraps ? 13 : 11), 800);
      return () => clearTimeout(t);
    }
  }, [tutorialStep, chatDone, hasTraps]);

  // Step 13: trap coordinate sent -> step 11 (Drag block)
  useEffect(() => {
    if (tutorialStep === 13 && trapDone) {
      const t = setTimeout(() => setTutorialStep(11), 800);
      return () => clearTimeout(t);
    }
  }, [tutorialStep, trapDone]);

  // Step 11: block dragged -> step 12 (Run)
  useEffect(() => {
    if (tutorialStep === 11 && dragDone) {
      const t = setTimeout(() => setTutorialStep(12), 700);
      return () => clearTimeout(t);
    }
  }, [tutorialStep, dragDone]);

  // Navigator flow:
  // When Navigator enters Step 20, simulate an incoming message from Driver in chat
  useEffect(() => {
    if (tutorialStep === 20 && role === "navigator") {
      const t = setTimeout(() => {
        setMockMessage({
          sender: "Driver (AI Partner)",
          text: hasTraps
            ? `I cannot see the walls! I can see a trap at ${trapCoord}. Which way is safe to move?`
            : "I cannot see the walls! Which way is safe to move? Any obstacles ahead?",
        });
      }, 500);
      return () => clearTimeout(t);
    }
  }, [tutorialStep, role, hasTraps, trapCoord]);

  // Navigator: When Navigator replies in chat on step 20 -> mock driver responds & go to 22
  useEffect(() => {
    if (tutorialStep === 20 && chatDone) {
      const t1 = setTimeout(() => {
        setMockMessage({
          sender: "Driver (AI Partner)",
          text: "Understood! Preparing to follow your directions.",
        });
      }, 700);

      const t2 = setTimeout(() => {
        setTutorialStep(22);
      }, 1600);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [tutorialStep, chatDone]);

  // Validation function: checks if user input is genuinely valid for the current tutorial step
  const validateTutorialChat = useCallback((input: string): { valid: boolean; feedback?: string } => {
    const text = input.trim();
    if (!text) {
      return { valid: false, feedback: "Please enter a message." };
    }

    // Step 10: Driver must provide correct Goal Coordinate
    if (tutorialStepRef.current === 10) {
      const target = (goalCoord || "").trim().toUpperCase();
      const upperInput = text.toUpperCase().replace(/\s+/g, "");

      // Check for coordinate pattern (e.g. "G1", "F8", "D12")
      const matchesTarget = target ? upperInput.includes(target) : /^[A-M]([1-9]|1[0-3])$/i.test(upperInput);

      if (matchesTarget) {
        setChatDone(true);
        return { valid: true };
      } else {
        return {
          valid: false,
          feedback: `Incorrect coordinate! Look at the green flag on the map (Coordinate: ${target || "A-M, 1-13"}) and send it to your partner.`,
        };
      }
    }

    // Step 13: Driver must report the coordinate of a real trap on the map
    if (tutorialStepRef.current === 13) {
      const upperInput = text.toUpperCase().replace(/\s+/g, "");
      const coords = (trapsRef.current || []).map((t) => toCoord(t.x, t.y));
      const hit = coords.find((c) => upperInput.includes(c));
      if (hit) {
        setTrapDone(true);
        return { valid: true };
      }
      return {
        valid: false,
        feedback: `That is not a trap! Look for the hole sprite on the map and send its coordinate (e.g. ${coords[0] || "C5"}).`,
      };
    }

    // Step 20: Navigator must give directional guidance on safe path (verified against map walls)
    if (tutorialStepRef.current === 20) {
      const mentionsUp = /\b(up|north)\b|ขึ้น|ข้างบน|เดินขึ้น/i.test(text);
      const mentionsDown = /\b(down|south)\b|ลง|ข้างล่าง|เดินลง/i.test(text);
      const mentionsLeft = /\b(left|west)\b|ซ้าย|เลี้ยวซ้าย|เดินซ้าย/i.test(text);
      const mentionsRight = /\b(right|east)\b|ขวา|เลี้ยวขวา|เดินขวา/i.test(text);

      const hasAnyDirection = mentionsUp || mentionsDown || mentionsLeft || mentionsRight;

      if (!hasAnyDirection) {
        return {
          valid: false,
          feedback: "Please guide your partner with a safe direction (e.g. 'Go Right' or 'Move Down').",
        };
      }

      // Check walls and boundaries for player's current coordinate
      const px = playerPosRef.current?.x ?? 1;
      const py = playerPosRef.current?.y ?? 1;
      const currentWalls = wallsRef.current || [];
      const wallSet = new Set(currentWalls.map((w) => `${w.x},${w.y}`));

      const trapSet = new Set((trapsRef.current || []).map((t) => `${t.x},${t.y}`));

      // 15x15 map grid: inner walkable is 1..13 (A-M, 1-13). Boundary walls are <= 0 or >= 14.
      // Walls and traps both make a direction unsafe.
      const isBlocked = (x: number, y: number) => {
        if (x <= 0 || x >= 14 || y <= 0 || y >= 14) return true;
        return wallSet.has(`${x},${y}`) || trapSet.has(`${x},${y}`);
      };

      const blockedDirections: string[] = [];
      const safeDirections: string[] = [];

      if (mentionsUp) {
        if (isBlocked(px, py - 1)) blockedDirections.push("Up");
        else safeDirections.push("Up");
      }
      if (mentionsDown) {
        if (isBlocked(px, py + 1)) blockedDirections.push("Down");
        else safeDirections.push("Down");
      }
      if (mentionsLeft) {
        if (isBlocked(px - 1, py)) blockedDirections.push("Left");
        else safeDirections.push("Left");
      }
      if (mentionsRight) {
        if (isBlocked(px + 1, py)) blockedDirections.push("Right");
        else safeDirections.push("Right");
      }

      // If user only suggested directions that hit walls or out-of-bounds:
      if (blockedDirections.length > 0 && safeDirections.length === 0) {
        const openOptions: string[] = [];
        if (!isBlocked(px + 1, py)) openOptions.push("Right");
        if (!isBlocked(px, py + 1)) openOptions.push("Down");
        if (!isBlocked(px - 1, py)) openOptions.push("Left");
        if (!isBlocked(px, py - 1)) openOptions.push("Up");

        const suggestion = openOptions.length > 0 ? ` (Safe paths: ${openOptions.join(" or ")})` : "";
        return {
          valid: false,
          feedback: `Moving ${blockedDirections.join(" / ")} is blocked by a wall or trap! Check the map for an open path${suggestion}.`,
        };
      }

      // Suggested at least one safe, open direction
      if (safeDirections.length > 0) {
        setChatDone(true);
        return { valid: true };
      }

      return {
        valid: false,
        feedback: "Please guide your partner with a safe direction (e.g. 'Go Right' or 'Move Down').",
      };
    }

    return { valid: true };
  }, [goalCoord]);

  // Callbacks for GameScreen
  const onTutorialBlockDragged = useCallback(() => {
    if (tutorialStepRef.current === 11) setDragDone(true);
  }, []);

  const onTutorialRunPressed = useCallback(() => {
    if (tutorialStepRef.current === 12) setRunDone(true);
  }, []);

  const onTutorialChatSent = useCallback(() => {
    if (tutorialStepRef.current === 10 || tutorialStepRef.current === 13 || tutorialStepRef.current === 20) {
      if (tutorialStepRef.current === 13) setTrapDone(true);
      else setChatDone(true);
    }
  }, []);

  const startInteractiveImmediately = useCallback(() => {
    if (role === "driver") {
      setTutorialStep(10);
    } else {
      setTutorialStep(20);
    }
  }, [role]);

  // If already completed, auto-ready
  useEffect(() => {
    if (tutorialStep === 0) {
      setSelfReady(true);
      if (socket) {
        socket.emit("sync_game_state", { tutorialReady: true });
      }
    }
  }, [tutorialStep, socket]);

  // Sync tutorialReady globally
  useEffect(() => {
    if (!socket) return;
    const onSyncGlobal = (state: any) => {
      if (state.tutorialReady !== undefined) {
        setPartnerReady(state.tutorialReady);
      }
    };
    socket.on("sync_game_state", onSyncGlobal);
    return () => {
      socket.off("sync_game_state", onSyncGlobal);
    };
  }, [socket]);

  // When both are ready, finish tutorial
  useEffect(() => {
    if (selfReady && partnerReady && (tutorialStep === 12 || tutorialStep === 22 || tutorialStep === 0)) {
      setTutorialStep(99);
      if (localStorage.getItem("tutorialCompleted") !== "true") {
        justCompletedRef.current = true;
        localStorage.setItem("tutorialCompleted", "true");
      }
    }
  }, [selfReady, partnerReady, tutorialStep]);

  // Step 5 delay after completion
  useEffect(() => {
    if (tutorialStep === 99 && justCompletedRef.current) {
      const timer = setTimeout(() => {
        setTutorialStep(5);
      }, 5000);
      justCompletedRef.current = false;
      return () => clearTimeout(timer);
    }
  }, [tutorialStep]);

  const markSelfReady = useCallback(() => {
    setSelfReady(true);
    if (socket) socket.emit("sync_game_state", { tutorialReady: true });
  }, [socket]);

  return {
    tutorialStep,
    setTutorialStep,
    tutorialStepRef,
    selfReady,
    partnerReady,
    markSelfReady,
    countdown,
    startInteractiveImmediately,
    mockMessage,
    dragDone,
    runDone,
    chatDone,
    trapDone,
    trapCoord,
    hasTraps,
    onTutorialBlockDragged,
    onTutorialRunPressed,
    onTutorialChatSent,
    validateTutorialChat,
  };
}
