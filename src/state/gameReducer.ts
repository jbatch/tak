// src/state/gameReducer.ts

import { GameState, Stone, Position, Cell } from "../types/game";
import { checkWinCondition } from "../game/winCondition";
import {
  cloneBoard,
  getMoveDirection,
  isValidMove,
} from "@/game/moveValidator";

// Expanded action types to include all the necessary move data
type GameAction =
  | { type: "ADD_STONE"; position: Position; stone: Stone }
  | {
      type: "SELECT_STACK";
      position: Position | undefined;
      stackIndex: number | null;
    }
  | { type: "START_MOVE"; from: Position; to: Position; stackIndex: number }
  | { type: "CONTINUE_MOVE"; to: Position }
  | { type: "CANCEL_MOVE" }
  | { type: "RESET_GAME" }
  | { type: "RESET_GAME" }
  | { type: "END_TURN" }
  | {
      type: "SET_DRAGGED_STONE";
      stone: { color: "white" | "black"; isCapstone: boolean } | null;
    };

// Helper functions
const createInitialBoard = (size: number): Cell[][] => {
  return Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => ({ pieces: [] }))
    );
};

const getInitialState = (testing: boolean = false): GameState => {
  const newState: GameState = {
    board: createInitialBoard(5),
    currentPlayer: "white",
    selectedCell: null,
    selectedStackIndex: null,
    whiteCapstones: 1,
    blackCapstones: 1,
    whiteStones: 21,
    blackStones: 21,
    movingStack: null,
    winner: null,
    draggedStone: null,
    whiteFirstMoveDone: false,
    blackFirstMoveDone: false,
  };
  if (testing) {
    newState.board[0][1].pieces = [
      { color: "white", isStanding: false, isCapstone: false },
    ];
    newState.board[2][1].pieces = [
      { color: "white", isStanding: false, isCapstone: false },
    ];
    newState.board[3][1].pieces = [
      { color: "white", isStanding: false, isCapstone: false },
    ];
    newState.board[4][1].pieces = [
      { color: "white", isStanding: false, isCapstone: false },
    ];

    newState.board[1][4].pieces = [
      { color: "black", isStanding: false, isCapstone: false },
      { color: "black", isStanding: false, isCapstone: false },
      { color: "white", isStanding: false, isCapstone: false },
      { color: "black", isStanding: false, isCapstone: false },
    ];
  }
  return newState;
};

const checkAndUpdateWinner = (state: GameState): GameState => {
  const winner = checkWinCondition(
    state.board,
    state.whiteStones,
    state.blackStones,
    state.whiteCapstones,
    state.blackCapstones
  );
  if (winner) {
    return {
      ...state,
      winner,
      selectedCell: null,
      selectedStackIndex: null,
      movingStack: null,
    };
  }
  return state;
};

