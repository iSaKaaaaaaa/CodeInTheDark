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
        <div className="flex bg-black/85 border-b-4 border-[#333] h-14 md:h-16 shrink-0">
          <div className="w-[185px] md:w-[200px] flex-shrink-0 border-r-4 border-[#333] flex items-center justify-center">
            <h2
              className="text-[#fde68a] text-xl md:text-2xl font-bold font-pixel tracking-wider uppercase"
              style={{ textShadow: "1px 1px 0px #000, 2px 2px 0px rgba(0,0,0,0.8)" }}
            >
              Toolbox
            </h2>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <h2
              className="text-white text-xl md:text-2xl lg:text-3xl font-bold font-pixel tracking-wider uppercase"
              style={{ textShadow: "1px 1px 0px #000, 2px 2px 0px rgba(0,0,0,0.8)" }}
            >
              Your Program
            </h2>
          </div>
        </div>

        {/* พื้นที่ของ Blockly Workspace */}
        <div className={`flex-1 w-full relative min-h-0 ${readOnly ? "pointer-events-none" : ""}`}>
          <div className="absolute top-0 bottom-0 left-[185px] md:left-[200px] w-1 bg-[#333] z-10" />

          {readOnly && (
            <div className="absolute inset-0 left-[185px] md:left-[200px] z-20 flex items-center justify-center pointer-events-none p-4">
              <div className="bg-[#2a1306]/85 border-2 border-[#b8944f] rounded-2xl px-6 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-sm flex flex-col items-center gap-1 max-w-md text-center">
                <span
                  className="text-amber-300 text-lg sm:text-xl md:text-2xl font-bold font-pixel tracking-widest uppercase"
                  style={{ textShadow: "1px 1px 0 #000" }}
                >
                  VIEW ONLY
                </span>
                <span className="text-[#fef3c7] text-xs sm:text-sm md:text-base font-thai font-medium tracking-wide">
                  โหมดดูโค้ดเท่านั้น — รอสลับบทบาทเป็น DRIVER เพื่อแก้ไขคำสั่ง
                </span>
              </div>
            </div>
          )}

          {executionError && (
            <div className="absolute inset-0 left-[185px] md:left-[200px] bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none">
              <div className="bg-[#3d1f0f] border-4 border-red-800 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-bounce max-w-[90%]">
                <h3
                  className="text-red-500 text-2xl md:text-3xl lg:text-4xl font-bold font-thai tracking-wide mb-2"
                  style={{ textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000" }}
                >
                  พบข้อผิดพลาด! (Error)
                </h3>
                <p
                  className="text-white text-base md:text-lg font-thai tracking-wide"
                >
                  {executionError}
                </p>
                <p className="text-gray-300 text-sm mt-3 animate-pulse font-thai">คลิกที่ใดก็ได้เพื่อปิด</p>
              </div>
            </div>
          )}

          {/* Wrapper สำหรับ Blockly ให้ลดต่ำลงมาเพื่อให้มี Space ด้านบน ไม่ให้อึดอัด */}
          <div className="absolute inset-0 top-4 md:top-6">
            <BlocklyEditor onReady={onReady} readOnly={readOnly} />
          </div>

          {/* Blocks Left Floating Badge — ลดขนาดลงให้กะทัดรัด ไม่บังพื้นที่วางบล็อก */}
          {blocksLeft !== undefined && (
            <div className={`absolute top-3 right-3 z-20 flex flex-col items-center bg-black/85 backdrop-blur-sm px-3.5 py-2 rounded-lg border-2 transition-all duration-300 ${
              blocksCritical
                ? 'border-red-600 shadow-[0_0_16px_rgba(220,38,38,0.8)] animate-pulse scale-105'
                : blocksWarning
                  ? 'border-orange-500 shadow-[0_0_12px_rgba(234,88,12,0.6)]'
                  : 'border-[#444] shadow-md'
            }`}>
              <span className={`font-bold text-[11px] sm:text-xs font-thai tracking-wide leading-none mb-1 ${
                blocksCritical ? 'text-red-400' : blocksWarning ? 'text-orange-300' : 'text-[#fde68a]'
              }`}>
                บล็อกที่เหลือ (Blocks)
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`font-pixel text-2xl sm:text-3xl leading-none tracking-wider font-bold ${
                  blocksCritical ? 'text-red-500' : blocksWarning ? 'text-orange-400' : 'text-[#fde68a]'
                }`} style={{ textShadow: "1.5px 1.5px 0 #000" }}>
                  {blocksLeft}
                </span>
                <span className="font-pixel text-xs sm:text-sm font-bold text-gray-400 tracking-wider" style={{ textShadow: "1px 1px 0 #000" }}>
                  / {maxBlocks}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ปุ่ม Run Program ลอยทับมุมขวาล่าง */}
        {!readOnly && (
          <button
            className="absolute bottom-4 right-4 bg-[#b45309] hover:bg-[#d97706] border-b-[4px] border-r-[4px] border-t-2 border-l-2 border-[#382503] rounded-xl px-6 py-3 text-lg md:text-xl font-thai font-bold text-[#fffbeb] flex items-center gap-2 transition-all z-10 active:translate-y-[4px] active:border-b-0 active:border-r-0 shadow-[0_4px_0_#2a1b12] active:shadow-none tracking-wide"
            onClick={onRun}
          >
            รันโค้ด (RUN) <span className="text-[1.2em] leading-none mb-0.5">▶</span>
          </button>
        )}
      </div>
    </div>
  );
}
