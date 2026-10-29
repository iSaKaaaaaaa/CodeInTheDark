/**
 * Describe where a tile sits on the 13x13 playable grid (x, y in 1..13)
 * so hints can say "top-right corner" instead of a vague "on the map".
 */
export function describeArea(x: number, y: number): string {
  const col = x <= 4 ? "left" : x >= 10 ? "right" : "middle";
  const row = y <= 4 ? "top" : y >= 10 ? "bottom" : "middle";

  if (row === "middle" && col === "middle") return "in the middle of the map";
  if (row === "middle") return `along the ${col} edge`;
  if (col === "middle") return `along the ${row} edge`;
  return `near the ${row}-${col} corner`;
}
