import { UserInfo } from "../types";

export interface GeneratedMap {
  map: string[];
  walls: { x: number; y: number }[];
  traps: { x: number; y: number }[];
  rocks: { x: number; y: number }[];
  spikes: { x: number; y: number }[];
  start: { x: number; y: number };
  goal: { x: number; y: number };
}

class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  choice<T>(arr: T[]): T {
    const index = Math.floor(this.next() * arr.length);
    return arr[index];
  }
}

function chooseStartGoal(
  logicalWidth: number,
  logicalHeight: number,
  rng: SeededRandom
): { start: { x: number; y: number }; goal: { x: number; y: number } } {
  const borderNodes: [number, number][] = [];
  for (let y = 0; y < logicalHeight; y++) {
    for (let x = 0; x < logicalWidth; x++) {
      if (x === 0 || x === logicalWidth - 1 || y === 0 || y === logicalHeight - 1) {
        borderNodes.push([x, y]);
      }
    }
  }

  const startLogical = rng.choice(borderNodes);

  const allNodes: [number, number][] = [];
  for (let y = 0; y < logicalHeight; y++) {
    for (let x = 0; x < logicalWidth; x++) {
      if (!(x === startLogical[0] && y === startLogical[1])) {
        allNodes.push([x, y]);
      }
    }
  }

  const minDist = Math.max(2, Math.floor((logicalWidth + logicalHeight) / 3));
  const farCandidates = allNodes.filter(([gx, gy]) => {
    const dist = Math.abs(gx - startLogical[0]) + Math.abs(gy - startLogical[1]);
    return dist >= minDist;
  });

  const goalLogical = rng.choice(farCandidates.length > 0 ? farCandidates : allNodes);

  return {
    start: { x: startLogical[0] * 2, y: startLogical[1] * 2 },
    goal: { x: goalLogical[0] * 2, y: goalLogical[1] * 2 },
  };
}

function generateGrowingTree(
  logicalWidth: number,
  logicalHeight: number,
  initialCell: [number, number],
  rng: SeededRandom,
  newestProbability: number
): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();
  const visited = new Set<string>();
  const active: [number, number][] = [];

  const toKey = (cell: [number, number]) => `${cell[0]},${cell[1]}`;

  visited.add(toKey(initialCell));
  active.push(initialCell);

  while (active.length > 0) {
    let activeIndex: number;
    if (rng.next() < newestProbability) {
      activeIndex = active.length - 1;
    } else {
      activeIndex = Math.floor(rng.next() * active.length);
    }
    const current = active[activeIndex];

    const neighbors: [number, number][] = [];
    const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = current[0] + dx;
      const ny = current[1] + dy;
      if (nx >= 0 && nx < logicalWidth && ny >= 0 && ny < logicalHeight) {
        if (!visited.has(toKey([nx, ny]))) {
          neighbors.push([nx, ny]);
        }
      }
    }

    if (neighbors.length === 0) {
      active.splice(activeIndex, 1);
      continue;
    }

    const nextCell = rng.choice(neighbors);
    const currKey = toKey(current);
    const nextKey = toKey(nextCell);

    if (!adjacency.has(currKey)) adjacency.set(currKey, new Set());
    if (!adjacency.has(nextKey)) adjacency.set(nextKey, new Set());

    adjacency.get(currKey)!.add(nextKey);
    adjacency.get(nextKey)!.add(currKey);

    visited.add(nextKey);
    active.push(nextCell);
  }

  return adjacency;
}

export function generateMap(
  physicalWidth: number,
  physicalHeight: number,
  seed?: number
): GeneratedMap {
  const resolvedSeed = seed !== undefined ? seed : Math.floor(Math.random() * 1000000);
  const rng = new SeededRandom(resolvedSeed);

  const logicalWidth = Math.floor((physicalWidth + 1) / 2);
  const logicalHeight = Math.floor((physicalHeight + 1) / 2);

  const { start, goal } = chooseStartGoal(logicalWidth, logicalHeight, rng);

  const startLogical: [number, number] = [start.x / 2, start.y / 2];
  const newestProbability = 0.65;

  const logicalAdjacency = generateGrowingTree(
    logicalWidth,
    logicalHeight,
    startLogical,
    rng,
    newestProbability
  );

  const walkable = new Set<string>();
  const toKey = (x: number, y: number) => `${x},${y}`;

  walkable.add(toKey(startLogical[0] * 2, startLogical[1] * 2));

  for (const [key, neighbors] of logicalAdjacency.entries()) {
    const [cx, cy] = key.split(",").map(Number);
    walkable.add(toKey(cx * 2, cy * 2));
    for (const neighborKey of neighbors) {
      const [nx, ny] = neighborKey.split(",").map(Number);
      walkable.add(toKey(cx * 2, cy * 2));
      walkable.add(toKey(nx * 2, ny * 2));
      walkable.add(toKey(cx + nx, cy + ny));
    }
  }

  const walls: { x: number; y: number }[] = [];
  const mapRows: string[] = [];

  for (let y = 0; y < physicalHeight; y++) {
    let rowStr = "";
    for (let x = 0; x < physicalWidth; x++) {
      if (x === start.x && y === start.y) {
        rowStr += "P";
      } else if (x === goal.x && y === goal.y) {
        rowStr += "G";
      } else if (walkable.has(toKey(x, y))) {
        rowStr += ".";
      } else {
        rowStr += "#";
        walls.push({ x, y });
      }
    }
    mapRows.push(rowStr);
  }

  return {
    map: mapRows,
    walls,
    traps: [],
    rocks: [],
    spikes: [],
    start,
    goal,
  };
}
