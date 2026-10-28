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
    <div className="w-full h-full relative flex flex-col min-h-0 font-game-body">
      {/* Main Container */}
      <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl border-4 border-[#333] flex flex-col overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative">
        {/* Header Bar */}
        <div className="flex bg-black/85 border-b-4 border-[#333] h-12 md:h-14 shrink-0">
          <div className="w-[185px] md:w-[200px] flex-shrink-0 border-r-4 border-[#333] flex items-center justify-center">
            <h2
              className="text-[#fde68a] text-lg md:text-xl font-bold font-game-sub tracking-wider uppercase"
              style={{ textShadow: "1px 1px 0px #000, 2px 2px 0px rgba(0,0,0,0.8)" }}
            >
              Toolbox
            </h2>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <h2
              className="text-white text-lg md:text-xl lg:text-2xl font-bold font-game-sub tracking-wider uppercase"
              style={{ textShadow: "1px 1px 0px #000, 2px 2px 0px rgba(0,0,0,0.8)" }}
            >
              Workspace
            </h2>
          </div>
        </div>

        {/* Blockly Workspace Container */}
        <div className={`flex-1 w-full relative min-h-0 ${readOnly ? "pointer-events-none" : ""}`}>
          <div className="absolute top-0 bottom-0 left-[185px] md:left-[200px] w-1 bg-[#333] z-10" />

          {readOnly && (
            <div className="absolute inset-0 left-[185px] md:left-[200px] z-20 flex items-center justify-center pointer-events-none p-4">
              <div className="bg-[#1e1008]/92 border-2 border-[#b8944f]/80 rounded-2xl px-5 sm:px-6 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-sm flex flex-col items-center gap-1.5 max-w-[280px] text-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span
                    className="text-amber-300 text-sm sm:text-base font-bold font-bungee tracking-wide uppercase"
                    style={{ textShadow: "1px 1px 0 #000" }}
                  >
                    VIEW ONLY
                  </span>
                </div>
                <span className="text-[#fef3c7] text-xs sm:text-sm font-game-body font-medium leading-snug">
                  Observing code. Switch to DRIVER during Role Swap to edit blocks.
                </span>
              </div>
            </div>
          )}

          {executionError && (
            <div className="absolute inset-0 left-[185px] md:left-[200px] bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none">
              <div className="bg-[#3d1f0f] border-4 border-red-800 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-bounce max-w-[90%]">
                <h3
                  className="text-red-500 text-2xl md:text-3xl font-bold font-game-sub uppercase tracking-wide mb-2"
                  style={{ textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000" }}
                >
                  EXECUTION ERROR
                </h3>
                <p className="text-white text-sm md:text-base font-game-body tracking-wide">
                  {executionError}
                </p>
                <p className="text-gray-300 text-xs sm:text-sm mt-3 animate-pulse font-game-sub uppercase tracking-wider">
                  Click anywhere to dismiss
                </p>
              </div>
            </div>
          )}

          {/* Blockly canvas offset */}
          <div className="absolute inset-0 top-3 md:top-4">
            <BlocklyEditor onReady={onReady} readOnly={readOnly} />
          </div>

          {/* Blocks Remaining Floating Badge */}
          {blocksLeft !== undefined && (
            <div className={`absolute top-3 right-3 z-20 flex flex-col items-center bg-black/85 backdrop-blur-sm px-3 py-1.5 rounded-lg border-2 transition-all duration-300 ${
              blocksCritical
                ? 'border-red-600 shadow-[0_0_16px_rgba(220,38,38,0.8)] animate-pulse scale-105'
                : blocksWarning
                  ? 'border-orange-500 shadow-[0_0_12px_rgba(234,88,12,0.6)]'
                  : 'border-[#444] shadow-md'
            }`}>
              <span className={`font-bold text-[10px] sm:text-xs font-game-sub uppercase tracking-wide leading-none mb-1 ${
                blocksCritical ? 'text-red-400' : blocksWarning ? 'text-orange-300' : 'text-[#fde68a]'
              }`}>
                BLOCKS
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`font-pixel text-xl sm:text-2xl leading-none tracking-wider font-bold ${
                  blocksCritical ? 'text-red-500' : blocksWarning ? 'text-orange-400' : 'text-[#fde68a]'
                }`} style={{ textShadow: "1.5px 1.5px 0 #000" }}>
                  {blocksLeft}
                </span>
                <span className="font-pixel text-xs font-bold text-gray-400 tracking-wider" style={{ textShadow: "1px 1px 0 #000" }}>
                  / {maxBlocks}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Run Program Floating Button */}
        {!readOnly && (
          <button
            className="absolute bottom-4 right-4 bg-[#b45309] hover:bg-[#d97706] border-b-[4px] border-r-[4px] border-t-2 border-l-2 border-[#382503] rounded-xl px-5 py-2.5 text-base md:text-lg font-game-sub font-bold text-[#fffbeb] flex items-center gap-2 transition-all z-10 active:translate-y-[4px] active:border-b-0 active:border-r-0 shadow-[0_4px_0_#2a1b12] active:shadow-none uppercase tracking-wider"
            onClick={onRun}
          >
            RUN PROGRAM <span className="text-[1.2em] leading-none mb-0.5">▶</span>
          </button>
        )}
      </div>
    </div>
  );
}
