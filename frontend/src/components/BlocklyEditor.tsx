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
  componentStyles: {
    workspaceBackgroundColour: "transparent",
    toolboxBackgroundColour: "transparent",
    flyoutBackgroundColour: "transparent",
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
  const savedXmlRef = useRef<string | null>(null);

  useEffect(() => {
    registerBlocks();

    if (!blocklyDiv.current) return;

    // ทำการฝัง Blockly โดยปรับแต่งธีมให้เข้ากับธีมอียิปต์
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      theme: egyptianTheme,
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
        startScale: 1.15,
      },
    });

    // ปรับขนาดบล็อกในแถบเมนู (Flyout) ด้านซ้ายให้พอดีกับแถบ 150px
    workspace.getFlyout()?.getWorkspace()?.setScale(1.05);

    if (savedXmlRef.current) {
      try {
        const xml = Blockly.utils.xml.textToDom(savedXmlRef.current);
        Blockly.Xml.domToWorkspace(xml, workspace);
      } catch (e) {
        console.error("Failed to restore Blockly XML", e);
      }
    }

    onReady(workspace);

    const handleResize = () => {
      Blockly.svgResize(workspace);
    };
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      Blockly.svgResize(workspace);
    });
    if (blocklyDiv.current) {
      resizeObserver.observe(blocklyDiv.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
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

