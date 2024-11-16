// src/game/winConditions.ts
import { Cell, Stone } from "../types/game";

type PlayerColor = "white" | "black";

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

export const checkWinCondition = (
  board: Cell[][]
): PlayerColor | "draw" | null => {
  const boardSize = board.length;
  const visited: Set<string> = new Set();

  // Check for road wins
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

        // Check for vertical or horizontal connection
        if (
          (group.topEdge && group.bottomEdge) ||
          (group.leftEdge && group.rightEdge)
        ) {
          return color;
        }
      }
    }
  }

  // Check for draw (board is full)
  let isBoardFull = true;
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (board[y][x].pieces.length === 0) {
        isBoardFull = false;
        break;
      }
    }
    if (!isBoardFull) break;
  }

  return isBoardFull ? "draw" : null;
};
