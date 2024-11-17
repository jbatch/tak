// src/game/winConditions.ts
import {
  Cell,
  PlayerColor,
  Stone,
  TerritoryCount,
  WinState,
} from "../types/game";

interface ConnectedGroup {
  cells: Set<string>;
  topEdge: boolean;
  bottomEdge: boolean;
  leftEdge: boolean;
  rightEdge: boolean;
}

const serializePosition = (x: number, y: number): string => `${x},${y}`;

const isRoadPiece = (stone: Stone): boolean => {
  return !stone.isStanding; // Both flat stones and capstones count for roads
};

const getTopPiece = (cell: Cell): Stone | null => {
  return cell.pieces.length > 0 ? cell.pieces[cell.pieces.length - 1] : null;
};

const findConnectedGroup = (
  board: Cell[][],
  startX: number,
  startY: number,
  color: PlayerColor,
  visited: Set<string> = new Set()
): ConnectedGroup => {
  const boardSize = board.length;
  const group: ConnectedGroup = {
    cells: new Set(),
    topEdge: false,
    bottomEdge: false,
    leftEdge: false,
    rightEdge: false,
  };

  const stack: [number, number][] = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const posKey = serializePosition(x, y);

    if (visited.has(posKey)) continue;

    const cell = board[y][x];
    const topPiece = getTopPiece(cell);
    if (!topPiece || topPiece.color !== color || !isRoadPiece(topPiece))
      continue;

    visited.add(posKey);
    group.cells.add(posKey);

    // Update edge flags
    if (x === 0) group.leftEdge = true;
    if (x === boardSize - 1) group.rightEdge = true;
    if (y === 0) group.topEdge = true;
    if (y === boardSize - 1) group.bottomEdge = true;

    // Check adjacent cells
    const directions = [
      [-1, 0], // left
      [1, 0], // right
      [0, -1], // up
      [0, 1], // down
    ];

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      if (
        newX >= 0 &&
        newX < boardSize &&
        newY >= 0 &&
        newY < boardSize &&
        !visited.has(serializePosition(newX, newY))
      ) {
        stack.push([newX, newY]);
      }
    }
  }

  return group;
};

const countTerritory = (board: Cell[][]): TerritoryCount => {
  const count: TerritoryCount = { white: 0, black: 0 };

  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board.length; x++) {
      const cell = board[y][x];
      if (cell.pieces.length > 0) {
        const topPiece = getTopPiece(cell);
        if (topPiece && isRoadPiece(topPiece)) {
          // Only count flat stones and capstones
          if (topPiece.color === "white") {
            count.white++;
          } else {
            count.black++;
          }
        }
      }
    }
  }

  return count;
};

const shouldCheckFlatWin = (
  board: Cell[][],
  whiteStones: number,
  blackStones: number,
  whiteCapstones: number,
  blackCapstones: number
): boolean => {
  // Check if board is full
  const isBoardFull = board.every((row) =>
    row.every((cell) => cell.pieces.length > 0)
  );

  // Check if either player has no pieces left
  const whiteNoMorePieces = whiteStones === 0 && whiteCapstones === 0;
  const blackNoMorePieces = blackStones === 0 && blackCapstones === 0;

  return isBoardFull || whiteNoMorePieces || blackNoMorePieces;
};

export const checkWinCondition = (
  board: Cell[][],
  whiteStones: number = 0,
  blackStones: number = 0,
  whiteCapstones: number = 0,
  blackCapstones: number = 0
): WinState | null => {
  // First check for road wins
  const roadWinner = checkRoadWin(board);
  if (roadWinner) {
    const territory = countTerritory(board);
    return {
      player: roadWinner,
      condition: "road",
      territory,
    };
  }

  // Check if we should evaluate flat win conditions
  if (
    shouldCheckFlatWin(
      board,
      whiteStones,
      blackStones,
      whiteCapstones,
      blackCapstones
    )
  ) {
    const territory = countTerritory(board);
    const player =
      territory.white > territory.black
        ? "white"
        : territory.black > territory.white
        ? "black"
        : "draw";
    return { player, condition: "flat", territory };
  }

  return null;
};

const checkRoadWin = (board: Cell[][]): PlayerColor | null => {
  const boardSize = board.length;
  const visited: Set<string> = new Set();

  for (const color of ["white", "black"] as PlayerColor[]) {
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const cell = board[y][x];
        const topPiece = getTopPiece(cell);
        if (
          !topPiece ||
          topPiece.color !== color ||
          !isRoadPiece(topPiece) ||
          visited.has(serializePosition(x, y))
        ) {
          continue;
        }

        const group = findConnectedGroup(board, x, y, color, visited);

        if (
          (group.topEdge && group.bottomEdge) ||
          (group.leftEdge && group.rightEdge)
        ) {
          return color;
        }
      }
    }
  }

  return null;
};
