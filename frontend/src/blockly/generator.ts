import * as Blockly from 'blockly';

// ต้องมีคำว่า export นำหน้าตรงนี้ด้วยนะ!
export const setupGenerator = () => {
  (Blockly as any).JavaScript['move_forward'] = function() {
    return 'move_forward();\n';
  };
};