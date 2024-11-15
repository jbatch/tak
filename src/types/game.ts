// src/types/game.ts
export interface Position {
  x: number;
  y: number;
}
export type Direction = "up" | "down" | "left" | "right";

export interface MovingStack {
  pieces: Stone[];
  direction: Direction;
  path: Position[]; // Stores the cells we've moved through
  heldPieces: Stone[]; // Pieces still being carried
}

export interface Stone {
  color: "white" | "black";
  isCapstone: boolean;
  isStanding: boolean;
}

export interface Cell {
  pieces: Stone[];
}

export interface GameState {
  board: Cell[][];
  currentPlayer: "white" | "black";
  selectedCell: { x: number; y: number } | null;
  selectedStackIndex: number | null;
  whiteCapstones: number;
  blackCapstones: number;
  whiteStones: number;
  blackStones: number;
  movingStack: MovingStack | null;
}
