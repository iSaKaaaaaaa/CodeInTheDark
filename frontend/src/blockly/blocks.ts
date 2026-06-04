import * as Blockly from "blockly";

export function registerBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "move_forward",
      message0: "Move Forward",
      previousStatement: null,
      nextStatement: null,
      colour: 120,
    },
    {
      type: "turn_left",
      message0: "Turn Left",
      previousStatement: null,
      nextStatement: null,
      colour: 230,
    },
    {
      type: "turn_right",
      message0: "Turn Right",
      previousStatement: null,
      nextStatement: null,
      colour: 230,
    },
  ]);
}
