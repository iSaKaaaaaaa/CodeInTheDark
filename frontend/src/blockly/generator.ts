import { javascriptGenerator } from "blockly/javascript";

export const setupGenerator = () => {
  javascriptGenerator.forBlock["move_up"] = () => {
    return "move_up;\n";
  };

  javascriptGenerator.forBlock["move_down"] = () => {
    return "move_down;\n";
  };

  javascriptGenerator.forBlock["move_left"] = () => {
    return "move_left;\n";
  };

  javascriptGenerator.forBlock["move_right"] = () => {
    return "move_right;\n";
  };
};
