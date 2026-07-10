import BlocklyEditor from "../BlocklyEditor";
import * as Blockly from "blockly";

interface BlockCodePanelProps {
  blocksLeft?: number;
  onRun?: () => void;
  onReady: (workspace: Blockly.WorkspaceSvg) => void;
  readOnly?: boolean;
  executionError?: string | null;
}

export default function BlockCodePanel({
  blocksLeft,
  onRun,
  onReady,
  readOnly = false,
  executionError = null,
}: BlockCodePanelProps) {
  return (
    <div className="w-full h-full relative min-h-[300px] flex flex-col">
      {/* กล่องหลัก */}
      <div className="flex-1 bg-white/30 rounded-xl border-4 border-black flex flex-col overflow-hidden shadow-2xl relative">
        <div className="flex bg-transparent border-b-4 border-black/50">
          <div className="w-[190px] flex-shrink-0 p-2 text-center border-r-4 border-black/50 flex items-center justify-center">
            <h2 
              className="text-white text-2xl md:text-3xl font-bold font-pixel tracking-wide"
              style={{ textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 4px 4px rgba(0,0,0,0.5)" }}
            >
              Block Code
            </h2>
          </div>
          <div className="flex-1 p-2 flex flex-col items-center justify-center gap-1">
            <h2 
              className="text-white text-2xl md:text-3xl font-bold font-pixel tracking-wide mb-1"
              style={{ textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 4px 4px rgba(0,0,0,0.5)" }}
            >
              Your Program
            </h2>
            <div className="bg-[#92400e] text-white px-5 py-2 rounded-full border-4 border-black text-base md:text-lg font-bold font-pixel shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-wider flex items-center gap-2">
              <span className="bg-orange-500 text-black px-2 py-0.5 rounded-full border-2 border-black drop-shadow-sm text-xl">{blocksLeft}</span> BLOCK LEFT
            </div>
          </div>
        </div>

        {/* พื้นที่ของ Blockly Workspace */}
        <div className={`flex-1 w-full relative min-h-[250px] ${readOnly ? "pointer-events-none" : ""}`}>
          <div className="absolute top-0 bottom-0 left-[190px] w-1 bg-black z-10" />
          
          {readOnly && (
            <div className="absolute top-0 bottom-0 left-0 w-[190px] bg-black/50 z-20 flex flex-col justify-end pb-8 pointer-events-auto">
              <div className="text-center">
                <p 
                  className="text-red-500 text-2xl font-bold font-pixel tracking-wider"
                  style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 4px rgba(0,0,0,0.8)" }}
                >
                  ONLY DRIVER
                </p>
                <p 
                  className="text-red-500 text-2xl font-bold font-pixel tracking-wider mt-1"
                  style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 4px rgba(0,0,0,0.8)" }}
                >
                  CAN USE
                </p>
              </div>
            </div>
          )}

          {executionError && (
            <div className="absolute top-0 bottom-0 right-0 left-[190px] z-30 flex items-center justify-center pointer-events-none">
              <div className="text-center animate-bounce">
                <h3 
                  className="text-red-500 text-3xl md:text-4xl font-bold font-pixel tracking-wider mb-2"
                  style={{ textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 4px 4px rgba(0,0,0,0.8)" }}
                >
                  {executionError}
                </h3>
                <h3 
                  className="text-red-500 text-2xl md:text-3xl font-bold font-pixel tracking-wider"
                  style={{ textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 4px 4px rgba(0,0,0,0.8)" }}
                >
                  Your Program Is Stop
                </h3>
              </div>
            </div>
          )}

          <BlocklyEditor onReady={onReady} readOnly={readOnly} />
        </div>

        {/* ปุ่ม Run Program ลอยทับมุมขวาล่าง */}
        {!readOnly && (
          <button
            className="absolute bottom-4 right-4 bg-[#a6400e] border-[3px] border-[#222] rounded-xl px-4 py-2 text-xl md:text-2xl font-pixel font-bold text-white flex items-center gap-2 transition-transform z-10 hover:bg-[#8c350a] active:translate-y-1 shadow-[0_4px_0_#222] active:shadow-none"
            style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}
            onClick={onRun}
          >
            RUN PROGRAM <span className="text-[0.8em]">▶</span>
          </button>
        )}
      </div>
    </div>
  );
}
