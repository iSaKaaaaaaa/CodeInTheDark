import PixelButton from "../PixelButton";
import BlocklyEditor from "../BlocklyEditor";
import * as Blockly from "blockly";

interface BlockCodePanelProps {
  blocksLeft?: number;
  onRun?: () => void;
  onReady: (workspace: Blockly.WorkspaceSvg) => void;
  readOnly?: boolean;
}

export default function BlockCodePanel({
  blocksLeft,
  onRun,
  onReady,
  readOnly = false,
}: BlockCodePanelProps) {
  return (
    <div className="w-[45%] relative min-h-[500px] flex flex-col">
      {/* กล่องหลัก */}
      <div className="flex-1 bg-amber-100/90 rounded-xl border-4 border-black flex flex-col overflow-hidden shadow-2xl relative">
        <div className="flex bg-amber-200/50 border-b-4 border-black">
          <div className="w-[220px] flex-shrink-0 p-4 text-center border-r-4 border-black">
            <h2 className="text-black text-2xl font-bold font-pixel">Blocks</h2>
          </div>
          <div className="flex-1 p-4 flex flex-col items-center justify-center gap-1">
            <h2 className="text-black text-2xl font-bold font-pixel mb-1">
              Your Program
            </h2>
            <div className="bg-red-500 text-white px-6 py-2 rounded-full border-4 border-black text-lg md:text-xl font-bold font-pixel shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-wider">
              {blocksLeft} BLOCKS LEFT
            </div>
          </div>
        </div>

        {/* พื้นที่ของ Blockly Workspace */}
        <div className={`flex-1 w-full relative min-h-[420px] ${readOnly ? "pointer-events-none" : ""}`}>
          <div className="absolute top-0 bottom-0 left-[220px] w-1 bg-black z-10" />
          
          {readOnly && (
            <div className="absolute top-0 bottom-0 left-0 w-[220px] bg-black/60 z-20 flex items-center justify-center">
              <div className="bg-red-600 border-4 border-black text-white px-4 py-2 font-pixel text-center shadow-lg -rotate-12">
                <p className="text-xl font-bold">DRIVER</p>
                <p className="text-lg">ONLY</p>
              </div>
            </div>
          )}

          <BlocklyEditor onReady={onReady} readOnly={readOnly} />
        </div>

        {/* ปุ่ม Run Program ลอยทับมุมขวาล่าง */}
        {!readOnly && (
          <PixelButton
            variant="orange"
            className="absolute bottom-4 right-4 rounded-full px-6 py-3 text-xl flex items-center gap-2 transition-transform z-10 hover:scale-105 active:scale-95"
            onClick={onRun}
          >
            RUN PROGRAM <span>▶</span>
          </PixelButton>
        )}
      </div>
    </div>
  );
}
