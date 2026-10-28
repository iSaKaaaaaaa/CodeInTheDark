import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import * as Blockly from "blockly";
import { useSocketStore } from "../store/useSocketStore";

import { MAX_BLOCKS, DUNGEON_TIME, SWAP_TIME } from "../constants/game";

import { useTutorial } from "../hooks/useTutorial";
import { useGameTimer } from "../hooks/useGameTimer";
import { useGameSync } from "../hooks/useGameSync";
import { useGameMovement } from "../hooks/useGameMovement";

import GameHeader from "../components/driver/GameHeader";
import GameBoard from "../components/driver/GameBoard";
import ChatBox from "../components/driver/ChatBox";
import BlockCodePanel from "../components/driver/BlockCodePanel";

/* ─── Reusable parchment tutorial card ─── */
function TutorialCard({
  title,
  titleColor = '#ea580c',
  titleBorder = '#7c2d12',
  children,
  buttonText = 'NEXT ➔',
  onNext,
  disabled = false,
  className = '',
}: {
  title: string;
  titleColor?: string;
  titleBorder?: string;
  children: React.ReactNode;
  buttonText?: string;
  onNext: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`pointer-events-auto max-w-[500px] w-[92vw] mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.85)] rounded-xl ${className} font-game-body`}>
      {/* Wooden frame top */}
      <div className="mx-2 h-4 sm:h-5 rounded-t-md relative" style={{
        background: 'linear-gradient(180deg, #8B5E3C 0%, #6B3F1F 40%, #5C2E18 100%)',
        borderTop: '2px solid #A97B50', borderLeft: '2px solid #7A4E2D', borderRight: '2px solid #4A2510',
        boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)' }} />
        {[0, 1].map(i => <div key={i} className={`absolute top-1/2 -translate-y-1/2 ${i === 0 ? 'left-2.5' : 'right-2.5'} w-2 h-2 rounded-full bg-[#C4A265] border border-[#8B6F3A]`} />)}
      </div>
      {/* Parchment body */}
      <div className="mx-0.5 px-5 sm:px-7 py-4 sm:py-6 relative" style={{
        background: 'linear-gradient(170deg, #F5E6C8 0%, #EDD9A3 30%, #E8D08E 60%, #DBBF78 100%)',
        borderLeft: '3px solid #B8944F', borderRight: '3px solid #9A7A3D',
        boxShadow: 'inset 0 0 30px rgba(139,99,49,0.15), inset 0 0 60px rgba(139,99,49,0.08), 4px 0 8px rgba(0,0,0,0.2), -4px 0 8px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.3)',
      }}>
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(101,67,33,0.12)' }} />
        <div className="relative z-10 flex flex-col items-center gap-2.5 sm:gap-3.5">
          {/* Title badge */}
          <span className="inline-block font-bold text-white text-base sm:text-lg md:text-xl px-4 py-1 rounded-xl border-2 uppercase tracking-wider font-game-sub" style={{
            background: titleColor, borderColor: titleBorder,
            boxShadow: `0 3px 0 ${titleBorder}`, textShadow: '1.5px 1px 0 #000',
          }}>
            {title}
          </span>
          {/* Content */}
          <div
            className="text-xs sm:text-sm md:text-base font-semibold text-[#382503] leading-relaxed text-center w-full font-game-body tracking-normal"
            style={{ textShadow: "0.5px 0.5px 0px rgba(255,255,255,0.6)" }}
          >
            {children}
          </div>
          {/* Button */}
          <button
            onClick={onNext}
            disabled={disabled}
            className={`mt-1 font-bold text-sm sm:text-base px-6 py-2 rounded-xl border-b-[4px] border-r-[4px] border-t-2 border-l-2 uppercase tracking-wider transition-all font-game-sub ${
              disabled
                ? 'bg-[#8B6F3A] border-[#5c2e0b] text-[#d4c9a8] shadow-none translate-y-1 cursor-not-allowed'
                : 'bg-[#b45309] border-[#382503] text-white hover:bg-[#d97706] active:translate-y-[4px] active:border-b-0 active:border-r-0 active:shadow-none shadow-[0_4px_0_#2a1b12]'
            }`}
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            {buttonText}
          </button>
        </div>
      </div>
      {/* Wooden frame bottom */}
      <div className="mx-2 h-4 sm:h-5 rounded-b-md relative" style={{
        background: 'linear-gradient(0deg, #8B5E3C 0%, #6B3F1F 40%, #5C2E18 100%)',
        borderBottom: '2px solid #4A2510', borderLeft: '2px solid #7A4E2D', borderRight: '2px solid #4A2510',
        boxShadow: '0 4px 8px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.1)',
      }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)' }} />
        {[0, 1].map(i => <div key={i} className={`absolute top-1/2 -translate-y-1/2 ${i === 0 ? 'left-2.5' : 'right-2.5'} w-2 h-2 rounded-full bg-[#C4A265] border border-[#8B6F3A]`} />)}
      </div>
    </div>
  );
}

