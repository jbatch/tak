// src/state/gameContext.tsx

import React, { createContext, useContext, useReducer } from "react";
import { gameReducer, getInitialState } from "./gameReducer";
import { GameState, Position, Stone } from "../types/game";
import { isValidMove } from "@/game/moveValidator";

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
  setDraggedStone: (
    stone: { color: "white" | "black"; isCapstone: boolean } | null
  ) => void;
  // Helper functions
  isValidMove: (from: Position, to: Position) => boolean;
  getCurrentPlayer: () => "white" | "black";
  getSelectedStack: () => { position: Position; index: number } | null;
  selectBankPiece: (
    piece: { color: "white" | "black"; isCapstone: boolean } | null,
    placementMode: boolean
  ) => void;
  exitPlacementMode: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gameReducer, getInitialState(false));

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

  const setDraggedStone = (
    stone: { color: "white" | "black"; isCapstone: boolean } | null
  ) => {
    dispatch({ type: "SET_DRAGGED_STONE", stone });
  };

  const getCurrentPlayer = () => state.currentPlayer;

  const getSelectedStack = () => {
    if (!state.selectedCell || state.selectedStackIndex === null) return null;
    return {
      position: state.selectedCell,
      index: state.selectedStackIndex,
    };
  };

  const selectBankPiece = (
    piece: { color: "white" | "black"; isCapstone: boolean } | null,
    placementMode: boolean = false
  ) => {
    dispatch({ type: "SELECT_BANK_PIECE", piece, placementMode });
  };

  const exitPlacementMode = () => {
    dispatch({ type: "EXIT_PLACEMENT_MODE" });
  };

  const value = {
    state,
    addStone,
    selectStack,
    startMove,
    continueMove,
    cancelMove,
    endTurn,
    setDraggedStone,
    isValidMove: (from: Position, to: Position) => isValidMove(from, to, state),
    getCurrentPlayer,
    getSelectedStack,
    selectBankPiece,
    exitPlacementMode,
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
