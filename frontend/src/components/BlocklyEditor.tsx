import { useEffect, useRef } from "react";
import * as Blockly from "blockly";
import { registerBlocks } from "../blockly/blocks";

interface Props {
  onReady: (workspace: Blockly.WorkspaceSvg) => void;
}

export default function BlocklyEditor({ onReady }: Props) {
  const blocklyDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerBlocks();

    if (!blocklyDiv.current) return;

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: {
        kind: "flyoutToolbox",
        contents: [
          {
            kind: "block",
            type: "move_forward",
          },
          {
            kind: "block",
            type: "turn_left",
          },
          {
            kind: "block",
            type: "turn_right",
          },
        ],
      },
    });

    onReady(workspace);

    return () => workspace.dispose();
  }, []);

  return (
    <div
      ref={blocklyDiv}
      style={{
        width: "500px",
        height: "600px",
      }}
    />
  );
}
