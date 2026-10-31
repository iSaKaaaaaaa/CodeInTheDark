import { useState, useCallback } from "react";
import type { CSSProperties } from "react";
import BlocklyEditor from "../BlocklyEditor";
import type { BlocklyPanelMetrics } from "../BlocklyEditor";
import * as Blockly from "blockly";

interface BlockCodePanelProps {
  blocksLeft?: number;
  maxBlocks?: number;
  onRun?: () => void;
  onReady: (workspace: Blockly.WorkspaceSvg) => void;
  readOnly?: boolean;
  executionError?: string | null;
}

/**
 * แผงควบคุมบล็อกคำสั่ง (BlockCodePanel):
 * - แถบ Header แบ่งสัดส่วน Toolbox (ซ้าย) และ Workspace (ขวา)
 * - ฝัง BlocklyEditor สำหรับลากวางบล็อก
 * - แสดงป้ายเตือน "VIEW ONLY" เมื่อผู้เล่นอยู่ในบทบาท Navigator
 * - ป้ายแสดงจำนวนโควตาบล็อกที่เหลือ (Blocks Remaining HUD)
 * - ปุ่ม RUN PROGRAM ▶ สำหรับสั่งให้ตัวละครเริ่มเดินตามลำดับบล็อก
 */
export default function BlockCodePanel({
  blocksLeft,
  maxBlocks = 50,
  onRun,
  onReady,
  readOnly = false,
  executionError = null,
}: BlockCodePanelProps) {
  const [metrics, setMetrics] = useState({
    flyoutWidth: 155,
    wsWidth: 215,
    scale: 1,
  });

  const blocksWarning = blocksLeft !== undefined && blocksLeft <= 10;
  const blocksCritical = blocksLeft !== undefined && blocksLeft <= 5;

  // ปรับขนาดความกว้างของแถบเมนูตามสัดส่วนที่ Blockly คำนวณได้จริง
  const handleMetricsChange = useCallback((m: BlocklyPanelMetrics) => {
    const flyoutWidth = Math.max(70, Math.round(m.flyoutWidth));
    const wsWidth = Math.max(96, Math.round(m.panelWidth - flyoutWidth));
    const scale = Math.round(m.scale * 100) / 100;
    setMetrics((prev) => {
      if (
        Math.abs(prev.flyoutWidth - flyoutWidth) <= 1 &&
        Math.abs(prev.wsWidth - wsWidth) <= 1 &&
        Math.abs(prev.scale - scale) < 0.02
      ) {
        return prev;
      }
      return { flyoutWidth, wsWidth, scale };
    });
  }, []);

  const { flyoutWidth, wsWidth, scale } = metrics;
  const headerHeightPx = Math.round(Math.min(58, Math.max(36, 46 * scale)));
  const toolboxFontPx = Math.round(Math.min(21, Math.max(11, Math.min(flyoutWidth * 0.12, 19 * scale))));
  const workspaceFontPx = Math.round(Math.min(22, Math.max(11, Math.min(wsWidth * 0.105, 20 * scale))));
  const badgeOffsetPx = Math.round(Math.min(12, Math.max(4, 8 * scale)));
  const badgeFontPx = Math.round(Math.min(17, Math.max(10, Math.min(wsWidth * 0.067, 14.5 * scale))));
  const runBtnOffsetPx = Math.round(Math.min(14, Math.max(6, 10 * scale)));
  const runBtnFontPx = Math.round(Math.min(18, Math.max(10, Math.min(wsWidth * 0.068, 15.5 * scale))));
  const runBtnMaxWidthPx = Math.max(84, wsWidth - runBtnOffsetPx * 2);

  const panelCssVars = {
    "--flyout-w": `${flyoutWidth}px`,
    "--ui-scale": String(scale),
  } as CSSProperties;

  return (
    <div
      style={panelCssVars}
      className="w-full h-full flex-1 relative flex flex-col min-h-0 font-game-body"
    >
      {/* คอนเทนเนอร์หลักของแผงโค้ด */}
      <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl border-4 border-[#333] flex flex-col overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative min-h-0">
        {/* แถบ Header ด้านบน แบ่งส่วน Toolbox และ Workspace */}
        <div
          className="flex bg-black/85 border-b-4 border-[#333] shrink-0"
          style={{ height: `${headerHeightPx}px` }}
        >
          <div
            className="flex-shrink-0 border-r-4 border-[#333] flex items-center justify-center px-1 overflow-hidden"
            style={{ width: `${flyoutWidth}px` }}
          >
            <h2
              className="text-[#fde68a] font-bold font-game-sub tracking-wider uppercase whitespace-nowrap leading-none"
              style={{
                fontSize: `${toolboxFontPx}px`,
                textShadow: "1px 1px 0px #000, 2px 2px 0px rgba(0,0,0,0.8)",
              }}
            >
              Toolbox
            </h2>
          </div>
          <div className="flex-1 flex items-center justify-center relative px-1.5 overflow-hidden">
            <h2
              className="text-white font-bold font-game-sub tracking-wider uppercase whitespace-nowrap leading-none"
              style={{
                fontSize: `${workspaceFontPx}px`,
                textShadow: "1px 1px 0px #000, 2px 2px 0px rgba(0,0,0,0.8)",
              }}
            >
              Workspace
            </h2>
          </div>
        </div>

        {/* คอนเทนเนอร์พื้นที่ทำงาน Blockly */}
        <div className="flex-1 w-full relative min-h-[220px] md:min-h-0">
          <div
            className="absolute top-0 bottom-0 w-1 bg-[#333] z-10 pointer-events-none"
            style={{ left: `${flyoutWidth}px` }}
          />

          {/* พื้นที่วาด SVG ของ Blockly */}
          <div className={`absolute inset-0 top-1.5 sm:top-2.5 z-0 ${readOnly ? "pointer-events-none" : ""}`}>
            <BlocklyEditor
              onReady={onReady}
              readOnly={readOnly}
              onMetricsChange={handleMetricsChange}
            />
          </div>

          {/* ป้ายแจ้งเตือนโหมดดูอย่างเดียว (VIEW ONLY) สำหรับ Navigator */}
          {readOnly && (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-3"
              style={{ left: `${flyoutWidth}px` }}
            >
              <div className="bg-[#1e1008]/92 border-2 border-[#b8944f]/80 rounded-2xl px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-sm flex flex-col items-center gap-1 max-w-[92%] text-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span
                    className="text-amber-300 text-xs sm:text-sm font-bold font-bungee tracking-wide uppercase"
                    style={{ textShadow: "1px 1px 0 #000" }}
                  >
                    VIEW ONLY
                  </span>
                </div>
                <span className="text-[#fef3c7] text-xs font-game-body font-medium leading-snug">
                  Observing code. Switch to DRIVER during Role Swap to edit blocks.
                </span>
              </div>
            </div>
          )}

          {/* ป้ายแสดงโควตาบล็อกที่เหลืออยู่ */}
          {blocksLeft !== undefined && (
            <div
              style={{
                top: `${badgeOffsetPx}px`,
                right: `${badgeOffsetPx}px`,
                padding: "0.42em 0.95em",
                fontSize: `${badgeFontPx}px`,
              }}
              className={`absolute z-20 pointer-events-none flex flex-col items-center bg-black/85 backdrop-blur-sm rounded-lg border-2 transition-colors duration-300 ${
                blocksCritical
                  ? "border-red-600 shadow-[0_0_16px_rgba(220,38,38,0.8)] animate-pulse"
                  : blocksWarning
                    ? "border-orange-500 shadow-[0_0_12px_rgba(234,88,12,0.6)]"
                    : "border-[#444] shadow-md"
              }`}
            >
              <span
                style={{ fontSize: "1em" }}
                className={`font-bold font-game-sub uppercase tracking-wide leading-none mb-0.5 ${
                  blocksCritical ? "text-red-400" : blocksWarning ? "text-orange-300" : "text-[#fde68a]"
                }`}
              >
                BLOCKS
              </span>
              <div className="flex items-baseline gap-0.5">
                <span
                  style={{ fontSize: "1.8em", textShadow: "1.5px 1.5px 0 #000" }}
                  className={`font-pixel leading-none tracking-wider font-bold ${
                    blocksCritical ? "text-red-500" : blocksWarning ? "text-orange-400" : "text-[#fde68a]"
                  }`}
                >
                  {blocksLeft}
                </span>
                <span
                  style={{ fontSize: "1.2em", textShadow: "1px 1px 0 #000" }}
                  className="font-pixel font-bold text-gray-400 tracking-wider leading-none"
                >
                  / {maxBlocks}
                </span>
              </div>
            </div>
          )}

          {/* ปุ่มสั่งรันโปรแกรม (แสดงเฉพาะ Driver) */}
          {!readOnly && (
            <button
              type="button"
              className="absolute z-30 pointer-events-auto cursor-pointer bg-[#b45309] hover:bg-[#d97706] border-b-[3px] border-r-[3px] border-t-2 border-l-2 border-[#382503] rounded-xl font-game-sub font-bold text-[#fffbeb] flex items-center justify-center transition-colors active:translate-y-[2px] active:border-b-0 active:border-r-0 shadow-[0_3px_0_#2a1b12] active:shadow-none uppercase tracking-wide whitespace-nowrap"
              style={{
                right: `${runBtnOffsetPx}px`,
                bottom: `${runBtnOffsetPx}px`,
                maxWidth: `${runBtnMaxWidthPx}px`,
                padding: "0.48em 0.85em",
                gap: "0.38em",
                fontSize: `${runBtnFontPx}px`,
              }}
              onClick={onRun}
            >
              <span>RUN PROGRAM</span>
              <span className="text-[1.15em] leading-none">▶</span>
            </button>
          )}

          {/* ป๊อปอัปแจ้งเตือนกรณีรันโค้ดผิดพลาด */}
          {executionError && (
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none p-3"
              style={{ left: `${flyoutWidth}px` }}
            >
              <div className="bg-[#3d1f0f] border-4 border-red-800 rounded-2xl p-4 sm:p-5 text-center shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-bounce max-w-[92%]">
                <h3
                  className="text-red-500 text-lg sm:text-xl md:text-2xl font-bold font-bungee uppercase tracking-wide mb-2"
                  style={{ textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000" }}
                >
                  EXECUTION ERROR
                </h3>
                <p className="text-white text-xs sm:text-sm md:text-base font-game-body tracking-wide">
                  {executionError}
                </p>
                <p className="text-gray-300 text-xs mt-2.5 animate-pulse font-game-sub uppercase tracking-wider">
                  Click anywhere to dismiss
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
