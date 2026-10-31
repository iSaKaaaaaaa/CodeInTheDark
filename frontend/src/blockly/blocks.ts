import * as Blockly from "blockly";

/**
 * ลงทะเบียนบล็อกคำสั่งแบบ Custom ให้กับ Google Blockly:
 * - move_up: เดินขึ้นด้านบน
 * - move_down: เดินลงด้านล่าง
 * - move_left: เดินไปทางซ้าย
 * - move_right: เดินไปทางขวา
 */
export function registerBlocks(): void {
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
}

/** Alias สำหรับ registerBlocks เพื่อความเข้ากันได้กับโค้ดส่วนอื่น */
export const defineCustomBlocks = registerBlocks;

