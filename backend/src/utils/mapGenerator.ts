/** โครงสร้างข้อมูลแผนที่เขาวงกตที่ถูกสุ่มสร้างขึ้น */
export interface GeneratedMap {
  seed: number;
  map: string[];
  walls: { x: number; y: number }[];
  traps: { x: number; y: number }[];
  rocks: { x: number; y: number }[];
  spikes: { x: number; y: number }[];
  start: { x: number; y: number };
  goal: { x: number; y: number };
}

/** ตัวสร้างตัวเลขสุ่มแบบกำหนด Seed เพื่อให้ผลลัพธ์การสร้างแผนที่เหมือนเดิมทุกครั้งจาก Seed เดียวกัน */
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

/** สุ่มเลือกจุดเริ่มต้นของผู้เล่นบนขอบเขตของตารางแผนที่ */
function chooseStartNode(
  logicalWidth: number,
  logicalHeight: number,
  rng: SeededRandom
): { startPhysical: { x: number; y: number }; startLogical: [number, number] } {
  const borderEdges: { logical: [number, number]; physical: [number, number] }[] = [];

  for (let y = 0; y < logicalHeight; y++) {
    borderEdges.push({ logical: [0, y], physical: [0, y * 2 + 1] });
    borderEdges.push({ logical: [logicalWidth - 1, y], physical: [logicalWidth * 2, y * 2 + 1] });
  }
  for (let x = 0; x < logicalWidth; x++) {
    borderEdges.push({ logical: [x, 0], physical: [x * 2 + 1, 0] });
    borderEdges.push({ logical: [x, logicalHeight - 1], physical: [x * 2 + 1, logicalHeight * 2] });
  }

  const chosenStart = rng.choice(borderEdges);

  return {
    startPhysical: { x: chosenStart.physical[0], y: chosenStart.physical[1] },
    startLogical: chosenStart.logical,
  };
}

/** ค้นหาตำแหน่งจุดสิ้นสุด (Goal) โดยใช้ระยะทางขั้นต่ำและสูงสุดผ่าน BFS */
function findGoalByDistance(
  startLogical: [number, number],
  adjacency: Map<string, Set<string>>,
  rng: SeededRandom,
  minDist: number,
  maxDist: number
): { x: number; y: number } {
  const toKey = (cell: [number, number]) => `${cell[0]},${cell[1]}`;
  const fromKey = (key: string) => key.split(",").map(Number) as [number, number];

  const distances = new Map<string, number>();
  const queue: [string, number][] = [[toKey(startLogical), 0]];
  distances.set(toKey(startLogical), 0);

  while (queue.length > 0) {
    const [currKey, dist] = queue.shift()!;
    const neighbors = adjacency.get(currKey);
    if (neighbors) {
      for (const nKey of neighbors) {
        if (!distances.has(nKey)) {
          distances.set(nKey, dist + 1);
          queue.push([nKey, dist + 1]);
        }
      }
    }
  }

  const validCandidates: [number, number][] = [];
  let maxDistance = 0;
  let furthestNode: [number, number] | null = null;

  for (const [key, dist] of distances.entries()) {
    if (dist >= minDist && dist <= maxDist) {
      validCandidates.push(fromKey(key));
    }
    if (dist > maxDistance) {
      maxDistance = dist;
      furthestNode = fromKey(key);
    }
  }

  if (validCandidates.length > 0) {
    const chosen = rng.choice(validCandidates);
    return { x: chosen[0] * 2 + 1, y: chosen[1] * 2 + 1 };
  } else if (furthestNode) {
    return { x: furthestNode[0] * 2 + 1, y: furthestNode[1] * 2 + 1 };
  } else {
    return { x: startLogical[0] * 2 + 1, y: startLogical[1] * 2 + 1 };
  }
}

/** สร้างเส้นทางเขาวงกตด้วย Growing Tree Algorithm */
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

/** ค้นหาเส้นทางที่สั้นที่สุดจากจุดเริ่มต้นไปยังเป้าหมายเพื่อป้องกันไม่ให้วางสิ่งกีดขวางทับ */
function findShortestPath(
  start: { x: number; y: number },
  goal: { x: number; y: number },
  walkable: Set<string>
): Set<string> {
  const queue: { x: number; y: number; path: string[] }[] = [
    { x: start.x, y: start.y, path: [`${start.x},${start.y}`] },
  ];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const { x, y, path } = queue.shift()!;
    if (x === goal.x && y === goal.y) {
      return new Set(path);
    }

    const dirs = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;
      if (walkable.has(key) && !visited.has(key)) {
        visited.add(key);
        queue.push({ x: nx, y: ny, path: [...path, key] });
      }
    }
  }
  return new Set();
}

