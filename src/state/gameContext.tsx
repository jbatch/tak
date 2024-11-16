// src/state/gameContext.tsx

import React, { createContext, useContext, useReducer } from "react";
import { gameReducer, getInitialState } from "./gameReducer";
import { GameState, Position, Stone } from "../types/game";

type GameContextType = {
  state: GameState;
  addStone: (position: Position, stone: Stone) => void;
  selectStack: (
    position: Position | undefined,
    stackIndex: number | null
  ) => void;
  startMove: (from: Position, to: Position, stackIndex: number) => void;
  continueMove: (to: Position) => void;
  cancelMove: () => void;
  endTurn: () => void;
  // Helper functions
  isValidMove: (from: Position, to: Position) => boolean;
  getCurrentPlayer: () => "white" | "black";
  getSelectedStack: () => { position: Position; index: number } | null;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gameReducer, getInitialState(true));

  const addStone = (position: Position, stone: Stone) => {
    dispatch({ type: "ADD_STONE", position, stone });
  };

  const selectStack = (
    position: Position | undefined,
    stackIndex: number | null
  ) => {
    dispatch({ type: "SELECT_STACK", position, stackIndex });
  };

  const startMove = (from: Position, to: Position, stackIndex: number) => {
    dispatch({ type: "START_MOVE", from, to, stackIndex });
  };

  const continueMove = (to: Position) => {
    dispatch({ type: "CONTINUE_MOVE", to });
  };

  const cancelMove = () => {
    dispatch({ type: "CANCEL_MOVE" });
  };

  const endTurn = () => {
    dispatch({ type: "END_TURN" });
  };

  const isValidMove = (from: Position, to: Position): boolean => {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    // Basic bounds checking
    if (to.x < 0 || to.x >= 5 || to.y < 0 || to.y >= 5) return false;

    if (state.movingStack) {
      const { direction, heldPieces } = state.movingStack;
      const lastPos = state.movingStack.path[state.movingStack.path.length - 1];

      // Allow dropping in current position
      if (lastPos.x === to.x && lastPos.y === to.y) return true;

      // Check basic direction constraints first
      const isValidDirection =
        (direction === "up" && to.y === lastPos.y - 1 && to.x === lastPos.x) ||
        (direction === "down" &&
          to.y === lastPos.y + 1 &&
          to.x === lastPos.x) ||
        (direction === "left" &&
          to.x === lastPos.x - 1 &&
          to.y === lastPos.y) ||
        (direction === "right" && to.x === lastPos.x + 1 && to.y === lastPos.y);

      if (!isValidDirection) return false;

      // If direction is valid, check target cell compatibility
      const targetCell = state.board[to.y][to.x];
      if (targetCell.pieces.length > 0) {
        const movingPiece = heldPieces[0]; // The next piece to be placed
        const targetPiece = targetCell.pieces[targetCell.pieces.length - 1];

        // Can't move onto standing stone or capstone unless moving a capstone
        if (
          (targetPiece.isStanding || targetPiece.isCapstone) &&
          !movingPiece.isCapstone
        ) {
          return false;
        }
      }

      return true;
    }

    // Initial move validation...
    if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) return false;

    // Check if there's a stack selected
    if (!state.selectedCell || state.selectedStackIndex === null) return false;

    // Get the moving piece and target cell
    const fromCell = state.board[state.selectedCell.y][state.selectedCell.x];
    const toCell = state.board[to.y][to.x];

    if (!fromCell.pieces.length) return false;

    const movingPiece = fromCell.pieces[state.selectedStackIndex];

    // If target cell is empty, move is valid
    if (!toCell.pieces.length) return true;

    // Check standing stones and capstones
    const targetPiece = toCell.pieces[toCell.pieces.length - 1];
    if (
      (targetPiece.isStanding || targetPiece.isCapstone) &&
      !movingPiece.isCapstone
    ) {
      return false;
    }

    return true;
  };

  const getCurrentPlayer = () => state.currentPlayer;

  const getSelectedStack = () => {
    if (!state.selectedCell || state.selectedStackIndex === null) return null;
    return {
      position: state.selectedCell,
      index: state.selectedStackIndex,
    };
  };

  const value = {
    state,
    addStone,
    selectStack,
    startMove,
    continueMove,
    cancelMove,
    endTurn,
    isValidMove,
    getCurrentPlayer,
    getSelectedStack,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Create the custom hook
// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
