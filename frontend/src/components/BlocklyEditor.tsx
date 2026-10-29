import { useEffect, useRef } from "react";
import * as Blockly from "blockly";
import { registerBlocks } from "../blockly/blocks";
import { toolbox } from "../blockly/toolbox";

// กำหนดธีมสไตล์อียิปต์โบราณ/พิกเซล ให้โปร่งใส
const egyptianTheme = Blockly.Theme.defineTheme("egyptian", {
  name: "egyptian",
  base: Blockly.Themes.Classic,
  blockStyles: {},
  categoryStyles: {},
  // Size in pt; keep in sync with the 15pt override in index.css so Blockly measures text the way it is drawn
  fontStyle: {
    family: '"VT323", "Prompt", "Chakra Petch", sans-serif',
    weight: "600",
    size: 15,
  },
  componentStyles: {
    workspaceBackgroundColour: "transparent",
    toolboxBackgroundColour: "transparent",
    flyoutBackgroundColour: "transparent",
    scrollbarColour: "#78350f", // bg-amber-900
    scrollbarOpacity: 0.4,
    insertionMarkerColour: "#f97316", // orange-500
  },
});

export interface BlocklyPanelMetrics {
  flyoutWidth: number;
  panelWidth: number;
  panelHeight: number;
  scale: number;
}

interface Props {
  onReady: (workspace: Blockly.WorkspaceSvg) => void;
  readOnly?: boolean;
  onMetricsChange?: (metrics: BlocklyPanelMetrics) => void;
}