/* ─── Inline badge helper ─── */
function Badge({ children, color = 'bg-blue-100 text-blue-800 border-blue-800' }: { children: React.ReactNode; color?: string }) {
  return <span className={`inline-block ${color} border-2 px-2 py-0.5 rounded-md font-bold shadow-sm text-xs sm:text-sm uppercase tracking-wide font-game-sub`}>{children}</span>;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function GameScreen() {
  const { username, socket, role, setRole, mapData: serverMapData, startGame, dungeonTimeLeft, setDungeonTimeLeft, swapTimeLeft, setSwapTimeLeft, players, leaveStage } = useSocketStore();
  const isHost = players.length > 0 ? players[0].username === username : role === 'driver';

  if (!serverMapData) {
    return <div className="h-screen flex items-center justify-center text-white bg-black font-game-sub text-2xl">Generating Map...</div>;
  }
  const mapData = serverMapData;
  const { walls: WALLS, start: START, goal: GOAL } = mapData;

  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [playerX, setPlayerX] = useState(START.x);
  const [playerY, setPlayerY] = useState(START.y);
  const [direction, setDirection] = useState<"up" | "right" | "down" | "left">("up");
  const [isWin, setIsWin] = useState(false);
  const [isLose, setIsLose] = useState(false);
  const [loseReason, setLoseReason] = useState<"blocks" | "time" | null>(null);
  const [panelKey, setPanelKey] = useState(0);
  const [availableQuota, setAvailableQuota] = useState(MAX_BLOCKS);
  const [blocksLeft, setBlocksLeft] = useState(MAX_BLOCKS);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [showSwapAlert, setShowSwapAlert] = useState(false);

  const isWinRef = useRef(false);
  const isLoseRef = useRef(false);
  const roleRef = useRef(role);
  const availableQuotaRef = useRef(MAX_BLOCKS);

  useEffect(() => { isWinRef.current = isWin; isLoseRef.current = isLose; roleRef.current = role; }, [isWin, isLose, role]);
  useEffect(() => { availableQuotaRef.current = availableQuota; if (workspaceRef.current) workspaceRef.current.options.maxBlocks = availableQuota; }, [availableQuota]);

  // Calculate human-readable coordinate string for goal (e.g. "G1", "F8")
  const goalCoord = useMemo(() => {
    const colLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
    const goalInnerX = GOAL.x - 1;
    const goalInnerY = GOAL.y - 1;
    if (goalInnerX >= 0 && goalInnerX < 13 && goalInnerY >= 0 && goalInnerY < 13) {
      return `${colLabels[goalInnerX]}${goalInnerY + 1}`;
    }
    return `(${GOAL.x},${GOAL.y})`;
  }, [GOAL.x, GOAL.y]);

  const {
    tutorialStep,
    setTutorialStep,
    tutorialStepRef,
    selfReady,
    markSelfReady,
    countdown,
    startInteractiveImmediately,
    mockMessage,
    dragDone,
    runDone,
    chatDone,
    trapDone,
    hasTraps,
    onTutorialBlockDragged,
    onTutorialRunPressed,
    onTutorialChatSent,
    validateTutorialChat,
  } = useTutorial({
    socket,
    role,
    goalCoord,
    playerPos: { x: playerX, y: playerY },
    walls: WALLS,
    traps: mapData.traps,
  });
  const driverTotal = hasTraps ? 4 : 3;
  const dragNum = hasTraps ? 3 : 2;
  const runNum = hasTraps ? 4 : 3;

  useGameTimer({ socket, role, setRole, tutorialStepRef, isWinRef, isLoseRef, workspaceRef, availableQuotaRef, setIsLose, setLoseReason, setShowSwapAlert, setBlocksLeft, setExecutionError, setDungeonTimeLeft, setSwapTimeLeft });
  useGameSync({ socket, role, setRole, workspaceRef, availableQuotaRef, setPlayerX, setPlayerY, setDirection, setBlocksLeft, setAvailableQuota, setIsWin, setIsLose, setLoseReason, setDungeonTimeLeft, setSwapTimeLeft, setShowSwapAlert, setExecutionError, setPanelKey });
  const { runProgram, resetGameToNewStart, emitGameState } = useGameMovement({
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
    maxBlocks: MAX_BLOCKS,
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
  });

  // Reset chat, character position, timers, and blocks when tutorial ends
  const [chatResetSignal, setChatResetSignal] = useState(0);
  const prevTutorialStepRef = useRef(tutorialStep);
  useEffect(() => {
    const prev = prevTutorialStepRef.current;
    prevTutorialStepRef.current = tutorialStep;
    if (prev !== 99 && tutorialStep === 99 && (prev === 12 || prev === 22)) {
      setChatResetSignal((n) => n + 1);
      setPlayerX(START.x);
      setPlayerY(START.y);
      setDirection("up");
      setDungeonTimeLeft(DUNGEON_TIME);
      setSwapTimeLeft(SWAP_TIME);
      availableQuotaRef.current = MAX_BLOCKS;
      setAvailableQuota(MAX_BLOCKS);
      setBlocksLeft(MAX_BLOCKS);
      setExecutionError(null);
      if (workspaceRef.current) {
        workspaceRef.current.clear();
      }
      if (role === "driver" && socket) {
        socket.emit("sync_game_state", {
          playerX: START.x,
          playerY: START.y,
          direction: "up",
          blocksLeft: MAX_BLOCKS,
          availableQuota: MAX_BLOCKS,
          dungeonTimeLeft: DUNGEON_TIME,
          swapTimeLeft: SWAP_TIME,
          executionError: null,
        });
        socket.emit("sync_blockly", "<xml></xml>");
      }
    }
  }, [tutorialStep, START.x, START.y, role, socket, setDungeonTimeLeft, setSwapTimeLeft]);

  const prevMapDataRef = useRef(mapData);
  useEffect(() => { if (prevMapDataRef.current !== mapData) { prevMapDataRef.current = mapData; resetGameToNewStart(); } }, [mapData, resetGameToNewStart]);

  const handleWorkspaceReady = useCallback((ws: Blockly.WorkspaceSvg) => {
    workspaceRef.current = ws;
    ws.options.maxBlocks = availableQuotaRef.current;
    ws.addChangeListener((event) => {
      if (event.type === Blockly.Events.BLOCK_CREATE) {
        onTutorialBlockDragged();
      }
      if (roleRef.current === "driver") {
        if (event.type === Blockly.Events.BLOCK_CREATE || event.type === Blockly.Events.BLOCK_DELETE || event.type === Blockly.Events.BLOCK_MOVE || event.type === Blockly.Events.BLOCK_CHANGE) {
          const isPractice = tutorialStepRef.current !== 99;
          const used = ws.getAllBlocks(false).length;
          const newBlocksLeft = isPractice ? MAX_BLOCKS : Math.max(0, availableQuotaRef.current - used);
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
  }, [socket, onTutorialBlockDragged, tutorialStepRef]);

  const boundaryWalls = useMemo(
    () => WALLS.filter((wall) => wall.x === 0 || wall.x === 14 || wall.y === 0 || wall.y === 14),
    [WALLS]
  );

  const handleScreenClick = () => {
    if (executionError && role === "driver") {
      setExecutionError(null);
      emitGameState({ executionError: null });
    }
  };

  const isPlaying = tutorialStep === 99 && !isWin && !isLose;
  const isStageWarning = isPlaying && dungeonTimeLeft <= 60 && dungeonTimeLeft > 30;
  const isStageCritical = isPlaying && dungeonTimeLeft <= 30 && dungeonTimeLeft > 10;
  const isStageFinal = isPlaying && dungeonTimeLeft <= 10 && dungeonTimeLeft > 0;
  const isSwapImminent = isPlaying && swapTimeLeft <= 10 && swapTimeLeft > 0;

  return (
    <div
      className="w-full h-screen bg-cover bg-center flex flex-col font-game-body cursor-default relative overflow-x-hidden overflow-y-auto"
      style={{ backgroundImage: "url('/ui/ingame.png')" }}
      onClick={handleScreenClick}
    >
      {/* Tutorial Overlay */}
      {(tutorialStep === 0 || tutorialStep === 1 || tutorialStep === 2 || tutorialStep === 3) && (
        <div className="fixed inset-0 z-[100] bg-black/75 pointer-events-auto backdrop-blur-sm transition-opacity duration-300" />
      )}

      {/* Tutorial Modals */}
      {(tutorialStep <= 5 || (tutorialStep >= 10 && tutorialStep <= 13) || (tutorialStep >= 20 && tutorialStep <= 22)) && (
        <div className="fixed inset-0 z-[110] flex pointer-events-none font-game-body p-4 md:p-8">

          {/* Step 0: Waiting for partner */}
          {tutorialStep === 0 && (
            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-95 duration-300">
              <TutorialCard title="WAITING FOR PARTNER" buttonText="WAITING..." onNext={() => {}} disabled={true}>
                <p>You have completed the tutorial briefing.</p>
                <p className="mt-3 text-[#8b6840] bg-[#f5e6c8] p-2.5 rounded-lg border-2 border-[#b8944f]/30 text-xs sm:text-sm">
                  Waiting for your teammate to finish their briefing so you can start together...
                </p>
              </TutorialCard>
            </div>
          )}

          {/* Step 1: Welcome & Role Introduction */}
          {tutorialStep === 1 && (
            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-95 duration-300">
              <TutorialCard title="WELCOME TO THE DUNGEON" buttonText="NEXT ➔" onNext={() => setTutorialStep(2)}>
                {role === "driver" ? (
                  <>
                    <p className="text-base sm:text-lg">You are the <Badge color="bg-blue-100 text-blue-800 border-blue-800">DRIVER</Badge></p>
                    <p className="mt-2 text-xs sm:text-sm">You control <strong className="text-orange-700">Code Movement Blocks</strong>, see traps and the goal flag. But... <strong className="text-red-600">you cannot see stone walls!</strong></p>
                    <p className="mt-2 text-xs sm:text-sm text-[#78350f] bg-[#f5e6c8] p-2 rounded-lg border-2 border-[#b8944f]/40">
                      Your teammate (Navigator) sees all walls and must guide you via Chat.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-base sm:text-lg">You are the <Badge color="bg-sky-100 text-sky-800 border-sky-600">NAVIGATOR</Badge></p>
                    <p className="mt-2 text-xs sm:text-sm">You see <strong className="text-sky-700">All Stone Walls</strong>, but... <strong className="text-red-600">you cannot see traps or the goal flag!</strong></p>
                    <p className="mt-2 text-xs sm:text-sm text-[#78350f] bg-[#f5e6c8] p-2 rounded-lg border-2 border-[#b8944f]/40">
                      Your mission is to read the maze layout and guide the Driver via Chat.
                    </p>
                  </>
                )}
                <p className="mt-2.5 text-[#ea580c] font-bold text-sm sm:text-base font-game-sub">Cooperate closely to escape the dungeon!</p>
              </TutorialCard>
            </div>
          )}

          {/* Step 2: Map Focus & Key Objective */}
          {tutorialStep === 2 && (
            <div className="absolute top-1/2 -translate-y-1/2 right-[2%] lg:right-[6%] xl:right-[10%] animate-in fade-in slide-in-from-right-8 duration-300">
              <TutorialCard title="MAP & MISSION" titleColor="#2B6CB0" titleBorder="#1A365D" buttonText="GOT IT ➔" onNext={() => setTutorialStep(3)}>
                {role === "driver" ? (
                  <div className="space-y-2">
                    <p className="text-sm sm:text-base">Look at the <Badge color="bg-green-100 text-green-800 border-green-800">GOAL FLAG</Badge> on the center map!</p>
                    <div className="bg-red-50/90 border-2 border-red-400 p-2.5 rounded-xl text-left text-xs sm:text-sm text-red-900 font-semibold space-y-1">
                      <p className="text-red-700 font-bold font-game-sub">CRITICAL RULE:</p>
                      <p>Only the <strong className="text-red-700">DRIVER sees the Goal Flag</strong> (Navigator cannot see it!).</p>
                      <p>Check the grid coordinate (e.g. <span className="text-amber-800 font-bold">{goalCoord}</span>) and always tell your Navigator in Chat!</p>
                      <p>You also see <strong className="text-red-700">traps</strong>. Warn your Navigator, since stepping on one sends you back to start!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm sm:text-base">Notice the <Badge color="bg-amber-100 text-amber-900 border-amber-900">STONE WALLS</Badge> and Fog of War.</p>
                    <div className="bg-amber-50/90 border-2 border-amber-400 p-2.5 rounded-xl text-left text-xs sm:text-sm text-amber-950 font-semibold space-y-1">
                      <p className="text-amber-800 font-bold font-game-sub">CRITICAL RULE:</p>
                      <p>You see every wall, but the <strong className="text-red-700">Driver sees zero walls!</strong></p>
                      <p>If you do not guide them, they will collide with walls and waste code blocks.</p>
                    </div>
                  </div>
                )}
              </TutorialCard>
            </div>
          )}

          {/* Step 3: Transition Countdown */}
          {tutorialStep === 3 && (
            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-95 duration-300">
              <TutorialCard
                title="GET READY!"
                titleColor="#ea580c"
                titleBorder="#9a3412"
                buttonText="START NOW ➔"
                onNext={startInteractiveImmediately}
              >
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm sm:text-base font-bold text-[#5c2e0b] font-game-sub">
                    Entering Practice Mode in
                  </p>
                  <span className="text-5xl sm:text-6xl font-bold text-red-600 drop-shadow-md animate-bounce font-pixel">
                    {countdown}
                  </span>
                  <p className="text-xs sm:text-sm text-[#78350f]">
                    Explore your screen, test tools, and complete your role objectives (No time penalty).
                  </p>
                </div>
              </TutorialCard>
            </div>
          )}

          {/* ─── DRIVER INTERACTIVE STEPS ─── */}
          {tutorialStep === 10 && (
            <div className="absolute top-4 right-[2%] lg:right-[4%] max-w-[440px] animate-in fade-in slide-in-from-top-4 duration-300">
              <TutorialCard
                title={`MISSION 1/${driverTotal} (DRIVER)`}
                titleColor="#2563eb"
                titleBorder="#1e40af"
                buttonText={chatDone ? "✓ COMPLETED" : "SEND GOAL COORD IN CHAT..."}
                onNext={() => setTutorialStep(hasTraps ? 13 : 11)}
                disabled={!chatDone}
              >
                <p className="text-sm sm:text-base">
                  Spot the <strong className="text-green-700">Goal Flag</strong> on the center map. Type its coordinate (<strong className="text-amber-800">{goalCoord}</strong>) in the <Badge color="bg-white text-blue-700 border-gray-300">Chat Box</Badge> on the left!
                </p>
                <p className="mt-1.5 text-xs text-[#8b6840]">
                  (Type the coordinate, e.g. <strong className="text-amber-900">"{goalCoord}"</strong> or <strong className="text-amber-900">"Goal at {goalCoord}"</strong>, then press Enter)
                </p>
              </TutorialCard>
            </div>
          )}

          {/* Driver trap mission: only the Driver sees traps, so they must warn the Navigator */}
          {tutorialStep === 13 && (
            <div className="absolute top-4 right-[2%] lg:right-[4%] max-w-[440px] animate-in fade-in slide-in-from-top-4 duration-300">
              <TutorialCard
                title={`MISSION 2/${driverTotal} (DRIVER)`}
                titleColor="#dc2626"
                titleBorder="#7f1d1d"
                buttonText={trapDone ? "✓ TRAP REPORTED" : "SEND TRAP COORD IN CHAT..."}
                onNext={() => setTutorialStep(11)}
                disabled={!trapDone}
              >
                <p className="text-sm sm:text-base">
                  Find a <Badge color="bg-red-100 text-red-800 border-red-800">TRAP</Badge> hole on the center map. Only <strong className="text-red-700">you</strong> can see traps. The Navigator cannot!
                </p>
                <p className="mt-1.5 text-xs text-[#8b6840]">
                  Stepping on a trap sends you <strong className="text-red-700">back to start</strong>. Send its coordinate (e.g. <strong className="text-amber-900">"Trap at C5"</strong>) in Chat so your Navigator can route around it.
                </p>
              </TutorialCard>
            </div>
          )}

          {tutorialStep === 11 && (
            <div className="absolute top-16 md:top-20 left-[24%] md:left-[28%] lg:left-[32%] xl:left-[34%] max-w-[420px] pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
              <TutorialCard
                title={`MISSION ${dragNum}/${driverTotal} (DRIVER)`}
                titleColor="#d97706"
                titleBorder="#b45309"
                buttonText={dragDone ? "✓ DRAGGED!" : "DRAG A MOVE BLOCK..."}
                onNext={() => setTutorialStep(12)}
                disabled={!dragDone}
              >
                <p className="text-sm sm:text-base">
                  Drag a <Badge color="bg-amber-100 text-amber-900 border-amber-900">Move</Badge> block from the <strong>Toolbox</strong> flyout into the <strong>Workspace</strong> on the right!
                </p>
                <p className="mt-1.5 text-xs text-[#8b6840]">
                  Practice dragging now! (Blocks are not consumed during practice).
                </p>
              </TutorialCard>
            </div>
          )}

          {tutorialStep === 12 && (
            <div className="absolute top-16 md:top-20 left-[24%] md:left-[28%] lg:left-[32%] xl:left-[34%] max-w-[420px] pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
              <TutorialCard
                title={`MISSION ${runNum}/${driverTotal} (DRIVER)`}
                titleColor="#16a34a"
                titleBorder="#14532d"
                buttonText={selfReady ? "WAITING FOR TEAMMATE..." : (runDone ? "READY TO PLAY ✓" : "PRESS RUN PROGRAM ▶")}
                onNext={markSelfReady}
                disabled={!runDone || selfReady}
              >
                <p className="text-sm sm:text-base">
                  Click the <Badge color="bg-orange-100 text-orange-900 border-orange-900">RUN PROGRAM ▶</Badge> button on the right to test execution!
                </p>
                {runDone && (
                  <p className="mt-2 text-green-700 font-bold text-sm sm:text-base font-game-sub">
                    Excellent! Character moved. Press READY to start the real game.
                  </p>
                )}
              </TutorialCard>
            </div>
          )}

          {/* ─── NAVIGATOR INTERACTIVE STEPS ─── */}
          {tutorialStep === 20 && (
            <div className="absolute top-4 right-[2%] lg:right-[4%] max-w-[440px] animate-in fade-in slide-in-from-top-4 duration-300">
              <TutorialCard
                title="MISSION 1/2 (NAVIGATOR)"
                titleColor="#0284c7"
                titleBorder="#0369a1"
                buttonText={chatDone ? "✓ MESSAGE SENT!" : "REPLY IN CHAT..."}
                onNext={() => setTutorialStep(22)}
                disabled={!chatDone}
              >
                <p className="text-sm sm:text-base">
                  Your Driver is asking for directions in Chat! Inspect the map in the center and send safe path instructions in <Badge color="bg-white text-sky-700 border-sky-300">Chat Box</Badge> on the left.
                </p>
                <p className="mt-1.5 text-xs text-[#8b6840]">
                  (Inspect the maze and send an open direction like <strong className="text-amber-800">"Go Right"</strong> or <strong className="text-amber-800">"Move Down"</strong>. {hasTraps ? "The Driver reported a trap in chat, so avoid that tile too!" : ""})
                </p>
              </TutorialCard>
            </div>
          )}

          {tutorialStep === 22 && (
            <div className="absolute top-4 right-[2%] lg:right-[4%] max-w-[440px] animate-in fade-in slide-in-from-top-4 duration-300">
              <TutorialCard
                title="MISSION 2/2 (NAVIGATOR)"
                titleColor="#0284c7"
                titleBorder="#0369a1"
                buttonText={selfReady ? "WAITING FOR TEAMMATE..." : "READY TO PLAY ✓"}
                onNext={markSelfReady}
                disabled={selfReady}
              >
                <p className="text-sm sm:text-base">
                  Notice that the code panel on the right is marked <Badge color="bg-amber-100 text-amber-900 border-amber-900">VIEW ONLY</Badge> so you can audit the Driver's code in real time.
                </p>
                <p className="mt-1.5 text-xs text-[#8b6840]">
                  Roles swap every 2 minutes! When ready, click READY below.
                </p>
              </TutorialCard>
            </div>
          )}

          {/* Step 5: Role Swap Explainer */}
          {tutorialStep === 5 && (
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-top-8 duration-300">
              <TutorialCard title="ROLE SWAP SYSTEM" titleColor="#eab308" titleBorder="#a16207" buttonText="GOT IT ➔" onNext={() => setTutorialStep(99)}>
                <p className="text-sm sm:text-base">Watch the <Badge color="bg-green-100 text-green-800 border-green-700">ROLE SWAP</Badge> timer at the top!</p>
                <p className="mt-2 text-sm sm:text-base">When it reaches zero, you and your partner <Badge color="bg-orange-100 text-orange-800 border-orange-800">SWAP ROLES</Badge> instantly.</p>
                <p className="mt-2 text-sm sm:text-base">Keep an eye on <Badge color="bg-red-100 text-red-700 border-red-400">STAGE TIME (5 MIN)</Badge>. If it runs out, you lose!</p>
              </TutorialCard>
            </div>
          )}
        </div>
      )}

      {/* ─── 3-COLUMN GAME LAYOUT: CHAT (LEFT) | MAP (CENTER) | TOOLBOX (RIGHT) ─── */}
      <div className="w-full max-w-[1780px] mx-auto flex flex-col flex-1 p-2 md:p-3 lg:p-3.5 gap-2 md:gap-2.5 relative min-h-0 font-game-body">
        {/* Top Header */}
        <div className={`shrink-0 transition-all duration-300 ${tutorialStep === 5 ? 'relative z-[105] ring-4 ring-white/60 shadow-[0_0_30px_rgba(255,255,255,0.4)] rounded-xl pointer-events-none bg-black/50' : ''}`}>
          <GameHeader
            role={role === "driver" ? "DRIVER" : "NAVIGATOR"}
            dungeonTime={formatTime(dungeonTimeLeft)}
            dungeonTimeLeft={dungeonTimeLeft}
            swapTime={formatTime(swapTimeLeft)}
            swapProgress={(swapTimeLeft / SWAP_TIME) * 100}
            swapTimeLeft={swapTimeLeft}
          />
        </div>

        {/* 3-Column Work Area */}
        <div className="flex flex-col lg:flex-row flex-1 gap-2.5 md:gap-3 w-full items-stretch min-h-0">
          {/* COLUMN 1 (LEFT): CHAT PANEL (~23% width) */}
          <div className={`w-full lg:flex-[2.3] xl:flex-[2.1] min-w-0 flex flex-col min-h-0 transition-all duration-300 ${
            (tutorialStep === 10 || tutorialStep === 13 || tutorialStep === 20)
              ? 'relative z-[105] ring-4 ring-purple-400/90 shadow-[0_0_30px_rgba(168,85,247,0.5)] rounded-2xl'
              : ''
          }`}>
            <ChatBox
              onTutorialChatSent={onTutorialChatSent}
              onValidateTutorialChat={validateTutorialChat}
              isTutorialActive={tutorialStep === 10 || tutorialStep === 13 || tutorialStep === 20}
              mockMessage={mockMessage}
              resetSignal={chatResetSignal}
            />
          </div>

          {/* COLUMN 2 (CENTER): MAP VIEW (~51% width) */}
          <div className={`w-full lg:flex-[5.1] xl:flex-[5.3] min-w-0 flex flex-col min-h-0 transition-all duration-300 ${
            (tutorialStep === 2 || tutorialStep === 10 || tutorialStep === 13)
              ? 'relative z-[105] ring-4 ring-amber-400/90 shadow-[0_0_35px_rgba(251,191,36,0.5)] rounded-[20px]'
              : ''
          }`}>
            <GameBoard
              playerX={playerX}
              playerY={playerY}
              direction={direction}
              walls={role === "driver" ? boundaryWalls : WALLS}
              traps={mapData.traps}
              rocks={mapData.rocks}
              spikes={mapData.spikes}
              goal={GOAL}
              role={role || "driver"}
            />
          </div>

          {/* COLUMN 3 (RIGHT): TOOLBOX & WORKSPACE (~26% width) */}
          <div className={`w-full lg:flex-[2.6] xl:flex-[2.6] min-w-0 flex flex-col min-h-0 transition-all duration-300 ${
            (tutorialStep === 11 || tutorialStep === 12 || tutorialStep === 22)
              ? 'relative z-[105] ring-3 ring-yellow-400/90 shadow-[0_0_30px_rgba(250,204,21,0.5)] rounded-2xl'
              : ''
          }`}>
            <BlockCodePanel
              key={panelKey}
              blocksLeft={blocksLeft}
              maxBlocks={MAX_BLOCKS}
              onReady={handleWorkspaceReady}
              onRun={role === "driver" ? (() => { runProgram(); onTutorialRunPressed(); }) : undefined}
              readOnly={role !== "driver"}
              executionError={executionError}
            />
          </div>
        </div>
      </div>

      {/* ─── VICTORY OVERLAY ─── */}
      {isWin && (() => {
        const blocksUsed = MAX_BLOCKS - blocksLeft;
        const timeUsed = DUNGEON_TIME - dungeonTimeLeft;
        const star2 = blocksUsed < 40;
        const star3 = timeUsed < 240;
        return (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[120] backdrop-blur-sm animate-in fade-in duration-300 font-game-body">
            <div className="relative inline-block max-w-[90vw]">
              <img src="/ui/win_bg.png" alt="Victory Background" className="w-[800px] max-w-full h-auto drop-shadow-[0_0_35px_rgba(217,119,6,0.6)]" />
              <div className="absolute inset-0 flex flex-col items-center">
                <h2 className="absolute top-[9%] text-3xl sm:text-4xl md:text-5xl font-game-sub font-bold text-white tracking-widest uppercase" style={{ textShadow: "-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, 0 6px 0px rgba(0,0,0,0.8)" }}>
                  VICTORY ACHIEVED!
                </h2>
                <div className="absolute top-[32%] flex flex-col items-center justify-center w-full">
                  <div className="flex items-end justify-center gap-6 md:gap-10">
                    <div className="flex flex-col items-center">
                      <span className="text-5xl md:text-6xl drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)]">⭐</span>
                      <span className="text-[#fde68a] text-xs md:text-sm font-bold mt-2 font-game-sub uppercase tracking-wider" style={{ textShadow: "1px 1px 0 #000" }}>Stage Cleared</span>
                    </div>
                    <div className="flex flex-col items-center mb-6">
                      <span className={`text-6xl md:text-7xl drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] ${star2 ? '' : 'opacity-30 grayscale'}`}>⭐</span>
                      <span className={`text-xs md:text-sm font-bold mt-2 font-game-sub uppercase tracking-wider ${star2 ? 'text-[#fde68a]' : 'text-gray-400'}`} style={{ textShadow: "1px 1px 0 #000" }}>Under 40 Blocks</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={`text-5xl md:text-6xl drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] ${star3 ? '' : 'opacity-30 grayscale'}`}>⭐</span>
                      <span className={`text-xs md:text-sm font-bold mt-2 font-game-sub uppercase tracking-wider ${star3 ? 'text-[#fde68a]' : 'text-gray-400'}`} style={{ textShadow: "1px 1px 0 #000" }}>Under 4 Minutes</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[20%] flex gap-3 md:gap-5 w-full justify-center px-8 font-game-sub">
                  <button className="bg-[#78716c] border-[3px] border-[#44403c] text-white font-bold py-2 md:py-2.5 px-5 md:px-8 text-sm md:text-base rounded-full hover:bg-[#57534e] active:scale-95 transition-all shadow-[0_4px_0_#44403c] uppercase tracking-wider" onClick={leaveStage}>Leave</button>
                  {isHost ? (
                    <>
                      <button className="bg-transparent border-[3px] border-[#B28B29] text-white font-bold py-2 md:py-2.5 px-5 md:px-7 text-sm md:text-base rounded-full hover:bg-white/20 active:scale-95 transition-all shadow-md uppercase tracking-wider" onClick={resetGameToNewStart}>Play Again</button>
                      <button className="bg-[#ea580c] border-[3px] border-[#c2410c] text-white font-bold py-2 md:py-2.5 px-6 md:px-9 text-sm md:text-base rounded-full hover:bg-[#c2410c] active:scale-95 transition-all shadow-[0_4px_0_#9a3412] uppercase tracking-wider" onClick={startGame}>Next Stage ➔</button>
                    </>
                  ) : (
                    <div className="bg-[#ea580c]/50 border-[3px] border-[#c2410c] text-white font-bold py-2 md:py-2.5 px-5 md:px-8 text-sm md:text-base rounded-full shadow-md flex items-center font-game-sub uppercase tracking-wider">Awaiting Host...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── DEFEAT OVERLAY ─── */}
      {isLose && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[120] backdrop-blur-sm animate-in fade-in duration-300 font-game-body">
          <div className="relative inline-block max-w-[90vw] grayscale-[0.2]">
            <img src="/ui/win_bg.png" alt="Defeat Background" className="w-[800px] max-w-full h-auto drop-shadow-[0_0_35px_rgba(220,38,38,0.6)]" />
            <div className="absolute inset-0 flex flex-col items-center">
              <h2 className="absolute top-[9%] text-3xl sm:text-4xl md:text-5xl font-game-sub font-bold text-red-500 tracking-widest uppercase" style={{ textShadow: "-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, 0 6px 0px rgba(0,0,0,0.8)" }}>
                DEFEAT
              </h2>
              <div className="absolute top-[40%] flex flex-col items-center justify-center w-full px-12">
                <p className="text-xl sm:text-2xl md:text-3xl font-game-sub font-bold text-white text-center leading-relaxed uppercase tracking-wider" style={{ textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000" }}>
                  {loseReason === "time" ? "TIME EXPIRED!" : "OUT OF BLOCKS!"}
                </p>
                <p className="text-sm sm:text-base md:text-lg font-game-body text-gray-300 mt-2 text-center" style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
                  {loseReason === "time" ? "Dungeon exploration time ran out." : "You have exhausted all allowable command blocks."}
                </p>
              </div>
              <div className="absolute bottom-[20%] flex gap-3 md:gap-6 w-full justify-center px-8 font-game-sub">
                <button className="bg-[#78716c] border-[3px] border-[#44403c] text-white font-bold py-2 md:py-2.5 px-5 md:px-8 text-sm md:text-base rounded-full hover:bg-[#57534e] active:scale-95 transition-all shadow-[0_4px_0_#44403c] uppercase tracking-wider" onClick={leaveStage}>Leave</button>
                {isHost ? (
                  <button className="bg-[#ea580c] border-[3px] border-[#c2410c] text-white font-bold py-2 md:py-2.5 px-6 md:px-10 text-sm md:text-base rounded-full hover:bg-[#c2410c] active:scale-95 transition-all shadow-[0_4px_0_#9a3412] uppercase tracking-wider" onClick={resetGameToNewStart}>Retry</button>
                ) : (
                  <div className="bg-[#dc2626]/50 border-[3px] border-[#991b1b] text-white font-bold py-2 md:py-2.5 px-5 md:px-8 text-sm md:text-base rounded-full shadow-md flex items-center font-game-sub uppercase tracking-wider">Awaiting Host...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── URGENCY GLOW EFFECTS ─── */}
      {isStageWarning && (
        <div
          className="fixed inset-0 pointer-events-none z-[84] transition-opacity duration-500"
          style={{ boxShadow: "inset 0 0 45px rgba(249, 115, 22, 0.3)" }}
        />
      )}
      {isStageCritical && (
        <div
          className="fixed inset-0 pointer-events-none z-[85] ring-4 ring-inset ring-red-500/45 animate-pulse"
          style={{ boxShadow: "inset 0 0 80px rgba(220, 38, 38, 0.5)" }}
        />
      )}
      {isStageFinal && (
        <div
          className="fixed inset-0 pointer-events-none z-[86] ring-8 ring-inset ring-red-600/70 animate-pulse"
          style={{ boxShadow: "inset 0 0 110px rgba(239, 68, 68, 0.7)" }}
        />
      )}
      {isSwapImminent && !isStageCritical && !isStageFinal && (
        <div
          className="fixed inset-0 pointer-events-none z-[84] ring-4 md:ring-6 ring-inset ring-amber-400/45 animate-pulse"
          style={{ boxShadow: "inset 0 0 55px rgba(245, 158, 11, 0.3)" }}
        />
      )}

      {/* ─── ROLE SWAP BANNER ─── */}
      {showSwapAlert && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-[130] animate-in zoom-in-95 duration-200 p-4 font-game-body">
          <div className="relative w-full max-w-2xl">
            <div className="absolute -inset-3 bg-black/60 rounded-3xl blur-2xl pointer-events-none" />

            {/* Wooden top frame */}
            <div
              className="relative z-10 mx-3 h-6 sm:h-7 rounded-t-md"
              style={{
                background: "linear-gradient(180deg, #8B5E3C 0%, #6B3F1F 40%, #5C2E18 100%)",
                borderTop: "3px solid #A97B50",
                borderLeft: "3px solid #7A4E2D",
                borderRight: "3px solid #4A2510",
                boxShadow: "0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)",
                }}
              />
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`absolute top-1/2 -translate-y-1/2 ${i === 0 ? "left-3" : "right-3"} w-2.5 h-2.5 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]`}
                />
              ))}
            </div>

            {/* Parchment Center Body */}
            <div
              className="relative z-10 mx-1.5 px-6 sm:px-10 py-6 sm:py-8 flex flex-col items-center justify-center text-center gap-2.5"
              style={{
                background: "linear-gradient(170deg, #F5E6C8 0%, #EDD9A3 30%, #E8D08E 60%, #DBBF78 100%)",
                borderLeft: "4px solid #B8944F",
                borderRight: "4px solid #9A7A3D",
                boxShadow:
                  "inset 0 0 35px rgba(139, 99, 49, 0.25), 4px 0 10px rgba(0,0,0,0.25), -4px 0 10px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <span className="text-xs sm:text-sm font-game-sub font-bold text-[#7c532b] tracking-[0.25em] uppercase">
                SYSTEM ANNOUNCEMENT
              </span>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-game-sub font-bold text-[#5c2e18] tracking-wider uppercase whitespace-nowrap"
                style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.5)" }}
              >
                ROLE SWAP!
              </h2>

              <div className="w-28 h-0.5 bg-[#8B5E3C]/40 my-1" />

              <div
                className={`mt-1 px-6 sm:px-8 py-2.5 rounded-xl border-2 shadow-md ${
                  role === "driver"
                    ? "bg-[#c2410c] border-[#7c2d12] text-white"
                    : "bg-[#0369a1] border-[#082f49] text-white"
                }`}
              >
                <p
                  className="text-xl sm:text-2xl md:text-3xl font-game-sub font-bold tracking-wider uppercase whitespace-nowrap"
                  style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.45)" }}
                >
                  {role === "driver" ? "YOU ARE NOW DRIVER" : "YOU ARE NOW NAVIGATOR"}
                </p>
              </div>

              <p className="text-sm sm:text-base md:text-lg font-game-body font-semibold text-[#4a2408] mt-1">
                {role === "driver"
                  ? "Your turn to write code blocks and execute movement."
                  : "Your turn to read the maze map and guide your teammate."}
              </p>
            </div>

            {/* Bottom wooden frame */}
            <div
              className="relative z-10 mx-3 h-6 sm:h-7 rounded-b-md"
              style={{
                background: "linear-gradient(0deg, #8B5E3C 0%, #6B3F1F 40%, #5C2E18 100%)",
                borderBottom: "3px solid #4A2510",
                borderLeft: "3px solid #7A4E2D",
                borderRight: "3px solid #4A2510",
                boxShadow: "0 4px 10px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)",
                }}
              />
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`absolute top-1/2 -translate-y-1/2 ${i === 0 ? "left-3" : "right-3"} w-2.5 h-2.5 rounded-full bg-[#C4A265] border border-[#8B6F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
