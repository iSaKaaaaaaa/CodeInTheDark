/**
 * อธิบายตำแหน่งของพิกัดตารางบนกริด 13x13 (x, y ในช่วง 1..13):
 * แปลงพิกัดตัวเลขเป็นคำอธิบายตำแหน่ง เช่น "near the top-right corner" หรือ "in the middle of the map"
 * เพื่อใช้แสดงคำใบ้ตำแหน่งเป้าหมายในโหมดฝึกสอนหรือหน้าจอช่วยเหลือ
 */
export function describeArea(x: number, y: number): string {
  const col = x <= 4 ? "left" : x >= 10 ? "right" : "middle";
  const row = y <= 4 ? "top" : y >= 10 ? "bottom" : "middle";

  if (row === "middle" && col === "middle") return "in the middle of the map";
  if (row === "middle") return `along the ${col} edge`;
  if (col === "middle") return `along the ${row} edge`;
  return `near the ${row}-${col} corner`;
}
