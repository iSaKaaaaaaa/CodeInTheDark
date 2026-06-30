import { useEffect, useRef } from "react";
import * as Blockly from "blockly";
import { registerBlocks } from "../blockly/blocks";
import { toolbox } from "../blockly/toolbox";

interface Props {
  onReady: (workspace: Blockly.WorkspaceSvg) => void;
}

export default function BlocklyEditor({ onReady }: Props) {
  const blocklyDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerBlocks();

    if (!blocklyDiv.current) return;

    // เรียกใช้ toolbox จากไฟล์ภายนอก
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
    });

    onReady(workspace);

    return () => workspace.dispose();
  }, [onReady]);

  return (
    <div
      ref={blocklyDiv}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px", // เผื่อความสูงขั้นต่ำไว้
      }}
      className="rounded-lg overflow-hidden bg-white"
    />
  );
}
