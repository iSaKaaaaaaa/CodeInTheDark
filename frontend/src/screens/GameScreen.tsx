import { useRef, useState, useCallback, useEffect } from "react";
import * as Blockly from "blockly";
import { useSocketStore } from "../store/useSocketStore";

import { MAX_BLOCKS } from "../constants/game";

import { useTutorial } from "../hooks/useTutorial";
import { useGameTimer } from "../hooks/useGameTimer";
import { useGameSync } from "../hooks/useGameSync";
import { useGameMovement } from "../hooks/useGameMovement";

import GameHeader from "../components/driver/GameHeader";
import GameBoard from "../components/driver/GameBoard";
import ChatBox from "../components/driver/ChatBox";
import TopRightMenu from "../components/TopRightMenu";
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
    <div className={`pointer-events-auto max-w-[450px] w-[92vw] mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-xl ${className}`}>
      {/* Wooden frame top */}
      <div className="mx-2 h-3 sm:h-4 rounded-t-md relative" style={{
        background: 'linear-gradient(180deg, #8B5E3C 0%, #6B3F1F 40%, #5C2E18 100%)',
        borderTop: '2px solid #A97B50', borderLeft: '2px solid #7A4E2D', borderRight: '2px solid #4A2510',
        boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)' }} />
        {[0, 1].map(i => <div key={i} className={`absolute top-1/2 -translate-y-1/2 ${i === 0 ? 'left-2' : 'right-2'} w-1.5 h-1.5 rounded-full bg-[#C4A265] border border-[#8B6F3A]`} />)}
      </div>
      {/* Parchment body */}
      <div className="mx-0.5 px-6 sm:px-8 py-6 sm:py-8 relative" style={{
        background: 'linear-gradient(170deg, #F5E6C8 0%, #EDD9A3 30%, #E8D08E 60%, #DBBF78 100%)',
        borderLeft: '3px solid #B8944F', borderRight: '3px solid #9A7A3D',
        boxShadow: 'inset 0 0 30px rgba(139,99,49,0.15), inset 0 0 60px rgba(139,99,49,0.08), 4px 0 8px rgba(0,0,0,0.2), -4px 0 8px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.3)',
      }}>
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(101,67,33,0.12)' }} />
        <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6">
          {/* Title badge */}
          <span className="inline-block font-bold text-white text-xl sm:text-2xl px-6 py-2 rounded-xl border-2 uppercase tracking-widest" style={{
            background: titleColor, borderColor: titleBorder,
            boxShadow: `0 4px 0 ${titleBorder}`, textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
          }}>
            {title}
          </span>
          {/* Content */}
          <div className="text-base sm:text-lg font-bold text-[#382503] leading-relaxed text-center w-full">
            {children}
          </div>
          {/* Button */}
          <button
            onClick={onNext}
            disabled={disabled}
            className={`mt-2 font-bold text-lg sm:text-xl px-10 py-2.5 rounded-xl border-b-[4px] border-r-[4px] border-t-2 border-l-2 uppercase tracking-widest transition-all ${
              disabled
                ? 'bg-[#8B6F3A] border-[#5c2e0b] text-[#d4c9a8] shadow-none translate-y-1 cursor-not-allowed'
                : 'bg-[#b45309] border-[#382503] text-white hover:bg-[#d97706] active:translate-y-[4px] active:border-b-0 active:border-r-0 active:shadow-none shadow-[0_4px_0_#2a1b12]'
            }`}
          >
            {buttonText}
          </button>
        </div>
      </div>
      {/* Wooden frame bottom */}
      <div className="mx-2 h-3 sm:h-4 rounded-b-md relative" style={{
        background: 'linear-gradient(0deg, #8B5E3C 0%, #6B3F1F 40%, #5C2E18 100%)',
        borderBottom: '2px solid #4A2510', borderLeft: '2px solid #7A4E2D', borderRight: '2px solid #4A2510',
        boxShadow: '0 4px 8px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.1)',
      }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px)' }} />
        {[0, 1].map(i => <div key={i} className={`absolute top-1/2 -translate-y-1/2 ${i === 0 ? 'left-2' : 'right-2'} w-1.5 h-1.5 rounded-full bg-[#C4A265] border border-[#8B6F3A]`} />)}
      </div>
    </div>
  );
}

