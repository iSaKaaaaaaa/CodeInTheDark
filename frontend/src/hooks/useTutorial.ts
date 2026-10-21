import { useRef, useState, useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";

interface UseTutorialOptions {
  socket: Socket | null;
  role: "driver" | "navigator" | null;
}

/*
 * Tutorial step map:
 *   0  = Already completed (waiting for partner)
 *   1  = Welcome & Role intro
 *   2  = Map Focus (Driver: Goal 🚩 & Traps / Navigator: Walls 🧱 & Fog)
 *   3  = 5-Second Countdown / Screen Digest before Interactive
 *
 *   -- DRIVER Interactive --
 *  10  = Step 1/3: Spot the Goal 🚩 & Chat coordinates to Navigator
 *  11  = Step 2/3: Drag a Move block into workspace
 *  12  = Step 3/3: Press RUN ▶ to execute & click READY
 *
 *   -- NAVIGATOR Interactive --
 *  20  = Step 1/2: Incoming simulated chat from Driver asking for directions -> Type in Chat
 *  22  = Step 2/2: Inspect View-Only workspace & click READY
 *
 *   5  = Time / Role Swap warning
 *  99  = Tutorial completed!
 */

export function useTutorial({ socket, role }: UseTutorialOptions) {
  const [tutorialStep, setTutorialStep] = useState(() => {
    return localStorage.getItem("tutorialCompleted") === "true" ? 0 : 1;
  });
  const [selfReady, setSelfReady] = useState(false);
  const [partnerReady, setPartnerReady] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const justCompletedRef = useRef(false);

  // Interactive step completion flags
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

  // Auto-advance Driver:
  // Step 10: chat sent -> step 11 (Drag block)
  useEffect(() => {
    if (tutorialStep === 10 && chatDone) {
      const t = setTimeout(() => setTutorialStep(11), 700);
      return () => clearTimeout(t);
    }
  }, [tutorialStep, chatDone]);

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
          sender: "Driver (จำลอง)",
          text: "เรามองไม่เห็นกำแพงเลย ตอนนี้ทางข้างหน้าปลอดภัยไหม? กำแพงอยู่ตรงไหนบ้าง?",
        });
      }, 500);
      return () => clearTimeout(t);
    }
  }, [tutorialStep, role]);

  // Navigator: When Navigator replies in chat on step 20 -> mock driver responds & go to 22
  useEffect(() => {
    if (tutorialStep === 20 && chatDone) {
      const t1 = setTimeout(() => {
        setMockMessage({
          sender: "Driver (จำลอง)",
          text: "รับทราบ! กำลังเตรียมเดินตามทางที่บอก",
        });
      }, 800);

      const t2 = setTimeout(() => {
        setTutorialStep(22);
      }, 1500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [tutorialStep, chatDone]);

  // Callbacks for GameScreen
  const onTutorialBlockDragged = useCallback(() => {
    if (tutorialStepRef.current === 11) setDragDone(true);
  }, []);

  const onTutorialRunPressed = useCallback(() => {
    if (tutorialStepRef.current === 12) setRunDone(true);
  }, []);

  const onTutorialChatSent = useCallback(() => {
    if (tutorialStepRef.current === 10 || tutorialStepRef.current === 20) {
      setChatDone(true);
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
    onTutorialBlockDragged,
    onTutorialRunPressed,
    onTutorialChatSent,
  };
}