// The complete reducer
export const gameReducer = (
  state: GameState,
  action: GameAction
): GameState => {
  if (state.winner && action.type !== "RESET_GAME") {
    return state;
  }
  switch (action.type) {
    case "ADD_STONE": {
      const { position, stone } = action;

      // Can't place stones during a move
      if (state.movingStack) return state;

      const isFirstMove =
        state.currentPlayer === "white"
          ? !state.whiteFirstMoveDone
          : !state.blackFirstMoveDone;

      if (isFirstMove) {
        // Must place opponent's stone flat
        if (
          stone.color === state.currentPlayer ||
          stone.isStanding ||
          stone.isCapstone
        ) {
          return state;
        }
      } else {
        // After first move, can only place your own stones
        if (stone.color !== state.currentPlayer) return state;
      }

      const targetCell = state.board[position.y][position.x];
      if (targetCell.pieces.length > 0) return state;

      if (stone.color === "white") {
        if (stone.isCapstone && state.whiteCapstones <= 0) return state;
        if (!stone.isCapstone && state.whiteStones <= 0) return state;
      } else {
        if (stone.isCapstone && state.blackCapstones <= 0) return state;
        if (!stone.isCapstone && state.blackStones <= 0) return state;
      }

      const newBoard = cloneBoard(state.board);
      newBoard[position.y][position.x].pieces.push(stone);

      const newState: GameState = {
        ...state,
        board: newBoard,
        // Only decrement stone counts after first move
        whiteCapstones:
          stone.color === "white" && stone.isCapstone
            ? state.whiteCapstones - 1
            : state.whiteCapstones,
        whiteStones:
          stone.color === "white" && !stone.isCapstone
            ? state.whiteStones - 1
            : state.whiteStones,
        blackCapstones:
          stone.color === "black" && stone.isCapstone
            ? state.blackCapstones - 1
            : state.blackCapstones,
        blackStones:
          stone.color === "black" && !stone.isCapstone
            ? state.blackStones - 1
            : state.blackStones,
        whiteFirstMoveDone:
          state.currentPlayer === "white" ? true : state.whiteFirstMoveDone,
        blackFirstMoveDone:
          state.currentPlayer === "black" ? true : state.blackFirstMoveDone,
        currentPlayer: state.currentPlayer === "white" ? "black" : "white",
      };
      return checkAndUpdateWinner(newState);
    }

    case "SELECT_STACK": {
      const { position, stackIndex } = action;

      // If canceling selection
      if (!position || stackIndex === null) {
        return {
          ...state,
          selectedCell: null,
          selectedStackIndex: null,
          movingStack: null,
        };
      }

      // Can't select during a move
      if (state.movingStack) return state;

      const cell = state.board[position.y][position.x];
      if (!cell.pieces.length) return state;

      const topPiece = cell.pieces[cell.pieces.length - 1];

      // Can only select current player's pieces
      if (topPiece.color !== state.currentPlayer) return state;

      return {
        ...state,
        selectedCell: position,
        selectedStackIndex: stackIndex,
      };
    }

    case "START_MOVE": {
      const { from, to, stackIndex } = action;

      if (
        !isValidMove(from, to, { ...state, selectedStackIndex: stackIndex })
      ) {
        return state;
      }

      const direction = getMoveDirection(from, to);
      if (!direction) return state;

      const newBoard = cloneBoard(state.board);
      const fromCell = newBoard[from.y][from.x];
      const toCell = newBoard[to.y][to.x];

      // Get moving pieces
      const movingPieces = fromCell.pieces.slice(stackIndex);
      fromCell.pieces = fromCell.pieces.slice(0, stackIndex);

      // Handle first piece placement
      const droppedPiece = movingPieces.shift()!;

      // Handle standing stones
      if (toCell.pieces.length > 0) {
        const topPiece = toCell.pieces[toCell.pieces.length - 1];
        if (topPiece.isStanding) {
          topPiece.isStanding = false;
        }
      }

      toCell.pieces.push(droppedPiece);

      // If no more pieces to move, end the move
      if (movingPieces.length === 0) {
        const newState: GameState = {
          ...state,
          board: newBoard,
          selectedCell: null,
          selectedStackIndex: null,
          movingStack: null,
          currentPlayer: state.currentPlayer === "white" ? "black" : "white",
        };
        return checkAndUpdateWinner(newState);
      }

      // Create moving stack state for continued movement
      return {
        ...state,
        board: newBoard,
        movingStack: {
          pieces: movingPieces,
          direction,
          path: [from, to],
          heldPieces: movingPieces,
          initialBoard: state.board,
        },
      };
    }

    case "CONTINUE_MOVE": {
      const { to } = action;

      if (!state.movingStack) {
        // If no moving stack but we have a selection, start a new move
        if (state.selectedCell && state.selectedStackIndex !== null) {
          return gameReducer(state, {
            type: "START_MOVE",
            from: state.selectedCell,
            to,
            stackIndex: state.selectedStackIndex,
          });
        }
        return state;
      }

      const { path, heldPieces } = state.movingStack;
      const lastPos = path[path.length - 1];

      if (!isValidMove(state.selectedCell!, to, state)) {
        return state;
      }

      const newBoard = cloneBoard(state.board);
      const currentCell = newBoard[to.y][to.x];

      // Handle dropping on current position
      if (to.x === lastPos.x && to.y === lastPos.y) {
        if (heldPieces.length === 0) return state;

        const droppedPiece = heldPieces[0];
        currentCell.pieces.push(droppedPiece);
        const newHeldPieces = heldPieces.slice(1);

        // If no more pieces to move, end the move
        if (newHeldPieces.length === 0) {
          const newState: GameState = {
            ...state,
            board: newBoard,
            movingStack: null,
            selectedCell: null,
            selectedStackIndex: null,
            currentPlayer: state.currentPlayer === "white" ? "black" : "white",
          };
          return checkAndUpdateWinner(newState);
        }

        return {
          ...state,
          board: newBoard,
          movingStack: {
            ...state.movingStack,
            heldPieces: newHeldPieces,
          },
        };
      }

      // Handle moving to a new position
      const droppedPiece = heldPieces[0];

      // Handle standing stones
      if (currentCell.pieces.length > 0) {
        const topPiece = currentCell.pieces[currentCell.pieces.length - 1];
        if (topPiece.isStanding) {
          topPiece.isStanding = false;
        }
      }

      currentCell.pieces.push(droppedPiece);
      const newHeldPieces = heldPieces.slice(1);

      // If no more pieces to move, end the move
      if (newHeldPieces.length === 0) {
        const newState: GameState = {
          ...state,
          board: newBoard,
          movingStack: null,
          selectedCell: null,
          selectedStackIndex: null,
          currentPlayer: state.currentPlayer === "white" ? "black" : "white",
        };
        return checkAndUpdateWinner(newState);
      }

      return {
        ...state,
        board: newBoard,
        movingStack: {
          ...state.movingStack,
          path: [...path, to],
          heldPieces: newHeldPieces,
        },
      };
    }

    case "CANCEL_MOVE": {
      if (!state.movingStack) return state;

      return {
        ...state,
        board: state.movingStack.initialBoard,
        selectedCell: null,
        selectedStackIndex: null,
        movingStack: null,
      };
    }
    case "RESET_GAME": {
      return getInitialState();
    }

    case "END_TURN": {
      return {
        ...state,
        currentPlayer: state.currentPlayer === "white" ? "black" : "white",
        selectedCell: null,
        selectedStackIndex: null,
        movingStack: null,
      };
    }

    case "SET_DRAGGED_STONE":
      return {
        ...state,
        draggedStone: action.stone,
      };

    default:
      return state;
  }
};

export { getInitialState };
