import { useRef, useState, useEffect } from "react";
import { useSocketStore } from "../store/useSocketStore";

interface UseTutorialOptions {
  socket: ReturnType<typeof useSocketStore>["socket"];
  role: "driver" | "navigator" | null;
}

export function useTutorial({ socket, role }: UseTutorialOptions) {
  const [tutorialStep, setTutorialStep] = useState(() => {
    return localStorage.getItem("tutorialCompleted") === "true" ? 99 : 1;
  });
  const [selfReady, setSelfReady] = useState(false);
  const [partnerReady, setPartnerReady] = useState(false);
  const [showStep5Tooltip, setShowStep5Tooltip] = useState(false);
  const justCompletedRef = useRef(false);

  const tutorialStepRef = useRef(tutorialStep);
  useEffect(() => {
    tutorialStepRef.current = tutorialStep;
  }, [tutorialStep]);

  // Sync tutorialReady globally
  useEffect(() => {
    if (!socket) return;
    const onSyncGlobal = (state: any) => {
      if (state.tutorialReady !== undefined) {
        setPartnerReady(state.tutorialReady);
      }
    };
    socket.on("sync_game_state", onSyncGlobal);
    return () => { socket.off("sync_game_state", onSyncGlobal); };
  }, [socket]);

  // When both are ready, finish tutorial
  useEffect(() => {
    if (selfReady && partnerReady && tutorialStep === 4) {
      setTutorialStep(99);
      if (localStorage.getItem("tutorialCompleted") !== "true") {
        justCompletedRef.current = true;
        localStorage.setItem("tutorialCompleted", "true");
      }
    }
  }, [selfReady, partnerReady, tutorialStep]);

  // Step 5 delay
  useEffect(() => {
    if (tutorialStep === 99 && justCompletedRef.current) {
      const timer = setTimeout(() => {
        setTutorialStep(5);
      }, 5000);
      justCompletedRef.current = false;
      return () => clearTimeout(timer);
    }
  }, [tutorialStep]);

  const markSelfReady = () => {
    setSelfReady(true);
    if (socket) socket.emit("sync_game_state", { tutorialReady: true });
  };

  return {
    tutorialStep,
    setTutorialStep,
    tutorialStepRef,
    selfReady,
    partnerReady,
    showStep5Tooltip,
    setShowStep5Tooltip,
    markSelfReady,
  };
}
