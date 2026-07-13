export const MAP_1 = [
  "###############",
  "#...#.......G.#",
  "###.#.#.#.#####",
  "#S.........R..#",
  "#.##.######.###",
  "#......R..R..T#",
  "#.####.########",
  "#.#.#.......S.#",
  "#.#.#.#.#.#####",
  "#R..R...R....T#",
  "#####.#.#####.#",
  "#S......#...#.#",
  "#.###.#.#.#.###",
  "#T....#......S#",
  "#######P#######",
];

export const MAP_2 = [
  "###############",
  "#G..#....T....#",
  "#.#.#R#.#.#####",
  "#.#.#........S#",
  "#.T##.##.##R#.#",
  "#........S....#",
  "#.##.##.###.#.#",
  "###R..#.....#.#",
  "#.#.#...#####.#",
  "#.#...#....T#.#",
  "#.###...#.###.#",
  "#S......#...#.#",
  "#####.#####.#.#",
  "#T............#",
  "###########P###",
];

export const MAP_3 = [
  "###############",
  "#.........#..G#",
  "####.####.#.#.#",
  "#..S....#...R.#",
  "#.###.#.#.###.#",
  "#.#.R....T....#",
  "#.#...###.###.#",
  "#T....#...#..S#",
  "#.###.###.#.#.#",
  "#..S..#......R#",
  "#.#.#.###.###.#",
  "#...#.R...#..T#",
  "#.###.#.#.###.#",
  "#T......R....S#",
  "###P###########",
];

export const maps = [MAP_1, MAP_2, MAP_3];

export const getMapData = (mapIndex: number) => {
  const map = maps[mapIndex] || maps[0];
  const walls: { x: number; y: number }[] = [];
  const traps: { x: number; y: number }[] = [];
  const rocks: { x: number; y: number }[] = [];
  const spikes: { x: number; y: number }[] = [];
  let start = { x: 7, y: 14 }; // Default
  let goal = { x: 7, y: 1 };   // Default

  map.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "#") walls.push({ x, y });
      if (cell === "T") traps.push({ x, y });
      if (cell === "R") rocks.push({ x, y });
      if (cell === "S") spikes.push({ x, y });
      if (cell === "P") start = { x, y };
      if (cell === "G") goal = { x, y };
    });
  });

  return { map, walls, traps, rocks, spikes, start, goal };
};
