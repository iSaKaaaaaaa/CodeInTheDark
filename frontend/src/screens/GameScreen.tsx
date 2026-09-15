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

export default function GameScreen() {
  const { username, socket, role, setRole, mapData: serverMapData, startGame, setSelectedMapIndex, dungeonTimeLeft, setDungeonTimeLeft, swapTimeLeft, setSwapTimeLeft, players, leaveStage } = useSocketStore();
  const isHost = players.length > 0 ? players[0].username === username : role === 'driver';

  // --- Map Data ---
  if (!serverMapData) {
    return <div className="min-h-screen flex items-center justify-center text-white bg-black font-pixel text-2xl">Generating Map...</div>;
  }
  const mapData = serverMapData;
  const { walls: WALLS, start: START, goal: GOAL } = mapData;

  // --- Game State ---
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

  useEffect(() => {
    isWinRef.current = isWin;
    isLoseRef.current = isLose;
    roleRef.current = role;
  }, [isWin, isLose, role]);

  useEffect(() => {
    availableQuotaRef.current = availableQuota;
    if (workspaceRef.current) {
      workspaceRef.current.options.maxBlocks = availableQuota;
    }
  }, [availableQuota]);


  // --- Tutorial ---
  const {
    tutorialStep, setTutorialStep, tutorialStepRef,
    selfReady, showStep5Tooltip, setShowStep5Tooltip, markSelfReady,
  } = useTutorial({ socket, role });

  // --- Timer ---
  useGameTimer({
    socket, role, setRole, tutorialStepRef, isWinRef, isLoseRef,
    workspaceRef, availableQuotaRef,
    setIsLose, setLoseReason, setShowSwapAlert, setBlocksLeft,
    setExecutionError, setDungeonTimeLeft, setSwapTimeLeft,
  });

  // --- Sync ---
  useGameSync({
    socket, role, setRole, workspaceRef, availableQuotaRef,
    setPlayerX, setPlayerY, setDirection, setBlocksLeft, setAvailableQuota,
    setIsWin, setIsLose, setLoseReason, setDungeonTimeLeft, setSwapTimeLeft,
    setShowSwapAlert, setSelectedMapIndex, setExecutionError, setPanelKey,
  });

  // --- Movement ---
  const { runProgram, resetGameToNewStart, emitGameState } = useGameMovement({
    socket, role, isHost, username, workspaceRef, availableQuotaRef, mapData,
    playerX, playerY, direction, blocksLeft, availableQuota,
    dungeonTimeLeft, swapTimeLeft, showSwapAlert, isWin, isLose, loseReason,
    executionError, maxBlocks: MAX_BLOCKS,
    setPlayerX, setPlayerY, setDirection, setIsWin, setIsLose, setLoseReason,
    setBlocksLeft, setAvailableQuota, setExecutionError,
    setDungeonTimeLeft, setSwapTimeLeft, setPanelKey,
  });

  // --- Map change reset ---
  const prevMapDataRef = useRef(mapData);
  useEffect(() => {
    if (prevMapDataRef.current !== mapData) {
      prevMapDataRef.current = mapData;
      resetGameToNewStart();
    }
  }, [mapData, resetGameToNewStart]);

  // --- Workspace Ready ---
  const handleWorkspaceReady = useCallback(
    (ws: Blockly.WorkspaceSvg) => {
      workspaceRef.current = ws;
      ws.options.maxBlocks = availableQuotaRef.current;

      ws.addChangeListener((event) => {
        if (roleRef.current === "driver") {
          if (
            event.type === Blockly.Events.BLOCK_CREATE ||
            event.type === Blockly.Events.BLOCK_DELETE ||
            event.type === Blockly.Events.BLOCK_MOVE ||
            event.type === Blockly.Events.BLOCK_CHANGE
          ) {
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
    },
    [role, socket],
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const BOUNDARY_WALLS = WALLS.filter(
    (wall) => wall.x === 0 || wall.x === 14 || wall.y === 0 || wall.y === 14,
  );

  const handleScreenClick = () => {
    if (executionError && role === "driver") {
      setExecutionError(null);
      emitGameState({ executionError: null });
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center flex flex-col font-pixel cursor-default relative overflow-hidden"
      style={{ backgroundImage: "url('/ui/ingame.png')" }}
      onClick={handleScreenClick}
    >
      <TopRightMenu />

      {/* Tutorial Dark Overlay */}
      {tutorialStep <= 5 && (
        <div className="fixed inset-0 z-40 bg-black/80 pointer-events-auto backdrop-blur-sm transition-opacity duration-300" />
      )}

      {/* Step 5 Tooltip */}
      {showStep5Tooltip && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 bg-[#f4deb3] border-4 border-[#3d1f0f] rounded-xl p-4 shadow-[0_8px_0_#29150a] z-50 text-center max-w-sm font-pixel text-black animate-bounce">
          <h3 className="text-xl font-bold text-red-600">⚠️ TIME WARNING!</h3>
          <p className="text-sm font-semibold mt-2">You have 5 minutes to win.<br/>But every 2 minutes, <strong>YOUR ROLES WILL SWAP!</strong><br/>Be ready!</p>
          <button onClick={() => setShowStep5Tooltip(false)} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-8 h-8 font-bold border-2 border-black flex items-center justify-center hover:bg-red-500">X</button>
        </div>
      )}

      {/* Tutorial Overlay Modals */}
      {tutorialStep <= 5 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none font-pixel">
          {tutorialStep === 1 && (
            <div className="bg-[#3d1f0f] border-[6px] border-[#1a0b05] rounded-3xl p-2 shadow-[0_15px_0_rgba(0,0,0,0.8),0_25px_50px_rgba(0,0,0,0.9)] pointer-events-auto text-center animate-in zoom-in duration-300 max-w-lg mx-4">
              <div className="bg-[#f4deb3] border-[4px] border-[#5c2e16] rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#3d1f0f_1.5px,_transparent_1.5px)] bg-[size:12px_12px]" />
                <div className="relative z-10">
                  <h2 className="inline-block bg-[#ea580c] text-white border-[3px] border-[#7c2d12] shadow-[0_4px_0_#7c2d12] px-8 py-2 rounded-2xl text-4xl font-black mb-6 transform -rotate-1">WELCOME!</h2>
                  <div className="text-xl space-y-6 font-semibold text-gray-800 mt-2">
                    {role === "driver" ? (
                      <>
                        <p>You are the <span className="inline-block bg-blue-100 text-blue-800 border-2 border-blue-800 shadow-[0_3px_0_#1e40af] px-3 py-1 rounded-lg text-2xl font-bold ml-2">DRIVER 🚙</span></p>
                        <p className="leading-relaxed">You can see the <span className="text-green-800 bg-green-200 px-2 py-0.5 rounded-md border-b-2 border-green-800 font-bold mx-1 shadow-sm">Goal</span> and <span className="text-red-800 bg-red-200 px-2 py-0.5 rounded-md border-b-2 border-red-800 font-bold mx-1 shadow-sm">Traps</span>, but you <span className="inline-block text-white bg-red-600 px-3 py-1 rounded-md font-bold uppercase tracking-widest border-b-[3px] border-red-900 shadow-sm mx-1 animate-pulse">CANNOT</span> see the walls!</p>
                        <p className="text-lg text-gray-700 bg-white/60 p-3 rounded-xl border-dashed border-2 border-gray-400">Your partner (Navigator) sees the walls.</p>
                      </>
                    ) : (
                      <>
                        <p>You are the <span className="inline-block bg-purple-100 text-purple-800 border-2 border-purple-800 shadow-[0_3px_0_#6b21a8] px-3 py-1 rounded-lg text-2xl font-bold ml-2">NAVIGATOR 🗺️</span></p>
                        <p className="leading-relaxed">You can see the <span className="text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md border-b-2 border-amber-900 font-bold mx-1 shadow-sm">Walls</span>, but you <span className="inline-block text-white bg-red-600 px-3 py-1 rounded-md font-bold uppercase tracking-widest border-b-[3px] border-red-900 shadow-sm mx-1 animate-pulse">CANNOT</span> see the traps or the goal!</p>
                        <p className="text-lg text-gray-700 bg-white/60 p-3 rounded-xl border-dashed border-2 border-gray-400">Your partner (Driver) sees the traps.</p>
                      </>
                    )}
                    <p className="text-2xl text-[#ea580c] font-black mt-6 drop-shadow-sm">You must work together to survive!</p>
                  </div>
                  <button onClick={() => setTutorialStep(2)} className="mt-6 bg-[#ea580c] border-[3px] border-[#7c2d12] text-white font-bold py-3 px-10 text-2xl rounded-full hover:bg-[#c2410c] active:translate-y-1 active:shadow-none shadow-[0_5px_0_#7c2d12] transition-all">NEXT ➔</button>
                </div>
              </div>
            </div>
          )}

          {tutorialStep === 2 && (
            <div className="absolute top-1/2 -translate-y-1/2 right-[2%] lg:right-[8%] xl:right-[15%] bg-[#3d1f0f] border-[6px] border-[#1a0b05] rounded-3xl p-2 shadow-[0_15px_0_rgba(0,0,0,0.8),0_25px_50px_rgba(0,0,0,0.9)] pointer-events-auto text-center max-w-sm w-[90%] animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="bg-[#f4deb3] border-[4px] border-[#5c2e16] rounded-2xl p-6 relative overflow-hidden h-full flex flex-col items-center">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#3d1f0f_1.5px,_transparent_1.5px)] bg-[size:12px_12px]" />
                <div className="relative z-10 w-full">
                  <h3 className="inline-block bg-[#ea580c] text-white border-[3px] border-[#7c2d12] shadow-[0_4px_0_#7c2d12] px-6 py-2 rounded-xl text-xl font-black mb-6 transform rotate-1">THE MAP & FOG</h3>
                  <div className="text-lg mb-6 font-semibold text-gray-800">
                    {role === "driver" ? (
                      <p>This is the map. What you see is <span className="text-red-700 font-bold">only half the truth.</span><br/><br/>Do not move until you <span className="bg-yellow-200 text-yellow-900 px-2 rounded font-bold shadow-sm border border-yellow-400">ask your partner</span> if the path is safe!</p>
                    ) : (
                      <p>This is the map. Notice the <span className="inline-block bg-gray-800 text-gray-200 px-2 py-0.5 rounded shadow-[0_2px_0_black] font-bold mx-1 border border-gray-600">Dark Fog</span> ? It moves when the player moves.<br/><br/>You must <span className="text-purple-800 font-bold underline decoration-2 underline-offset-4">guide your partner</span> through the darkness!</p>
                    )}
                  </div>
                  <button onClick={() => setTutorialStep(3)} className="bg-[#ea580c] border-[3px] border-[#7c2d12] text-white font-bold py-2 px-8 text-xl rounded-full hover:bg-[#c2410c] active:translate-y-1 active:shadow-none shadow-[0_4px_0_#7c2d12] w-full max-w-[200px] transition-all">GOT IT ➔</button>
                </div>
              </div>
            </div>
          )}

          {tutorialStep === 3 && (
            <div className="absolute bottom-[10%] lg:bottom-[20%] right-[2%] lg:right-[8%] xl:right-[15%] bg-[#3d1f0f] border-[6px] border-[#1a0b05] rounded-3xl p-2 shadow-[0_15px_0_rgba(0,0,0,0.8),0_25px_50px_rgba(0,0,0,0.9)] pointer-events-auto text-center max-w-sm w-[90%] animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="bg-[#f4deb3] border-[4px] border-[#5c2e16] rounded-2xl p-6 relative overflow-hidden h-full flex flex-col items-center">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#3d1f0f_1.5px,_transparent_1.5px)] bg-[size:12px_12px]" />
                <div className="relative z-10 w-full">
                  <h3 className="inline-block bg-[#16a34a] text-white border-[3px] border-[#14532d] shadow-[0_4px_0_#14532d] px-6 py-2 rounded-xl text-xl font-black mb-6 transform -rotate-1">COMMUNICATION</h3>
                  <p className="text-lg font-semibold mb-6 text-gray-800">This is how you survive!<br/><br/>Use the <span className="bg-white px-2 py-1 rounded border-2 border-gray-300 shadow-sm mx-1 font-bold text-blue-700">chat</span> to tell your partner what you see.<br/><br/><span className="inline-block mt-2 bg-white/70 text-gray-800 italic border-l-[6px] border-[#ea580c] p-3 text-left w-full shadow-sm rounded-r-lg font-medium">Example:<br/>"Watch out for a trap at C4!"<br/>"Wall ahead!"</span></p>
                  <button onClick={() => setTutorialStep(4)} className="bg-[#ea580c] border-[3px] border-[#7c2d12] text-white font-bold py-2 px-8 text-xl rounded-full hover:bg-[#c2410c] active:translate-y-1 active:shadow-none shadow-[0_4px_0_#7c2d12] w-full max-w-[200px] transition-all">NEXT ➔</button>
                </div>
              </div>
            </div>
          )}

          {tutorialStep === 4 && (
            <div className="absolute top-1/2 -translate-y-1/2 left-[2%] lg:left-[5%] xl:left-[10%] bg-[#3d1f0f] border-[6px] border-[#1a0b05] rounded-3xl p-2 shadow-[0_15px_0_rgba(0,0,0,0.8),0_25px_50px_rgba(0,0,0,0.9)] pointer-events-auto text-center max-w-sm w-[90%] animate-in fade-in slide-in-from-left-8 duration-300">
              <div className="bg-[#f4deb3] border-[4px] border-[#5c2e16] rounded-2xl p-6 relative overflow-hidden h-full flex flex-col items-center">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#3d1f0f_1.5px,_transparent_1.5px)] bg-[size:12px_12px]" />
                <div className="relative z-10 w-full">
                  <h3 className="inline-block bg-[#DB5C00] text-white border-[3px] border-[#7c2d12] shadow-[0_4px_0_#7c2d12] px-6 py-2 rounded-xl text-xl font-black mb-6 transform rotate-1">PROGRAMMING</h3>
                  <p className="text-lg font-semibold mb-6 text-gray-800">Drag blocks here to move the character.<br/><br/><span className="inline-block bg-red-100 text-red-800 border-2 border-red-800 rounded-md px-3 py-1 mb-2 font-black shadow-[0_3px_0_#991b1b]">WARNING</span><br/>You only have <span className="text-3xl font-black text-red-600 drop-shadow-sm">50</span> blocks per game. Use them wisely!<br/><br/>Click <span className="font-black text-green-700 bg-green-100 px-2 rounded border border-green-700">READY</span> when you understand.</p>
                  <button
                    onClick={markSelfReady}
                    disabled={selfReady}
                    className={`py-3 px-8 text-2xl rounded-full font-black border-[3px] transition-all w-full ${selfReady ? 'bg-gray-400 border-gray-600 shadow-none translate-y-1 text-gray-800' : 'bg-[#16a34a] border-[#14532d] text-white hover:bg-[#15803d] active:translate-y-1 active:shadow-none shadow-[0_5px_0_#14532d]'}`}
                  >
                    {selfReady ? "WAITING..." : "READY ✓"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {tutorialStep === 5 && (
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 bg-[#3d1f0f] border-[6px] border-[#1a0b05] rounded-3xl p-2 shadow-[0_15px_0_rgba(0,0,0,0.8),0_25px_50px_rgba(0,0,0,0.9)] pointer-events-auto text-center max-w-sm w-[90%] animate-in fade-in slide-in-from-top-8 duration-300">
              <div className="bg-[#f4deb3] border-[4px] border-[#5c2e16] rounded-2xl p-6 relative overflow-hidden h-full flex flex-col items-center">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#3d1f0f_1.5px,_transparent_1.5px)] bg-[size:12px_12px]" />
                <div className="relative z-10 w-full">
                  <h3 className="inline-block bg-[#eab308] text-[#422006] border-[3px] border-[#a16207] shadow-[0_4px_0_#a16207] px-6 py-2 rounded-xl text-xl font-black mb-6 transform -rotate-1">TIME TO SWAP</h3>
                  <p className="text-lg font-semibold mb-6 text-gray-800">Keep an eye on the <span className="text-green-800 font-bold bg-green-200 px-2 py-0.5 rounded border border-green-400 shadow-sm">Green Bar</span> at the top!<br/><br/>When it runs out, you will <span className="bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded border border-orange-800 shadow-sm">Swap Roles</span> with your partner.<br/><br/>Also watch the <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded border border-red-300 shadow-sm">Dungeon Time</span>. If it reaches 0, you lose the game!</p>
                  <button onClick={() => setTutorialStep(99)} className="bg-[#ea580c] border-[3px] border-[#7c2d12] text-white font-bold py-2 px-8 text-xl rounded-full hover:bg-[#c2410c] active:translate-y-1 active:shadow-none shadow-[0_4px_0_#7c2d12] w-full max-w-[200px] transition-all">GOT IT ➔</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="w-full max-w-[1600px] mx-auto flex flex-col flex-1 p-4 md:p-6 gap-4 relative">
        <div className={`transition-all duration-300 ${tutorialStep === 5 ? 'relative z-50 ring-[6px] ring-white/60 shadow-[0_0_40px_rgba(255,255,255,0.4)] rounded-xl pointer-events-none' : ''}`}>
          <GameHeader
            role={role === "driver" ? "DRIVER" : "NAVIGATOR"}
            dungeonTime={formatTime(dungeonTimeLeft)}
            swapTime={formatTime(swapTimeLeft)}
            swapProgress={(swapTimeLeft / 120) * 100}
          />
        </div>

        <div className="flex flex-1 gap-6 w-full items-stretch">
          <div className="flex-[6] min-w-0 flex flex-col gap-4">
            <div className={`flex-1 flex flex-col transition-all duration-300 ${tutorialStep === 2 ? 'relative z-50 ring-[6px] ring-white/60 shadow-[0_0_40px_rgba(255,255,255,0.4)] rounded-[20px] pointer-events-none' : ''}`}>
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
            <div className={`transition-all duration-300 ${tutorialStep === 3 ? 'relative z-50 ring-[6px] ring-white/60 shadow-[0_0_40px_rgba(255,255,255,0.4)] rounded-xl pointer-events-none' : ''}`}>
              <ChatBox />
            </div>
          </div>

          <div className={`flex-[4] min-w-0 flex flex-col transition-all duration-300 ${tutorialStep === 4 ? 'relative z-50 ring-[6px] ring-white/60 shadow-[0_0_40px_rgba(255,255,255,0.4)] rounded-2xl pointer-events-none' : ''}`}>
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

      {isWin && (() => {
        const blocksUsed = MAX_BLOCKS - blocksLeft;
        const timeUsed = 300 - dungeonTimeLeft;
        const star2 = blocksUsed < 40;
        const star3 = timeUsed < 240;

        return (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative inline-block max-w-[90vw]">
              <img src="/ui/win_bg.png" alt="Victory Background" className="w-[800px] max-w-full h-auto drop-shadow-[0_0_30px_rgba(217,119,6,0.6)]" />
              <div className="absolute inset-0 flex flex-col items-center">
                <h2 className="absolute top-[10%] text-5xl md:text-7xl font-pixel font-bold text-white tracking-widest" style={{ textShadow: "-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, 0 6px 0px rgba(0,0,0,0.8)" }}>VICTORY</h2>
                <div className="absolute top-[35%] flex items-end justify-center gap-6 md:gap-10">
                  <span className="text-6xl md:text-7xl drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)]" title="Stage Cleared">⭐</span>
                  <span className={`text-7xl md:text-8xl drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] mb-6 ${star2 ? '' : 'opacity-30 grayscale'}`} title="Used less than 40 blocks">⭐</span>
                  <span className={`text-6xl md:text-7xl drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] ${star3 ? '' : 'opacity-30 grayscale'}`} title="Finished in under 4 minutes">⭐</span>
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

      {isLose && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-300">
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

      {showSwapAlert && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="w-full h-64 bg-[#78350f]/80 border-y-8 border-[#f59e0b] flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm">
            <h2 className="text-7xl md:text-8xl font-pixel font-bold text-white tracking-widest text-center mb-4" style={{ textShadow: "4px 4px 0px #b91c1c, -2px -2px 0px #b91c1c, 2px -2px 0px #b91c1c, -2px 2px 0px #b91c1c, 2px 2px 0px #b91c1c" }}>ROLE SWAP !!</h2>
            <p className="text-4xl md:text-5xl font-pixel font-bold text-white tracking-widest text-center uppercase" style={{ textShadow: "3px 3px 0px #000" }}>
              NOW YOU A {role === "driver" ? "NAVIGATOR" : "DRIVER"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
