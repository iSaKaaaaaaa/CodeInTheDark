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

/* ─── Reusable parchment tutorial card (ลดขนาดฟอนต์ลง 15-20% ให้สบายตา) ─── */
function TutorialCard({
  title,
  titleColor = '#ea580c',
  titleBorder = '#7c2d12',
  children,
  buttonText = 'ถัดไป ➔',
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
    <div className={`pointer-events-auto max-w-[490px] w-[92vw] mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-xl ${className}`}>
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
        <div className="relative z-10 flex flex-col items-center gap-2.5 sm:gap-3.5 font-pixel">
          {/* Title badge */}
          <span className="inline-block font-bold text-white text-xl sm:text-2xl px-5 py-1.5 rounded-xl border-2 uppercase tracking-wider font-thai" style={{
            background: titleColor, borderColor: titleBorder,
            boxShadow: `0 3px 0 ${titleBorder}`, textShadow: '1.5px 1px 0 #000',
          }}>
            {title}
          </span>
          {/* Content */}
          <div
            className="text-sm sm:text-base md:text-lg font-semibold text-[#382503] leading-relaxed text-center w-full font-thai tracking-normal"
            style={{ textShadow: "0.5px 0.5px 0px rgba(255,255,255,0.6)" }}
          >
            {children}
          </div>
          {/* Button */}
          <button
            onClick={onNext}
            disabled={disabled}
            className={`mt-1 font-bold text-lg sm:text-xl px-8 py-2 rounded-xl border-b-[4px] border-r-[4px] border-t-2 border-l-2 uppercase tracking-wider transition-all font-thai ${
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

/* ─── Inline badge helper (ลดขนาดฟอนต์ลง 15-20%) ─── */
function Badge({ children, color = 'bg-blue-100 text-blue-800 border-blue-800' }: { children: React.ReactNode; color?: string }) {
  return <span className={`inline-block ${color} border-2 px-2 py-0.5 rounded-md font-bold shadow-sm text-sm sm:text-base uppercase tracking-wide font-pixel`}>{children}</span>;
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
    onTutorialBlockDragged,
    onTutorialRunPressed,
    onTutorialChatSent,
  } = useTutorial({ socket, role });

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

  // เมื่อจบโหมดฝึกสอน (tutorialStep เปลี่ยนเป็น 99 จากโหมดทดลองเล่น) ให้รีเซ็ตตำแหน่งตัวละคร เวลา และจำนวนบล็อกกลับเป็นค่าเริ่มต้นเต็ม 100%
  const prevTutorialStepRef = useRef(tutorialStep);
  useEffect(() => {
    const prev = prevTutorialStepRef.current;
    prevTutorialStepRef.current = tutorialStep;
    if (prev !== 99 && tutorialStep === 99 && (prev === 12 || prev === 22)) {
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
          // ตอนฝึกสอน (tutorialStep !== 99) ไม่หักลดจำนวนบล็อกที่เหลือ
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

  // สถานะความเร่งด่วนของเวลาเพื่อแสดงเอฟเฟกต์ภาพบนหน้าจอ (ทำงานเฉพาะตอนเริ่มเกมจริงแล้ว)
  const isPlaying = tutorialStep === 99 && !isWin && !isLose;
  const isStageWarning = isPlaying && dungeonTimeLeft <= 60 && dungeonTimeLeft > 30;
  const isStageCritical = isPlaying && dungeonTimeLeft <= 30 && dungeonTimeLeft > 10;
  const isStageFinal = isPlaying && dungeonTimeLeft <= 10 && dungeonTimeLeft > 0;
  const isSwapImminent = isPlaying && swapTimeLeft <= 10 && swapTimeLeft > 0;

  return (
    <div
      className="w-full h-screen bg-cover bg-center flex flex-col font-pixel cursor-default relative overflow-x-hidden overflow-y-auto"
      style={{ backgroundImage: "url('/ui/ingame.png')" }}
      onClick={handleScreenClick}
    >
      {/* Tutorial Overlay — blackout เฉพาะขั้นตอน briefing (0, 1, 2, 3) แต่ในโหมดลงมือทำ (10, 11, 12, 20, 22) ให้เปิดโล่ง ไม่บังกระดาน */}
      {(tutorialStep === 0 || tutorialStep === 1 || tutorialStep === 2 || tutorialStep === 3) && (
        <div className="fixed inset-0 z-[100] bg-black/75 pointer-events-auto backdrop-blur-sm transition-opacity duration-300" />
      )}

      {/* Tutorial Modals — Positioned contextually */}
      {(tutorialStep <= 5 || (tutorialStep >= 10 && tutorialStep <= 12) || (tutorialStep >= 20 && tutorialStep <= 22)) && (
        <div className="fixed inset-0 z-[110] flex pointer-events-none font-pixel p-4 md:p-8">

          {/* Step 0: Waiting for partner */}
          {tutorialStep === 0 && (
            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-95 duration-300">
              <TutorialCard title="รอเพื่อนร่วมทีม" buttonText="กำลังรอ..." onNext={() => {}} disabled={true}>
                <p>คุณอ่านคำแนะนำเบื้องต้นเรียบร้อยแล้ว</p>
                <p className="mt-3 text-[#8b6840] bg-[#f5e6c8] p-2.5 rounded-lg border-2 border-[#b8944f]/30 text-sm sm:text-base">กำลังรอเพื่อนร่วมทีมอ่านคำแนะนำเพื่อเริ่มพร้อมกัน...</p>
              </TutorialCard>
            </div>
          )}

          {/* Step 1: Welcome & Role Introduction */}
          {tutorialStep === 1 && (
            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-95 duration-300">
              <TutorialCard title="ยินดีต้อนรับ!" buttonText="ถัดไป ➔" onNext={() => setTutorialStep(2)}>
                {role === "driver" ? (
                  <>
                    <p className="text-lg sm:text-xl">คุณคือ <Badge color="bg-blue-100 text-blue-800 border-blue-800">DRIVER (คนขับ)</Badge></p>
                    <p className="mt-3 text-base sm:text-lg">คุณมีสิทธิ์<strong className="text-orange-700 mx-1">ลากบล็อกสั่งเดิน</strong> มองเห็นกับดักและเป้าหมาย แต่... <strong className="text-red-600">มองไม่เห็นกำแพง!</strong></p>
                    <p className="mt-2.5 text-sm sm:text-base text-[#78350f] bg-[#f5e6c8] p-2.5 rounded-lg border-2 border-[#b8944f]/40">
                      เพื่อนของคุณ (Navigator) จะเป็นคนมองเห็นกำแพงและบอกทางให้
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg sm:text-xl">คุณคือ <Badge color="bg-sky-100 text-sky-800 border-sky-600">NAVIGATOR (ผู้นำทาง)</Badge></p>
                    <p className="mt-3 text-base sm:text-lg">คุณมองเห็น<strong className="text-sky-700 mx-1">กำแพงทั้งหมด</strong> แต่... <strong className="text-red-600">มองไม่เห็นกับดักและเป้าหมาย!</strong></p>
                    <p className="mt-2.5 text-sm sm:text-base text-[#78350f] bg-[#f5e6c8] p-2.5 rounded-lg border-2 border-[#b8944f]/40">
                      หน้าที่หลักของคุณคือดูแผนที่และพิมพ์บอกทาง Driver ในแชท!
                    </p>
                  </>
                )}
                <p className="mt-3 text-[#ea580c] font-bold text-lg sm:text-xl">สองคนต้องร่วมมือกันเพื่อพิชิตด่าน!</p>
              </TutorialCard>
            </div>
          )}

          {/* Step 2: Map Focus & Key Objective */}
          {tutorialStep === 2 && (
            <div className="absolute top-1/2 -translate-y-1/2 right-[2%] lg:right-[6%] xl:right-[10%] animate-in fade-in slide-in-from-right-8 duration-300">
              <TutorialCard title="แผนที่และภารกิจ" titleColor="#2B6CB0" titleBorder="#1A365D" buttonText="เข้าใจแล้ว ➔" onNext={() => setTutorialStep(3)}>
                {role === "driver" ? (
                  <div className="space-y-2.5">
                    <p className="text-lg sm:text-xl">สังเกต<Badge color="bg-green-100 text-green-800 border-green-800">ธงเป้าหมาย</Badge> ทางซ้าย!</p>
                    <div className="bg-red-50/90 border-2 border-red-400 p-2.5 rounded-xl text-left text-sm sm:text-base text-red-900 font-semibold space-y-1">
                      <p className="text-red-700 font-bold text-base sm:text-lg">สิ่งสำคัญที่สุด:</p>
                      <p>มีเพียง <strong className="text-red-700">DRIVER เท่านั้นที่เห็นธงเป้าหมาย</strong> (Navigator มองไม่เห็น!)</p>
                      <p>คุณต้องดูพิกัดตาราง (เช่น <span className="text-amber-800 font-bold">F8, J10</span>) แล้วพิมพ์บอกเพื่อนในแชทเสมอ!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-lg sm:text-xl">สังเกต<Badge color="bg-amber-100 text-amber-900 border-amber-900">กำแพงหิน</Badge> และหมอกความมืด (Fog)</p>
                    <div className="bg-amber-50/90 border-2 border-amber-400 p-2.5 rounded-xl text-left text-sm sm:text-base text-amber-950 font-semibold space-y-1">
                      <p className="text-amber-800 font-bold text-base sm:text-lg">สิ่งสำคัญที่สุด:</p>
                      <p>คุณมองเห็นกำแพงทั้งหมด แต่ <strong className="text-red-700">Driver ไม่เห็นกำแพงเลย!</strong></p>
                      <p>ถ้าคุณไม่บอกทาง เพื่อนจะเดินชนกำแพงและทำให้เสียบล็อกฟรี!</p>
                    </div>
                  </div>
                )}
              </TutorialCard>
            </div>
          )}

          {/* Step 3: 5-Second Digest / Transition Countdown */}
          {tutorialStep === 3 && (
            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-95 duration-300">
              <TutorialCard
                title="เตรียมพร้อม!"
                titleColor="#ea580c"
                titleBorder="#9a3412"
                buttonText="เริ่มทันที ➔"
                onNext={startInteractiveImmediately}
              >
                <div className="flex flex-col items-center gap-2">
                  <p className="text-lg sm:text-xl font-bold text-[#5c2e0b]">
                    เตรียมเข้าสู่โหมดทดลองเล่นใน
                  </p>
                  <span className="text-5xl sm:text-6xl font-bold text-red-600 drop-shadow-md animate-bounce font-pixel">
                    {countdown}
                  </span>
                  <p className="text-sm sm:text-base text-[#78350f]">
                    สำรวจแผนที่และเครื่องมือบนหน้าจอให้คุ้นเคย (ไม่เสียเวลาและบล็อกจริง)
                  </p>
                </div>
              </TutorialCard>
            </div>
          )}

          {/* ─── DRIVER INTERACTIVE STEPS ─── */}
          {/* Step 10 (Driver): Look at Goal & Type in Chat */}
          {tutorialStep === 10 && (
            <div className="absolute top-4 right-[2%] lg:right-[4%] max-w-[440px] animate-in fade-in slide-in-from-top-4 duration-300">
              <TutorialCard
                title="ภารกิจ 1/3 (DRIVER)"
                titleColor="#2563eb"
                titleBorder="#1e40af"
                buttonText={chatDone ? "✓ เรียบร้อย" : "พิมพ์บอกพิกัดในแชท..."}
                onNext={() => setTutorialStep(11)}
                disabled={!chatDone}
              >
                <p className="text-base sm:text-lg">
                  สังเกตพิกัด <strong className="text-green-700">ธงเป้าหมาย</strong> บนแผนที่ทางซ้าย แล้วพิมพ์บอก Navigator ใน <Badge color="bg-white text-blue-700 border-gray-300">Chat Box</Badge> ด้านล่างขวา!
                </p>
                <p className="mt-1.5 text-xs sm:text-sm text-[#8b6840]">
                  (ดูพิกัดตาราง <span className="text-red-700 font-bold">A-M, 1-13</span> แล้วพิมพ์ เช่น <strong className="text-amber-800">"ธงอยู่ที่..."</strong> แล้วกด Enter)
                </p>
              </TutorialCard>
            </div>
          )}

          {/* Step 11 (Driver): Drag a Move Block */}
          {tutorialStep === 11 && (
            <div className="absolute top-4 right-[2%] lg:right-[4%] max-w-[440px] animate-in fade-in slide-in-from-top-4 duration-300">
              <TutorialCard
                title="ภารกิจ 2/3 (DRIVER)"
                titleColor="#d97706"
                titleBorder="#b45309"
                buttonText={dragDone ? "✓ ลากสำเร็จ!" : "ลากบล็อกเดิน..."}
                onNext={() => setTutorialStep(12)}
                disabled={!dragDone}
              >
                <p className="text-base sm:text-lg">
                  ลากบล็อก <Badge color="bg-amber-100 text-amber-900 border-amber-900">Move</Badge> จากช่อง <strong>Toolbox</strong> (ซ้าย) มาวางใน <strong>Workspace</strong> (ขวา)
                </p>
                <p className="mt-1.5 text-xs sm:text-sm text-[#8b6840]">
                  ลองคลิกลากบล็อกมาวางตอนนี้เลย! (ช่วงฝึกซ้อมจะไม่หักจำนวนบล็อกจริง)
                </p>
              </TutorialCard>
            </div>
          )}

          {/* Step 12 (Driver): Press Run ▶ & Click READY */}
          {tutorialStep === 12 && (
            <div className="absolute top-4 right-[2%] lg:right-[4%] max-w-[440px] animate-in fade-in slide-in-from-top-4 duration-300">
              <TutorialCard
                title="ภารกิจ 3/3 (DRIVER)"
                titleColor="#16a34a"
                titleBorder="#14532d"
                buttonText={selfReady ? "กำลังรอเพื่อนร่วมทีม..." : (runDone ? "พร้อมเล่น (READY) ✓" : "กดปุ่ม RUN ▶")}
                onNext={markSelfReady}
                disabled={!runDone || selfReady}
              >
                <p className="text-base sm:text-lg">
                  กดปุ่ม <Badge color="bg-orange-100 text-orange-900 border-orange-900">RUN ▶</Badge> ด้านล่างขวา เพื่อสั่งตัวละครเดินตามบล็อก!
                </p>
                {runDone && (
                  <p className="mt-2 text-green-700 font-bold text-base sm:text-lg">
                    ยอดเยี่ยม! ตัวละครขยับแล้ว กดปุ่มพร้อมเล่นเพื่อเริ่มเกมจริง
                  </p>
                )}
              </TutorialCard>
            </div>
          )}

          {/* ─── NAVIGATOR INTERACTIVE STEPS ─── */}
          {/* Step 20 (Navigator): Incoming Mock Chat -> Reply */}
          {tutorialStep === 20 && (
            <div className="absolute top-4 right-[2%] lg:right-[4%] max-w-[440px] animate-in fade-in slide-in-from-top-4 duration-300">
              <TutorialCard
                title="ภารกิจ 1/2 (NAVIGATOR)"
                titleColor="#0284c7"
                titleBorder="#0369a1"
                buttonText={chatDone ? "✓ ส่งข้อความแล้ว!" : "พิมพ์ตอบในแชท..."}
                onNext={() => setTutorialStep(22)}
                disabled={!chatDone}
              >
                <p className="text-base sm:text-lg">
                  Driver กำลังถามทางในแชท! ดูแผนที่ทางซ้าย แล้วพิมพ์บอกทางใน <Badge color="bg-white text-sky-700 border-sky-300">Chat Box</Badge> ด้านล่างขวา
                </p>
                <p className="mt-1.5 text-xs sm:text-sm text-[#8b6840]">
                  (ลองพิมพ์บอกทาง เช่น <strong className="text-amber-800">"เดินขึ้น 2 ช่อง"</strong> หรือ <strong className="text-amber-800">"ระวังกำแพงข้างหน้า"</strong> แล้วกด Enter)
                </p>
              </TutorialCard>
            </div>
          )}

          {/* Step 22 (Navigator): View-Only Explanation & READY */}
          {tutorialStep === 22 && (
            <div className="absolute top-4 right-[2%] lg:right-[4%] max-w-[440px] animate-in fade-in slide-in-from-top-4 duration-300">
              <TutorialCard
                title="ภารกิจ 2/2 (NAVIGATOR)"
                titleColor="#0284c7"
                titleBorder="#0369a1"
                buttonText={selfReady ? "กำลังรอเพื่อนร่วมทีม..." : "พร้อมเล่น (READY) ✓"}
                onNext={markSelfReady}
                disabled={selfReady}
              >
                <p className="text-base sm:text-lg">
                  สังเกตพื้นที่เขียนโค้ดด้านบนของคุณเป็น <Badge color="bg-amber-100 text-amber-900 border-amber-900">VIEW ONLY</Badge> เพื่อคอยตรวจดูโค้ดที่ Driver วาง
                </p>
                <p className="mt-1.5 text-xs sm:text-sm text-[#8b6840]">
                  คุณจะสลับบทบาทเป็น Driver ทุกๆ 2 นาที! เมื่อพร้อมแล้วกดปุ่มด้านล่างได้เลย
                </p>
              </TutorialCard>
            </div>
          )}

          {/* Step 5: Time to Swap (Top Center) */}
          {tutorialStep === 5 && (
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-top-8 duration-300">
              <TutorialCard title="เวลาสลับบทบาท" titleColor="#eab308" titleBorder="#a16207" buttonText="เข้าใจแล้ว ➔" onNext={() => setTutorialStep(99)}>
                <p className="text-base sm:text-lg">สังเกตหลอด <Badge color="bg-green-100 text-green-800 border-green-700">ROLE SWAP</Badge> ด้านบน!</p>
                <p className="mt-2.5 text-base sm:text-lg">เมื่อเวลาหมด คุณและเพื่อนจะ <Badge color="bg-orange-100 text-orange-800 border-orange-800">สลับบทบาทกัน</Badge></p>
                <p className="mt-2.5 text-base sm:text-lg">และระวังเวลา <Badge color="bg-red-100 text-red-700 border-red-400">STAGE TIME (5 นาที)</Badge> ถ้าหมดก่อนถึงธงจะแพ้ทันที!</p>
              </TutorialCard>
            </div>
          )}
        </div>
      )}

      {/* Game Layout — Map Left 62-65%, Toolbox & Chat Right 35-38% (70:30) */}
      <div className="w-full max-w-[1750px] mx-auto flex flex-col flex-1 p-2 md:p-3 lg:p-4 gap-2 md:gap-3 relative min-h-0 font-pixel">
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

        <div className="flex flex-1 gap-3 md:gap-4 w-full items-stretch min-h-0">
          {/* Left Column: Game Board ONLY (~62% - 65% width, full height) */}
          <div className={`flex-[6.3] min-w-0 flex flex-col min-h-0 transition-all duration-300 ${
            (tutorialStep === 2 || tutorialStep === 10)
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

          {/* Right Column: BlockCodePanel (~70% height) + ChatBox (~30% height) */}
          <div className="flex-[3.7] min-w-0 flex flex-col gap-2 md:gap-3 min-h-0">
            {/* Top: BlockCodePanel (70% height) */}
            <div className={`flex-[7] min-h-0 flex flex-col transition-all duration-300 ${
              (tutorialStep === 11 || tutorialStep === 12 || tutorialStep === 22)
                ? 'relative z-[105] ring-3 ring-yellow-400/90 shadow-[0_0_30px_rgba(250,204,21,0.45)] rounded-2xl'
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

            {/* Bottom: ChatBox (30% height) */}
            <div className={`flex-[3] min-h-0 flex flex-col transition-all duration-300 ${
              (tutorialStep === 10 || tutorialStep === 20)
                ? 'relative z-[105] ring-3 ring-purple-400/90 shadow-[0_0_25px_rgba(168,85,247,0.45)] rounded-2xl'
                : ''
            }`}>
              <ChatBox
                onTutorialChatSent={onTutorialChatSent}
                mockMessage={mockMessage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Win overlay */}
      {isWin && (() => {
        const blocksUsed = MAX_BLOCKS - blocksLeft;
        const timeUsed = DUNGEON_TIME - dungeonTimeLeft;
        const star2 = blocksUsed < 40;
        const star3 = timeUsed < 240;
        return (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[120] backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative inline-block max-w-[90vw]">
              <img src="/ui/win_bg.png" alt="Victory Background" className="w-[800px] max-w-full h-auto drop-shadow-[0_0_30px_rgba(217,119,6,0.6)]" />
              <div className="absolute inset-0 flex flex-col items-center">
                <h2 className="absolute top-[10%] text-4xl sm:text-5xl md:text-6xl font-thai font-bold text-white tracking-wide" style={{ textShadow: "-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, 0 6px 0px rgba(0,0,0,0.8)" }}>
                  ชัยชนะ (VICTORY)
                </h2>
                <div className="absolute top-[32%] flex flex-col items-center justify-center w-full">
                  <div className="flex items-end justify-center gap-6 md:gap-10">
                    <div className="flex flex-col items-center">
                      <span className="text-6xl md:text-7xl drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)]">⭐</span>
                      <span className="text-[#fde68a] text-sm md:text-base font-bold mt-2 font-thai tracking-wide" style={{ textShadow: "1px 1px 0 #000" }}>ผ่านด่านสำเร็จ</span>
                    </div>
                    <div className="flex flex-col items-center mb-6">
                      <span className={`text-7xl md:text-8xl drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] ${star2 ? '' : 'opacity-30 grayscale'}`}>⭐</span>
                      <span className={`text-sm md:text-base font-bold mt-2 font-thai tracking-wide ${star2 ? 'text-[#fde68a]' : 'text-gray-400'}`} style={{ textShadow: "1px 1px 0 #000" }}>{"ใช้ไม่ถึง 40 บล็อก"}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={`text-6xl md:text-7xl drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] ${star3 ? '' : 'opacity-30 grayscale'}`}>⭐</span>
                      <span className={`text-sm md:text-base font-bold mt-2 font-thai tracking-wide ${star3 ? 'text-[#fde68a]' : 'text-gray-400'}`} style={{ textShadow: "1px 1px 0 #000" }}>{"ใช้เวลาไม่ถึง 4 นาที"}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[20%] flex gap-4 md:gap-6 w-full justify-center px-8 font-thai">
                  <button className="bg-[#78716c] border-[3px] border-[#44403c] text-white font-bold py-2 md:py-3 px-6 md:px-10 text-lg md:text-xl rounded-full hover:bg-[#57534e] active:scale-95 transition-all shadow-[0_4px_0_#44403c] active:shadow-none active:translate-y-1" onClick={leaveStage}>ออกจากด่าน</button>
                  {isHost ? (
                    <>
                      <button className="bg-transparent border-[3px] border-[#B28B29] text-white font-bold py-2 md:py-3 px-6 md:px-8 text-lg md:text-xl rounded-full hover:bg-white/20 active:scale-95 transition-all shadow-md" onClick={resetGameToNewStart}>เล่นใหม่</button>
                      <button className="bg-[#ea580c] border-[3px] border-[#c2410c] text-white font-bold py-2 md:py-3 px-6 md:px-10 text-lg md:text-xl rounded-full hover:bg-[#c2410c] active:scale-95 transition-all shadow-[0_4px_0_#9a3412] active:shadow-none active:translate-y-1" onClick={startGame}>ด่านถัดไป ➔</button>
                    </>
                  ) : (
                    <div className="bg-[#ea580c]/50 border-[3px] border-[#c2410c] text-white font-bold py-2 md:py-3 px-6 md:px-10 text-lg md:text-xl rounded-full shadow-md flex items-center">รอหัวหน้าห้อง...</div>
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
              <h2 className="absolute top-[10%] text-4xl sm:text-5xl md:text-6xl font-thai font-bold text-red-500 tracking-wide" style={{ textShadow: "-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, 0 6px 0px rgba(0,0,0,0.8)" }}>
                พ่ายแพ้ (DEFEAT)
              </h2>
              <div className="absolute top-[40%] flex flex-col items-center justify-center w-full px-12">
                <p className="text-2xl sm:text-3xl md:text-4xl font-thai font-bold text-white text-center leading-relaxed" style={{ textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000" }}>
                  {loseReason === "time" ? "หมดเวลาสำรวจ!" : "บล็อกคำสั่งหมด!"}
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-thai text-gray-300 mt-3 text-center" style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
                  {loseReason === "time" ? "เวลาในดันเจี้ยนหมดลงแล้ว" : "คุณใช้บล็อกคำสั่งจนหมดแล้ว"}
                </p>
              </div>
              <div className="absolute bottom-[20%] flex gap-4 md:gap-8 w-full justify-center px-8 font-thai">
                <button className="bg-[#78716c] border-[3px] border-[#44403c] text-white font-bold py-2 md:py-3 px-6 md:px-10 text-lg md:text-xl rounded-full hover:bg-[#57534e] active:scale-95 transition-all shadow-[0_4px_0_#44403c] active:shadow-none active:translate-y-1" onClick={leaveStage}>ออกจากด่าน</button>
                {isHost ? (
                  <button className="bg-[#ea580c] border-[3px] border-[#c2410c] text-white font-bold py-2 md:py-3 px-8 md:px-12 text-lg md:text-xl rounded-full hover:bg-[#c2410c] active:scale-95 transition-all shadow-[0_4px_0_#9a3412] active:shadow-none active:translate-y-1" onClick={resetGameToNewStart}>ลองใหม่</button>
                ) : (
                  <div className="bg-[#dc2626]/50 border-[3px] border-[#991b1b] text-white font-bold py-2 md:py-3 px-6 md:px-10 text-lg md:text-xl rounded-full shadow-md flex items-center">รอหัวหน้าห้อง...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── VISUAL TIME URGENCY EFFECTS (เรียบง่าย ใช้แสงขอบจอ ไม่ใช้ไอคอนรกตา) ─── */}
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

      {/* Swap Alert — Tactile Dimensional Parchment Banner (เรียบง่าย ไม่ตกบรรทัด บทบาทเด่นชัดโดยไม่ใช้ไอคอน) */}
      {showSwapAlert && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-[130] animate-in zoom-in-95 duration-200 p-4">
          <div className="relative w-full max-w-2xl">
            {/* Ambient drop shadow */}
            <div className="absolute -inset-3 bg-black/60 rounded-3xl blur-2xl pointer-events-none" />

            {/* Top Wooden Frame with Brass Rivets */}
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
              <span className="text-xs sm:text-sm font-pixel font-bold text-[#7c532b] tracking-[0.25em] uppercase">
                SYSTEM ANNOUNCEMENT
              </span>

              {/* หัวข้ออยู่บรรทัดเดียวกัน ไม่ตัดคำตกบรรทัด */}
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-thai font-bold text-[#5c2e18] tracking-wide whitespace-nowrap"
                style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.5)" }}
              >
                สลับบทบาท (ROLE SWAP)
              </h2>

              <div className="w-28 h-0.5 bg-[#8B5E3C]/40 my-1" />

              {/* แถบเน้นบทบาทใหม่ — เรียบง่าย ไม่มีไอคอน แต่ใหญ่และตัดสีชัดเจนบนกระดาษ */}
              <div
                className={`mt-1 px-6 sm:px-8 py-2.5 rounded-xl border-2 shadow-md ${
                  role === "driver"
                    ? "bg-[#c2410c] border-[#7c2d12] text-white"
                    : "bg-[#0369a1] border-[#082f49] text-white"
                }`}
              >
                <p
                  className="text-2xl sm:text-3xl md:text-4xl font-thai font-bold tracking-wide whitespace-nowrap"
                  style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.45)" }}
                >
                  {role === "driver" ? "คุณคือ DRIVER (คนขับ)" : "คุณคือ NAVIGATOR (ผู้นำทาง)"}
                </p>
              </div>

              <p className="text-base sm:text-lg md:text-xl font-thai font-semibold text-[#4a2408] mt-1">
                {role === "driver"
                  ? "ถึงตาคุณเขียนโค้ดและควบคุมการเคลื่อนที่"
                  : "ถึงตาคุณดูแผนที่และส่งข้อความนำทางเพื่อนร่วมทีม"}
              </p>
            </div>

            {/* Bottom Wooden Frame */}
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
