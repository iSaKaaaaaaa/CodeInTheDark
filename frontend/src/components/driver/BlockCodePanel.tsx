import BlocklyEditor from "../BlocklyEditor";
import * as Blockly from "blockly";

interface BlockCodePanelProps {
  blocksLeft?: number;
  maxBlocks?: number;
  onRun?: () => void;
  onReady: (workspace: Blockly.WorkspaceSvg) => void;
  readOnly?: boolean;
  executionError?: string | null;
}

export default function BlockCodePanel({
  blocksLeft,
  maxBlocks = 50,
  onRun,
  onReady,
  readOnly = false,
  executionError = null,
}: BlockCodePanelProps) {
  const blocksWarning = blocksLeft !== undefined && blocksLeft <= 10;
  const blocksCritical = blocksLeft !== undefined && blocksLeft <= 5;

  return (
    <div className="w-full h-full relative flex flex-col min-h-0">
      {/* กล่องหลัก */}
      <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl border-4 border-[#333] flex flex-col overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative">
        {/* Header Bar */}
        <div className="flex bg-black/80 border-b-4 border-[#333] h-11 sm:h-12 md:h-13 shrink-0">
          <div className="w-[140px] sm:w-[150px] md:w-[155px] flex-shrink-0 border-r-4 border-[#333] flex items-center justify-center">
            <h2
              className="text-[#fde68a] text-sm sm:text-base md:text-lg font-bold font-pixel tracking-wider uppercase"
              style={{ textShadow: "1px 1px 0px #000, 2px 2px 0px rgba(0,0,0,0.8)" }}
            >
              Toolbox
            </h2>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <h2
              className="text-white text-sm sm:text-base md:text-lg font-bold font-pixel tracking-wider uppercase"
              style={{ textShadow: "1px 1px 0px #000, 2px 2px 0px rgba(0,0,0,0.8)" }}
            >
              Your Program
            </h2>
          </div>
        </div>

        {/* พื้นที่ของ Blockly Workspace */}
        <div className={`flex-1 w-full relative min-h-0 ${readOnly ? "pointer-events-none" : ""}`}>
          <div className="absolute top-0 bottom-0 left-[140px] sm:left-[150px] md:left-[155px] w-1 bg-[#333] z-10" />

          {readOnly && (
            <div
              className="absolute top-0 bottom-0 left-0 w-[140px] sm:w-[150px] md:w-[155px] z-20 flex flex-col items-center justify-center pointer-events-auto"
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(220,38,38,0.15) 0px, rgba(220,38,38,0.15) 10px, transparent 10px, transparent 20px)'
              }}
            >
              <div className="text-center px-2 flex flex-col gap-1.5 bg-black/75 rounded-lg p-2 border-2 border-red-900/60 backdrop-blur-sm">
                <span className="text-2xl sm:text-3xl">🔒</span>
                <p
                  className="text-red-400 text-sm sm:text-base font-bold font-pixel tracking-wider leading-snug"
                  style={{ textShadow: "1px 1px 0 #000" }}
                >
                  DRIVER<br/>ONLY
                </p>
              </div>
            </div>
          )}

          {executionError && (
            <div className="absolute inset-0 left-[140px] sm:left-[150px] md:left-[155px] bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none">
              <div className="bg-[#3d1f0f] border-4 border-red-800 rounded-xl p-4 text-center shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-bounce max-w-[90%]">
                <h3
                  className="text-red-500 text-lg sm:text-xl font-bold font-pixel tracking-wider mb-1 uppercase"
                  style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}
                >
                  Error!
                </h3>
                <p
                  className="text-white text-xs sm:text-sm font-pixel tracking-wide"
                >
                  {executionError}
                </p>
                <p className="text-gray-300 text-xs mt-2 animate-pulse">Click anywhere to dismiss</p>
              </div>
            </div>
          )}

          {/* Wrapper สำหรับ Blockly ให้ลดต่ำลงมาเพื่อให้มี Space ด้านบน ไม่ให้อึดอัด */}
          <div className="absolute inset-0 top-2 md:top-3">
            <BlocklyEditor onReady={onReady} readOnly={readOnly} />
          </div>

          {/* Blocks Left Floating Badge — compact horizontal */}
          {blocksLeft !== undefined && (
            <div className={`absolute top-2 right-2 z-20 flex items-center gap-1.5 bg-black/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border-2 transition-all duration-300 ${
              blocksCritical
                ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.8)] animate-pulse'
                : blocksWarning
                  ? 'border-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.6)]'
                  : 'border-[#444] shadow-md'
            }`}>
              <span className={`font-bold text-[10px] sm:text-xs uppercase tracking-wider leading-none ${
                blocksCritical ? 'text-red-400' : blocksWarning ? 'text-orange-300' : 'text-[#fde68a]'
              }`}>
                Blocks:
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`font-pixel text-lg sm:text-xl leading-none font-bold ${
                  blocksCritical ? 'text-red-500' : blocksWarning ? 'text-orange-400' : 'text-[#fde68a]'
                }`} style={{ textShadow: "1px 1px 0 #000" }}>
                  {blocksLeft}
                </span>
                <span className="font-pixel text-xs text-gray-400">
                  /{maxBlocks}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ปุ่ม Run Program ลอยทับมุมขวาล่าง — compact */}
        {!readOnly && (
          <button
            className="absolute bottom-2.5 right-2.5 bg-[#b45309] hover:bg-[#d97706] border-b-[3px] border-r-[3px] border-t-2 border-l-2 border-[#382503] rounded-lg px-3.5 py-1.5 text-sm sm:text-base font-pixel font-bold text-[#fffbeb] flex items-center gap-1.5 transition-all z-10 active:translate-y-[2px] active:border-b-0 active:border-r-0 shadow-[0_3px_0_#2a1b12] active:shadow-none tracking-wider uppercase"
            onClick={onRun}
          >
            Run <span className="text-[1.1em] leading-none mb-0.5">▶</span>
          </button>
        )}
      </div>
    </div>
  );
}