/* ─── Inline badge helper ─── */
function Badge({ children, color = 'bg-blue-100 text-blue-800 border-blue-800' }: { children: React.ReactNode; color?: string }) {
  return <span className={`inline-block ${color} border px-2 py-0.5 rounded-md font-bold shadow-sm text-sm sm:text-base uppercase tracking-wider`}>{children}</span>;
}

export default function GameScreen() {
  const { username, socket, role, setRole, mapData: serverMapData, startGame, setSelectedMapIndex, dungeonTimeLeft, setDungeonTimeLeft, swapTimeLeft, setSwapTimeLeft, players, leaveStage } = useSocketStore();
  const isHost = players.length > 0 ? players[0].username === username : role === 'driver';

  if (!serverMapData) {
    return <div className="h-screen flex items-center justify-center text-white bg-black font-pixel text-2xl">Generating Map...</div>;
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

  const { tutorialStep, setTutorialStep, tutorialStepRef, selfReady, showStep5Tooltip, setShowStep5Tooltip, markSelfReady } = useTutorial({ socket, role });
  useGameTimer({ socket, role, setRole, tutorialStepRef, isWinRef, isLoseRef, workspaceRef, availableQuotaRef, setIsLose, setLoseReason, setShowSwapAlert, setBlocksLeft, setExecutionError, setDungeonTimeLeft, setSwapTimeLeft });
  useGameSync({ socket, role, setRole, workspaceRef, availableQuotaRef, setPlayerX, setPlayerY, setDirection, setBlocksLeft, setAvailableQuota, setIsWin, setIsLose, setLoseReason, setDungeonTimeLeft, setSwapTimeLeft, setShowSwapAlert, setSelectedMapIndex, setExecutionError, setPanelKey });
  const { runProgram, resetGameToNewStart, emitGameState } = useGameMovement({ socket, role, isHost, username, workspaceRef, availableQuotaRef, mapData, playerX, playerY, direction, blocksLeft, availableQuota, dungeonTimeLeft, swapTimeLeft, showSwapAlert, isWin, isLose, loseReason, executionError, maxBlocks: MAX_BLOCKS, setPlayerX, setPlayerY, setDirection, setIsWin, setIsLose, setLoseReason, setBlocksLeft, setAvailableQuota, setExecutionError, setDungeonTimeLeft, setSwapTimeLeft, setPanelKey });

  const prevMapDataRef = useRef(mapData);
  useEffect(() => { if (prevMapDataRef.current !== mapData) { prevMapDataRef.current = mapData; resetGameToNewStart(); } }, [mapData, resetGameToNewStart]);

  const handleWorkspaceReady = useCallback((ws: Blockly.WorkspaceSvg) => {
    workspaceRef.current = ws;
    ws.options.maxBlocks = availableQuotaRef.current;
    ws.addChangeListener((event) => {
      if (roleRef.current === "driver") {
        if (event.type === Blockly.Events.BLOCK_CREATE || event.type === Blockly.Events.BLOCK_DELETE || event.type === Blockly.Events.BLOCK_MOVE || event.type === Blockly.Events.BLOCK_CHANGE) {
          const used = ws.getAllBlocks(false).length;
          const newBlocksLeft = Math.max(0, availableQuotaRef.current - used);
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
  }, [role, socket]);

  const formatTime = (seconds: number) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m}:${s.toString().padStart(2, "0")}`; };
  const BOUNDARY_WALLS = WALLS.filter((wall) => wall.x === 0 || wall.x === 14 || wall.y === 0 || wall.y === 14);
  const handleScreenClick = () => { if (executionError && role === "driver") { setExecutionError(null); emitGameState({ executionError: null }); } };

  return (
    <div
      className="w-full h-screen bg-cover bg-center flex flex-col font-pixel cursor-default relative overflow-hidden"
      style={{ backgroundImage: "url('/ui/ingame.png')" }}
      onClick={handleScreenClick}
    >
      <TopRightMenu />

      {/* Tutorial Overlay */}
      {tutorialStep <= 5 && (
        <div className="fixed inset-0 z-[100] bg-black/85 pointer-events-auto backdrop-blur-sm transition-opacity duration-300" />
      )}

      {/* Step 5 Tooltip */}
      {showStep5Tooltip && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-4">
          <TutorialCard title="⚠ TIME WARNING" titleColor="#dc2626" titleBorder="#991b1b" buttonText="GOT IT" onNext={() => setShowStep5Tooltip(false)}>
            <p>You have <strong className="text-red-700 text-xl font-black">5 minutes</strong> to win.</p>
            <p className="mt-3">Every 2 minutes, your <Badge color="bg-orange-100 text-orange-800 border-orange-800">ROLES WILL SWAP</Badge>!</p>
          </TutorialCard>
        </div>
      )}

      {/* Tutorial Modals — Positioned contextually */}
      {tutorialStep <= 5 && (
        <div className="fixed inset-0 z-[110] flex pointer-events-none font-pixel p-4 md:p-8">

          {/* Step 0: Waiting for partner */}
          {tutorialStep === 0 && (
            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-95 duration-300">
              <TutorialCard title="WAITING" buttonText="WAITING..." onNext={() => {}} disabled={true}>
                <p>You have already completed the tutorial.</p>
                <p className="mt-4 text-[#8b6840] bg-[#f5e6c8] p-3 rounded-lg border-2 border-[#b8944f]/30">Waiting for your partner to finish reading...</p>
              </TutorialCard>
            </div>
          )}

          {/* Step 1: Welcome (Centered) */}
          {tutorialStep === 1 && (
            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-95 duration-300">
              <TutorialCard title="WELCOME!" onNext={() => setTutorialStep(2)}>
                {role === "driver" ? (
                  <>
                    <p>You are the <Badge color="bg-blue-100 text-blue-800 border-blue-800">DRIVER 🚙</Badge></p>
                    <p className="mt-4">You can see the <Badge color="bg-green-100 text-green-800 border-green-800">Goal</Badge> and <Badge color="bg-red-100 text-red-800 border-red-800">Traps</Badge>, but you <span className="text-red-600 font-black">CANNOT</span> see the walls!</p>
                    <p className="mt-4 text-[#8b6840] bg-[#f5e6c8] p-3 rounded-lg border-2 border-[#b8944f]/30">Your partner (Navigator) sees the walls.</p>
                  </>
                ) : (
                  <>
                    <p>You are the <Badge color="bg-purple-100 text-purple-800 border-purple-800">NAVIGATOR 🗺️</Badge></p>
                    <p className="mt-4">You can see the <Badge color="bg-amber-100 text-amber-900 border-amber-900">Walls</Badge>, but you <span className="text-red-600 font-black">CANNOT</span> see the traps or goal!</p>
                    <p className="mt-4 text-[#8b6840] bg-[#f5e6c8] p-3 rounded-lg border-2 border-[#b8944f]/30">Your partner (Driver) sees the traps.</p>
                  </>
                )}
                <p className="mt-5 text-[#ea580c] font-black text-xl">Work together to survive!</p>
              </TutorialCard>
            </div>
          )}

          {/* Step 2: Map & Fog (Right of the map) */}
          {tutorialStep === 2 && (
            <div className="absolute top-1/2 -translate-y-1/2 right-[2%] lg:right-[8%] xl:right-[15%] animate-in fade-in slide-in-from-right-8 duration-300">
              <TutorialCard title="THE MAP & FOG" titleColor="#2B6CB0" titleBorder="#1A365D" buttonText="GOT IT ➔" onNext={() => setTutorialStep(3)}>
                {role === "driver" ? (
                  <p>This is the map. What you see is <strong className="text-red-700">only half the truth.</strong><br/><br/>Do not move until you <Badge color="bg-yellow-100 text-yellow-900 border-yellow-700">ask your partner</Badge> if the path is safe!</p>
                ) : (
                  <p>Notice the <Badge color="bg-gray-800 text-gray-200 border-gray-600">Dark Fog</Badge>? It moves when the player moves.<br/><br/>You must <strong className="text-purple-800 underline">guide your partner</strong> through the darkness!</p>
                )}
              </TutorialCard>
            </div>
          )}

          {/* Step 3: Traps & Chat (Above the chat box) */}
          {tutorialStep === 3 && (
            <div className="absolute bottom-[20%] lg:bottom-[30%] right-[2%] lg:right-[8%] xl:right-[15%] animate-in fade-in slide-in-from-right-8 duration-300">
              <TutorialCard title="TRAPS & CHAT" titleColor="#16a34a" titleBorder="#14532d" buttonText="NEXT ➔" onNext={() => setTutorialStep(4)}>
                <p className="mb-4">Use the <Badge color="bg-white text-blue-700 border-gray-300">chat</Badge> below to warn your partner!</p>

                <div className="w-full text-left space-y-3 bg-white/40 p-4 rounded-xl border-2 border-[#b8944f]/30">
                  <p className="font-black text-[#5c2e0b] uppercase tracking-wider text-center border-b-2 border-[#b8944f]/30 pb-2 mb-3">Trap Types:</p>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">🪤</span>
                    <p><strong className="text-red-700">Trap</strong> — Instant death! Avoid at all costs.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">🪨</span>
                    <p><strong className="text-[#5c2e0b]">Rock</strong> — Blocks your path. Bounces you back.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">🔺</span>
                    <p><strong className="text-orange-700">Spike</strong> — Bounces you 2 tiles back. Wastes blocks!</p>
                  </div>
                </div>
              </TutorialCard>
            </div>
          )}

          {/* Step 4: Programming (Left of the workspace) */}
          {tutorialStep === 4 && (
            <div className="absolute top-1/2 -translate-y-1/2 left-[2%] lg:left-[5%] xl:left-[10%] animate-in fade-in slide-in-from-left-8 duration-300">
              <TutorialCard title="PROGRAMMING" titleColor="#DB5C00" titleBorder="#7c2d12" buttonText={selfReady ? "WAITING..." : "READY ✓"} onNext={markSelfReady} disabled={selfReady}>
                <p>Drag blocks to move the character.</p>
                <p className="mt-4"><Badge color="bg-red-100 text-red-800 border-red-800">WARNING</Badge></p>
                <p className="mt-2">You only have <strong className="text-red-600 text-2xl font-black mx-1">{MAX_BLOCKS}</strong> blocks per game.<br/>Use them wisely!</p>
                <p className="mt-6 text-[#8b6840] text-sm">Click READY when you understand.</p>
              </TutorialCard>
            </div>
          )}

          {/* Step 5: Time to Swap (Top Center) */}
          {tutorialStep === 5 && (
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-top-8 duration-300">
              <TutorialCard title="TIME TO SWAP" titleColor="#eab308" titleBorder="#a16207" buttonText="GOT IT ➔" onNext={() => setTutorialStep(99)}>
                <p>Watch the <Badge color="bg-green-100 text-green-800 border-green-700">Green Bar</Badge> at the top!</p>
                <p className="mt-4">When it runs out, you will <Badge color="bg-orange-100 text-orange-800 border-orange-800">Swap Roles</Badge> with your partner.</p>
                <p className="mt-4">Also watch the <Badge color="bg-red-100 text-red-700 border-red-400">Dungeon Time</Badge>.<br/>If it reaches 0, you lose!</p>
              </TutorialCard>
            </div>
          )}
        </div>
      )}

      {/* Game Layout — fit screen */}
      <div className="w-full max-w-[1600px] mx-auto flex flex-col flex-1 p-2 md:p-3 lg:p-4 gap-2 md:gap-3 relative overflow-hidden">
        <div className={`shrink-0 transition-all duration-300 ${tutorialStep === 5 ? 'relative z-[105] ring-4 ring-white/60 shadow-[0_0_30px_rgba(255,255,255,0.4)] rounded-xl pointer-events-none bg-black/50' : ''}`}>
          <GameHeader
            role={role === "driver" ? "DRIVER" : "NAVIGATOR"}
            dungeonTime={formatTime(dungeonTimeLeft)}
            swapTime={formatTime(swapTimeLeft)}
            swapProgress={(swapTimeLeft / 120) * 100}
          />
        </div>

        <div className="flex flex-1 gap-2 md:gap-4 w-full items-stretch min-h-0">
          <div className="flex-[6] min-w-0 flex flex-col gap-2 md:gap-3 min-h-0">
            <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${tutorialStep === 2 ? 'relative z-[105] ring-4 ring-white/60 shadow-[0_0_30px_rgba(255,255,255,0.4)] rounded-[20px] pointer-events-none' : ''}`}>
              <GameBoard
                playerX={playerX}
                playerY={playerY}
                direction={direction}
                walls={role === "driver" ? BOUNDARY_WALLS : WALLS}
                traps={mapData.traps}
                rocks={mapData.rocks}
                spikes={mapData.spikes}
                goal={GOAL}
                role={role || "driver"}
              />
            </div>
            <div className={`shrink-0 transition-all duration-300 ${tutorialStep === 3 ? 'relative z-[105] ring-4 ring-white/60 shadow-[0_0_30px_rgba(255,255,255,0.4)] rounded-xl pointer-events-none' : ''}`}>
              <ChatBox />
            </div>
          </div>

          <div className={`flex-[4] min-w-0 flex flex-col min-h-0 transition-all duration-300 ${tutorialStep === 4 ? 'relative z-[105] ring-4 ring-white/60 shadow-[0_0_30px_rgba(255,255,255,0.4)] rounded-2xl pointer-events-none' : ''}`}>
            <BlockCodePanel
              key={panelKey}
              blocksLeft={blocksLeft}
              onReady={handleWorkspaceReady}
              onRun={role === "driver" ? runProgram : undefined}
              readOnly={role !== "driver"}
              executionError={executionError}
            />
          </div>
        </div>
      </div>

      {/* Win overlay */}
      {isWin && (() => {
        const blocksUsed = MAX_BLOCKS - blocksLeft;
        const timeUsed = 300 - dungeonTimeLeft;
        const star2 = blocksUsed < 40;
        const star3 = timeUsed < 240;
        return (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[120] backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative inline-block max-w-[90vw]">
              <img src="/ui/win_bg.png" alt="Victory Background" className="w-[800px] max-w-full h-auto drop-shadow-[0_0_30px_rgba(217,119,6,0.6)]" />
              <div className="absolute inset-0 flex flex-col items-center">
                <h2 className="absolute top-[10%] text-5xl md:text-7xl font-pixel font-bold text-white tracking-widest" style={{ textShadow: "-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, 0 6px 0px rgba(0,0,0,0.8)" }}>VICTORY</h2>
                <div className="absolute top-[32%] flex flex-col items-center justify-center w-full">
                  <div className="flex items-end justify-center gap-6 md:gap-10">
                    <div className="flex flex-col items-center">
                      <span className="text-6xl md:text-7xl drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)]">⭐</span>
                      <span className="text-[#fde68a] text-sm md:text-base font-bold mt-2 tracking-wider" style={{ textShadow: "1px 1px 0 #000" }}>Stage Cleared</span>
                    </div>
                    <div className="flex flex-col items-center mb-6">
                      <span className={`text-7xl md:text-8xl drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] ${star2 ? '' : 'opacity-30 grayscale'}`}>⭐</span>
                      <span className={`text-sm md:text-base font-bold mt-2 tracking-wider ${star2 ? 'text-[#fde68a]' : 'text-gray-400'}`} style={{ textShadow: "1px 1px 0 #000" }}>{"< 40 Blocks"}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={`text-6xl md:text-7xl drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] ${star3 ? '' : 'opacity-30 grayscale'}`}>⭐</span>
                      <span className={`text-sm md:text-base font-bold mt-2 tracking-wider ${star3 ? 'text-[#fde68a]' : 'text-gray-400'}`} style={{ textShadow: "1px 1px 0 #000" }}>{"< 4 Minutes"}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[20%] flex gap-4 md:gap-6 w-full justify-center px-8">
                  <button className="bg-[#78716c] border-[3px] border-[#44403c] text-white font-pixel font-bold py-2 md:py-3 px-6 md:px-10 text-xl md:text-2xl rounded-full hover:bg-[#57534e] active:scale-95 transition-all shadow-[0_4px_0_#44403c] active:shadow-none active:translate-y-1" onClick={leaveStage}>QUIT</button>
                  {isHost ? (
                    <>
                      <button className="bg-transparent border-[3px] border-[#B28B29] text-white font-pixel font-bold py-2 md:py-3 px-6 md:px-8 text-xl md:text-2xl rounded-full hover:bg-white/20 active:scale-95 transition-all shadow-md" onClick={resetGameToNewStart}>RESTART</button>
                      <button className="bg-[#ea580c] border-[3px] border-[#c2410c] text-white font-pixel font-bold py-2 md:py-3 px-6 md:px-10 text-xl md:text-2xl rounded-full hover:bg-[#c2410c] active:scale-95 transition-all shadow-[0_4px_0_#9a3412] active:shadow-none active:translate-y-1" onClick={startGame}>NEXT</button>
                    </>
                  ) : (
                    <div className="bg-[#ea580c]/50 border-[3px] border-[#c2410c] text-white font-pixel font-bold py-2 md:py-3 px-6 md:px-10 text-xl md:text-2xl rounded-full shadow-md flex items-center">WAITING FOR HOST...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Lose overlay */}
      {isLose && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[120] backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative inline-block max-w-[90vw] grayscale-[0.2]">
            <img src="/ui/win_bg.png" alt="Defeat Background" className="w-[800px] max-w-full h-auto drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]" />
            <div className="absolute inset-0 flex flex-col items-center">
              <h2 className="absolute top-[10%] text-5xl md:text-7xl font-pixel font-bold text-red-500 tracking-widest" style={{ textShadow: "-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, 0 6px 0px rgba(0,0,0,0.8)" }}>DEFEAT</h2>
              <div className="absolute top-[40%] flex flex-col items-center justify-center w-full px-12">
                <p className="text-3xl md:text-4xl font-pixel font-bold text-white text-center leading-relaxed" style={{ textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000" }}>
                  {loseReason === "time" ? "TIME'S UP!" : "OUT OF BLOCKS!"}
                </p>
                <p className="text-xl md:text-2xl font-pixel text-gray-300 mt-4 text-center" style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
                  {loseReason === "time" ? "You ran out of dungeon time." : "You have no more blocks to run."}
                </p>
              </div>
              <div className="absolute bottom-[20%] flex gap-4 md:gap-8 w-full justify-center px-8">
                <button className="bg-[#78716c] border-[3px] border-[#44403c] text-white font-pixel font-bold py-2 md:py-3 px-6 md:px-10 text-xl md:text-2xl rounded-full hover:bg-[#57534e] active:scale-95 transition-all shadow-[0_4px_0_#44403c] active:shadow-none active:translate-y-1" onClick={leaveStage}>QUIT</button>
                {isHost ? (
                  <button className="bg-[#ea580c] border-[3px] border-[#c2410c] text-white font-pixel font-bold py-2 md:py-3 px-8 md:px-12 text-xl md:text-2xl rounded-full hover:bg-[#c2410c] active:scale-95 transition-all shadow-[0_4px_0_#9a3412] active:shadow-none active:translate-y-1" onClick={resetGameToNewStart}>RETRY</button>
                ) : (
                  <div className="bg-[#dc2626]/50 border-[3px] border-[#991b1b] text-white font-pixel font-bold py-2 md:py-3 px-6 md:px-10 text-xl md:text-2xl rounded-full shadow-md flex items-center">WAITING FOR HOST...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Swap Alert */}
      {showSwapAlert && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-[130]">
          <div className="w-full h-48 md:h-56 bg-[#78350f]/80 border-y-4 md:border-y-6 border-[#f59e0b] flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-pixel font-bold text-white tracking-widest text-center mb-2" style={{ textShadow: "4px 4px 0px #b91c1c, -2px -2px 0px #b91c1c, 2px -2px 0px #b91c1c, -2px 2px 0px #b91c1c" }}>ROLE SWAP !!</h2>
            <p className="text-2xl md:text-3xl lg:text-4xl font-pixel font-bold text-white tracking-widest text-center uppercase" style={{ textShadow: "3px 3px 0px #000" }}>
              NOW YOU A {role === "driver" ? "NAVIGATOR" : "DRIVER"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
