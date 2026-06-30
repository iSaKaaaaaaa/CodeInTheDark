import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

export function registerBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "move_up",
      message0: "Move Up ⬆️",
      previousStatement: null,
      nextStatement: null,
      colour: 120,
    },
    {
      type: "move_down",
      message0: "Move Down ⬇️",
      previousStatement: null,
      nextStatement: null,
      colour: 120,
    },
    {
      type: "move_left",
      message0: "Move Left ⬅️",
      previousStatement: null,
      nextStatement: null,
      colour: 230,
    },
    {
      type: "move_right",
      message0: "Move Right ➡️",
      previousStatement: null,
      nextStatement: null,
      colour: 230,
    },
  ]);

  // Generator สำหรับแปลงบล็อกเป็นคำสั่ง
  javascriptGenerator.forBlock["move_up"] = () => "moveUp();\n";
  javascriptGenerator.forBlock["move_down"] = () => "moveDown();\n";
  javascriptGenerator.forBlock["move_left"] = () => "moveLeft();\n";
  javascriptGenerator.forBlock["move_right"] = () => "moveRight();\n";
}