export default function BlocklyEditor({ onReady, readOnly = false, onMetricsChange }: Props) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const savedXmlRef = useRef<string | null>(null);
  const metricsCbRef = useRef(onMetricsChange);
  metricsCbRef.current = onMetricsChange;

  useEffect(() => {
    registerBlocks();

    if (!blocklyDiv.current) return;

    const container = blocklyDiv.current;
    // Scale blocks smoothly from BOTH panel width and panel height (~15% larger & longer blocks while staying responsive)
    const calcScale = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return 1.0;
      return Math.min(1.42, Math.max(0.44, Math.min(w / 345, h / 430)));
    };

    const workspace = Blockly.inject(container, {
      toolbox: toolbox,
      theme: egyptianTheme,
      rendererOverrides: {
        MIN_BLOCK_WIDTH: 120,
        MIN_BLOCK_HEIGHT: 28,
        TOP_ROW_MIN_HEIGHT: 7,
        BOTTOM_ROW_MIN_HEIGHT: 7,
        MEDIUM_PADDING: 7,
        LARGE_PADDING: 12,
      },
      grid: {
        spacing: 20,
        length: 0,
        colour: "transparent",
        snap: true,
      },
      trashcan: !readOnly, // ซ่อนถังขยะถ้า readOnly
      scrollbars: false,
      move: {
        scrollbars: false,
        drag: false,
        wheel: false,
      },
      zoom: {
        startScale: calcScale(),
        minScale: 0.35,
        maxScale: 1.65,
      },
    });

    // Deterministic SVG positioning & scaling for Blockly's 47x60 trashcan so it never drifts on lid open or resize
    const TRASH_W = 47;
    const TRASH_H = 60; // 16 lid + 44 body
    let trashBox = { left: 0, top: 0, scale: 0.85 };

    const positionTrashcan = (knownFlyoutW?: number) => {
      if (readOnly || !workspace.trashcan) return;
      const trashGroup = container.querySelector<SVGGElement>("g.blocklyTrash");
      if (!trashGroup) return;

      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;

      const s = calcScale();
      const flyout = workspace.getFlyout();
      const fw =
        knownFlyoutW !== undefined
          ? knownFlyoutW
          : flyout && flyout.getWidth() > 0
            ? Math.round(flyout.getWidth())
            : Math.round(w * 0.44);
      const wsW = Math.max(96, w - fw);

      const tScale = Math.min(1.02, Math.max(0.44, Math.min(s * 0.78, (wsW / 235) * 0.88)));
      const scaledW = TRASH_W * tScale;
      const scaledH = TRASH_H * tScale;

      // Mirror BlockCodePanel's RUN PROGRAM button bottom/right offset & height so trashcan locks cleanly above it
      const runOffset = Math.round(Math.min(14, Math.max(6, 10 * s)));
      const runFont = Math.round(Math.min(18, Math.max(10, Math.min(wsW * 0.068, 15.5 * s))));
      const runBtnH = Math.round(runFont * 2.3 + 7);
      const gapAboveBtn = Math.round(Math.min(16, Math.max(8, 11 * s)));

      const left = Math.max(fw + 8, Math.round(w - runOffset - scaledW - Math.round(4 * tScale)));
      const top = Math.max(8, Math.round(h - runOffset - runBtnH - gapAboveBtn - scaledH));

      trashBox = { left, top, scale: tScale };
      trashGroup.setAttribute("transform", `translate(${left}, ${top}) scale(${tScale.toFixed(3)})`);
    };

    if (workspace.trashcan) {
      const origTrashFlyout = workspace.trashcan.flyout;
      workspace.trashcan.position = () => {
        positionTrashcan();
        origTrashFlyout?.position();
      };
      workspace.trashcan.getBoundingRectangle = () => {
        const { left, top, scale: ts } = trashBox;
        return new Blockly.utils.Rect(top, top + TRASH_H * ts, left, left + TRASH_W * ts);
      };
      workspace.trashcan.getClientRect = () => {
        const rect = container.getBoundingClientRect();
        const { left, top, scale: ts } = trashBox;
        const pad = 10 * ts;
        return new Blockly.utils.Rect(
          rect.top + top - pad,
          rect.top + top + TRASH_H * ts + pad,
          rect.left + left - pad,
          rect.left + left + TRASH_W * ts + pad
        );
      };
    }

    const applyScale = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;

      const s = calcScale();
      Blockly.svgResize(workspace);

      const flyout = workspace.getFlyout();
      if (flyout) {
        (flyout as unknown as { getFlyoutScale: () => number }).getFlyoutScale = () => s;
      }

      workspace.setScale(s);

      let flyoutWidth = Math.round(w * 0.44);
      if (flyout) {
        const flyoutWs = flyout.getWorkspace();
        if (flyoutWs) {
          flyoutWs.setScale(s);
        }
        flyout.reflow();
        if (flyoutWs) {
          const abs = flyoutWs.getMetricsManager().getAbsoluteMetrics();
          flyoutWs.translate(flyoutWs.scrollX + abs.left, flyoutWs.scrollY + abs.top);
        }
        const measured = flyout.getWidth();
        if (measured > 0) {
          flyoutWidth = Math.round(measured);
        }
      }

      // Keep main workspace origin locked at (flyoutWidth, 0) right on the divider line
      workspace.scrollX = 0;
      workspace.scrollY = 0;
      workspace.translate(flyoutWidth, 0);
      Blockly.svgResize(workspace);
      workspace.translate(flyoutWidth, 0);
      positionTrashcan(flyoutWidth);
      workspace.recordDragTargets();

      metricsCbRef.current?.({
        flyoutWidth,
        panelWidth: w,
        panelHeight: h,
        scale: s,
      });
    };

    applyScale();

    const ro = new ResizeObserver(() => {
      applyScale();
    });
    ro.observe(container);
    window.addEventListener("resize", applyScale);

    let disposed = false;
    document.fonts?.ready?.then(() => {
      if (!disposed) applyScale();
    });

    if (savedXmlRef.current) {
      try {
        const xml = Blockly.utils.xml.textToDom(savedXmlRef.current);
        Blockly.Xml.domToWorkspace(xml, workspace);
      } catch (e) {
        console.error("Failed to restore Blockly XML", e);
      }
    }

    onReady(workspace);

    return () => {
      disposed = true;
      ro.disconnect();
      window.removeEventListener("resize", applyScale);
      const xml = Blockly.Xml.workspaceToDom(workspace);
      savedXmlRef.current = Blockly.Xml.domToText(xml);
      workspace.dispose();
    };
  }, [onReady, readOnly]);

  return (
    <div
      ref={blocklyDiv}
      style={{
        width: "100%",
        height: "100%",
      }}
      className="bg-transparent"
    />
  );
}

