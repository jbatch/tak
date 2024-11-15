// src/types/game.ts

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
  whiteCapstones: number;
  blackCapstones: number;
  whiteStones: number;
  blackStones: number;
}
