import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

/** ข้อมูลบล็อกคำสั่งที่ถูกสกัดออกมาสำหรับการรันโปรแกรม */
export interface ExtractedCommandBlock {
  id: string;
  type: string;
}

/** ผลลัพธ์การสกัดคำสั่งจาก Workspace ทั้งหมด */
export interface ExtractedWorkspaceCommands {
  commandBlocks: ExtractedCommandBlock[];
  blockTypes: string[];
  totalBlocks: number;
}

/**
 * กำหนด Generator สำหรับแปลงบล็อกคำสั่ง Blockly เป็น JavaScript code strings
 */
export function registerGenerators(): void {
  javascriptGenerator.forBlock["move_up"] = () => "moveUp();\n";
  javascriptGenerator.forBlock["move_down"] = () => "moveDown();\n";
  javascriptGenerator.forBlock["move_left"] = () => "moveLeft();\n";
  javascriptGenerator.forBlock["move_right"] = () => "moveRight();\n";
}

export const setupGenerator = registerGenerators;

/**
 * สกัดบล็อกคำสั่งที่ต่อเรียงกันใน Workspace โดยเริ่มจาก Top Block ก้อนแรก
 * ไล่ตามข้อต่อ getNextBlock() เพื่อให้ได้ลำดับคำสั่งที่ถูกต้องตามที่ผู้เล่นจัดเรียงไว้
 */
export function extractWorkspaceCommands(workspace: Blockly.WorkspaceSvg | null): ExtractedWorkspaceCommands {
  if (!workspace) {
    return { commandBlocks: [], blockTypes: [], totalBlocks: 0 };
  }

  const topBlocks = workspace.getTopBlocks(true);
  const totalBlocks = workspace.getAllBlocks(false).length;

  if (topBlocks.length === 0) {
    return { commandBlocks: [], blockTypes: [], totalBlocks };
  }

  const commandBlocks: ExtractedCommandBlock[] = [];
  const blockTypes: string[] = [];

  let block: Blockly.Block | null = topBlocks[0];
  while (block) {
    commandBlocks.push({ id: block.id, type: block.type });
    blockTypes.push(block.type);
    block = block.getNextBlock();
  }

  return { commandBlocks, blockTypes, totalBlocks };
}
