import { useEffect, useRef } from "react";
import * as Blockly from "blockly";
import { registerBlocks } from "../blockly/blocks";
import { toolbox } from "../blockly/toolbox";

// กำหนดธีมสไตล์อียิปต์โบราณ/พิกเซล ให้กลมกลืนกับม้วนกระดาษปาปิรัสและไม้
const egyptianTheme = Blockly.Theme.defineTheme("egyptian", {
  name: "egyptian",
  base: Blockly.Themes.Classic,
  blockStyles: {},
  categoryStyles: {},
  componentStyles: {
    workspaceBackgroundColour: "#fef3c7", // bg-amber-100
    toolboxBackgroundColour: "#d97706", // bg-amber-600
    flyoutBackgroundColour: "#fef3c7", // bg-amber-100
    scrollbarColour: "#78350f", // bg-amber-900
    scrollbarOpacity: 0.4,
    insertionMarkerColour: "#f97316", // orange-500
  },
});

interface Props {
  onReady: (workspace: Blockly.WorkspaceSvg) => void;
  readOnly?: boolean;
}

export default function BlocklyEditor({ onReady, readOnly = false }: Props) {
  const blocklyDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerBlocks();

    if (!blocklyDiv.current) return;

    // ทำการฝัง Blockly โดยปรับแต่งธีมให้เข้ากับธีมอียิปต์
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      theme: egyptianTheme,
      grid: {
        spacing: 20,
        length: 3,
        colour: "#f59e0b", // เส้นสีส้ม/ทอง
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
        startScale: 1.3,
      },
    });

    // ปรับขนาดบล็อกในแถบเมนู (Flyout) ด้านซ้ายให้ขยาย 50% (ขนาดรวม 1.5 เท่า) เหมือนฝั่งกระดานเขียนโค้ด
    workspace.getFlyout()?.getWorkspace()?.setScale(1.25);

    onReady(workspace);

    return () => workspace.dispose();
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

