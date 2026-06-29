import * as Blockly from 'blockly';

// ต้องมีคำว่า export นำหน้าตรงนี้นะครับจี!
export const defineCustomBlocks = () => {
  Blockly.Blocks['move_forward'] = {
    init: function() {
      this.appendDummyInput().appendField("เดินหน้า");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(30);
    }
  };
  // เติม เลี้ยวซ้าย, เลี้ยวขวา ตรงนี้ได้เลยครับ
};