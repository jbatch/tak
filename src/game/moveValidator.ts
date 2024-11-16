// src/game/moveValidator.ts
import { GameState, Position, Cell, Stone } from "../types/game";

export const isValidDrop = (
  position: Position,
  stone: Stone,
  board: Cell[][]
): boolean => {
  const targetCell = board[position.y][position.x];

  if (targetCell.pieces.length === 0) return true;

  const targetPiece = targetCell.pieces[targetCell.pieces.length - 1];

  // Can't stack on capstones
  if (targetPiece.isCapstone) return false;

  // Can't stack on standing stones unless we're a capstone
  if (targetPiece.isStanding && !stone.isCapstone) return false;

  return true;
};

export const isValidMove = (
  from: Position,
  to: Position,
  state: GameState
): boolean => {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const board = state.board;

  // Basic bounds checking
  if (to.x < 0 || to.x >= board.length || to.y < 0 || to.y >= board.length) {
    return false;
  }

  if (!state.movingStack) {
    // Initial move validation
    if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) return false;

    const fromCell = board[from.y][from.x];
    const toCell = board[to.y][to.x];

    if (!fromCell.pieces.length || state.selectedStackIndex === null)
      return false;

    const movingPiece = fromCell.pieces[state.selectedStackIndex];

    // Check target cell
    if (toCell.pieces.length > 0) {
      const targetPiece = toCell.pieces[toCell.pieces.length - 1];

      // Can't move onto a capstone
      if (targetPiece.isCapstone) return false;

      // Can't move onto standing stone unless moving a capstone
      if (targetPiece.isStanding && !movingPiece.isCapstone) return false;
    }

    return true;
  }

  // Continuing move validation
  const currentPos = state.movingStack.path[state.movingStack.path.length - 1];
  const direction = state.movingStack.direction;

  // Always allow dropping in current position
  if (currentPos.x === to.x && currentPos.y === to.y) return true;

  // Check next position in the direction of movement
  const isNextPosition = (() => {
    switch (direction) {
      case "up":
        return to.x === currentPos.x && to.y === currentPos.y - 1;
      case "down":
        return to.x === currentPos.x && to.y === currentPos.y + 1;
      case "left":
        return to.y === currentPos.y && to.x === currentPos.x - 1;
      case "right":
        return to.y === currentPos.y && to.x === currentPos.x + 1;
      default:
        return false;
    }
  })();

  if (!isNextPosition) return false;

  // Check for standing stones and capstones in the next position
  const targetCell = board[to.y][to.x];
  if (targetCell.pieces.length > 0) {
    const targetPiece = targetCell.pieces[targetCell.pieces.length - 1];
    const movingPiece = state.movingStack.heldPieces[0];

    // Can't move onto a capstone
    if (targetPiece.isCapstone) return false;

    // Can't move onto standing stone unless moving a capstone
    if (targetPiece.isStanding && !movingPiece.isCapstone) return false;
  }

  return true;
};

// Utility functions that might be needed by multiple components
export const getMoveDirection = (from: Position, to: Position) => {
  if (from.x === to.x) {
    if (to.y === from.y - 1) return "up";
    if (to.y === from.y + 1) return "down";
  }
  if (from.y === to.y) {
    if (to.x === from.x - 1) return "left";
    if (to.x === from.x + 1) return "right";
  }
  return null;
};

export const cloneBoard = (board: Cell[][]): Cell[][] => {
  return board.map((row) =>
    row.map((cell) => ({
      pieces: [...cell.pieces],
    }))
  );
};
