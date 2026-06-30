import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

export function registerBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "move_up",
      message0: "Move %1",
      args0: [
        {
          type: "field_label",
          text: "Up 🡹",
          class: "block-text-white",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#BFA084",
    },
    {
      type: "move_down",
      message0: "Move %1",
      args0: [
        {
          type: "field_label",
          text: "Down 🡻",
          class: "block-text-white",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#CB7444",
    },
    {
      type: "move_left",
      message0: "Move %1",
      args0: [
        {
          type: "field_label",
          text: "Left 🡸",
          class: "block-text-white",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#BF8641",
    },
    {
      type: "move_right",
      message0: "Move %1",
      args0: [
        {
          type: "field_label",
          text: "Right 🡺",
          class: "block-text-white",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#AF6F37",
    },
  ]);

  // Generator สำหรับแปลงบล็อกเป็นคำสั่ง
  javascriptGenerator.forBlock["move_up"] = () => "moveUp();\n";
  javascriptGenerator.forBlock["move_down"] = () => "moveDown();\n";
  javascriptGenerator.forBlock["move_left"] = () => "moveLeft();\n";
  javascriptGenerator.forBlock["move_right"] = () => "moveRight();\n";
}