/** สลับตำแหน่งข้อมูลในอาเรย์แบบสุ่ม */
function shuffle<T>(array: T[], rng: SeededRandom): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * ฟังก์ชันหลักในการสร้างแผนที่เขาวงกต 15x15:
 * 1. คำนวณ Logical Grid (7x7) และขยายเป็น Physical Grid (15x15)
 * 2. สุ่มสร้างเส้นทางเขาวงกตและหาตำแหน่ง Goal ที่เหมาะสม
 * 3. หาเส้นทางที่สั้นที่สุด (Optimal Path) เพื่อสงวนไว้เป็นทางเดินที่ปลอดภัย
 * 4. สุ่มวางสิ่งกีดขวาง (หลุมพราง, หิน, หนาม) ในเส้นทางแยกหรือทางตัน
 * 5. ประกอบตารางสตริงและรวบรวมพิกัดอุปสรรคทั้งหมด
 */
export function generateMap(
  physicalWidth: number,
  physicalHeight: number,
  seed?: number
): GeneratedMap {
  const resolvedSeed = seed !== undefined ? seed : Math.floor(Math.random() * 1000000);
  const rng = new SeededRandom(resolvedSeed);

  const logicalWidth = Math.floor((physicalWidth - 1) / 2);
  const logicalHeight = Math.floor((physicalHeight - 1) / 2);

  const { startPhysical, startLogical } = chooseStartNode(logicalWidth, logicalHeight, rng);

  const newestProbability = 0.65;

  const logicalAdjacency = generateGrowingTree(
    logicalWidth,
    logicalHeight,
    startLogical,
    rng,
    newestProbability
  );

  const goalPhysical = findGoalByDistance(startLogical, logicalAdjacency, rng, 12, 15);

  const walkable = new Set<string>();
  const toKey = (x: number, y: number) => `${x},${y}`;

  walkable.add(toKey(startPhysical.x, startPhysical.y));
  walkable.add(toKey(startLogical[0] * 2 + 1, startLogical[1] * 2 + 1));

  for (const [key, neighbors] of logicalAdjacency.entries()) {
    const [cx, cy] = key.split(",").map(Number);
    const px = cx * 2 + 1;
    const py = cy * 2 + 1;
    walkable.add(toKey(px, py));
    for (const neighborKey of neighbors) {
      const [nx, ny] = neighborKey.split(",").map(Number);
      walkable.add(toKey(nx * 2 + 1, ny * 2 + 1));
      walkable.add(toKey(cx + nx + 1, cy + ny + 1));
    }
  }

  // กำหนดตำแหน่งสิ่งกีดขวาง โดยไม่วางทับเส้นทางที่สั้นที่สุดและช่องรอบจุดเกิด
  const startKey = toKey(startPhysical.x, startPhysical.y);
  const goalKey = toKey(goalPhysical.x, goalPhysical.y);
  const pathSet = findShortestPath(startPhysical, goalPhysical, walkable);

  const startNeighbors = new Set<string>();
  const dirs = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];
  for (const [dx, dy] of dirs) {
    startNeighbors.add(toKey(startPhysical.x + dx, startPhysical.y + dy));
  }

  const candidates = Array.from(walkable).filter((key) => {
    return (
      key !== startKey &&
      key !== goalKey &&
      !pathSet.has(key) &&
      !startNeighbors.has(key)
    );
  });

  const shuffledCandidates = shuffle(candidates, rng);

  // คำนวณจำนวนสิ่งกีดขวางแต่ละประเภทตามพื้นที่ทางตันที่ว่างอยู่
  const numTraps = Math.min(3, Math.floor(shuffledCandidates.length / 3));
  const numRocks = Math.min(3, Math.floor(shuffledCandidates.length / 3));
  const numSpikes = Math.min(3, Math.floor(shuffledCandidates.length / 3));

  const trapsKeys = shuffledCandidates.slice(0, numTraps);
  const rocksKeys = shuffledCandidates.slice(numTraps, numTraps + numRocks);
  const spikesKeys = shuffledCandidates.slice(
    numTraps + numRocks,
    numTraps + numRocks + numSpikes
  );

  const keyToCoord = (key: string) => {
    const [x, y] = key.split(",").map(Number);
    return { x, y };
  };

  const traps = trapsKeys.map(keyToCoord);
  const rocks = rocksKeys.map(keyToCoord);
  const spikes = spikesKeys.map(keyToCoord);

  const trapsSet = new Set(trapsKeys);
  const rocksSet = new Set(rocksKeys);
  const spikesSet = new Set(spikesKeys);

  const walls: { x: number; y: number }[] = [];
  const mapRows: string[] = [];

  for (let y = 0; y < physicalHeight; y++) {
    let rowStr = "";
    for (let x = 0; x < physicalWidth; x++) {
      const key = toKey(x, y);
      if (x === startPhysical.x && y === startPhysical.y) {
        rowStr += "P";
      } else if (x === goalPhysical.x && y === goalPhysical.y) {
        rowStr += "G";
      } else if (trapsSet.has(key)) {
        rowStr += "T";
      } else if (rocksSet.has(key)) {
        rowStr += "R";
      } else if (spikesSet.has(key)) {
        rowStr += "S";
      } else if (walkable.has(key)) {
        rowStr += ".";
      } else {
        rowStr += "#";
        walls.push({ x, y });
      }
    }
    mapRows.push(rowStr);
  }

  return {
    seed: resolvedSeed,
    map: mapRows,
    walls,
    traps,
    rocks,
    spikes,
    start: startPhysical,
    goal: goalPhysical,
  };
}
