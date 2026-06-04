interface Props {
  playerX: number;
  playerY: number;

  direction: "up" | "right" | "down" | "left";

  walls: {
    x: number;
    y: number;
  }[];
}

const SIZE = 10;
const CELL_SIZE = 50;

const getPlayerEmoji = (direction: "up" | "right" | "down" | "left") => {
  switch (direction) {
    case "up":
      return "⬆️";

    case "right":
      return "➡️";

    case "down":
      return "⬇️";

    case "left":
      return "⬅️";
  }
};

export default function GameBoard({
  playerX,
  playerY,
  direction,
  walls,
}: Props) {
  return (
    <div
      className="game-board"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${SIZE}, ${CELL_SIZE}px)`,
      }}
    >
      {Array.from({
        length: SIZE * SIZE,
      }).map((_, index) => {
        const x = index % SIZE;
        const y = Math.floor(index / SIZE);

        const isPlayer = x === playerX && y === playerY;

        const isGoal = x === 6 && y === 1;

        const isWall = walls.some((wall) => wall.x === x && wall.y === y);

        return (
          <div
            key={index}
            className="cell"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          >
            {isPlayer
              ? getPlayerEmoji(direction)
              : isGoal
                ? "🚩"
                : isWall
                  ? "🧱"
                  : ""}
          </div>
        );
      })}
    </div>
  );
}
