/**
 * โครงสร้างเมนู Toolbox ของ Blockly แบบ Flyout (แถบแสดงบล็อกสำหรับลากวาง)
 * ประกอบด้วยบล็อกเดิน 4 ทิศทาง: Move Up, Move Down, Move Left, Move Right
 */
export const toolbox = {
  kind: "flyoutToolbox",
  contents: [
    {
      kind: "block",
      type: "move_up",
    },
    {
      kind: "block",
      type: "move_down",
    },
    {
      kind: "block",
      type: "move_left",
    },
    {
      kind: "block",
      type: "move_right",
    },
  ],
};
