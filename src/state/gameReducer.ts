// src/state/gameReducer.ts

import {
  GameState,
  Stone,
  Position,
  Cell,
  Direction,
  MovingStack,
} from "../types/game";

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
  | { type: "END_TURN" };

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

const getInitialState = (): GameState => ({
  board: createInitialBoard(5),
  currentPlayer: "white",
  selectedCell: null,
  selectedStackIndex: null,
  whiteCapstones: 1,
  blackCapstones: 1,
  whiteStones: 21,
  blackStones: 21,
  movingStack: null,
});

// Deep clone the board
const cloneBoard = (board: Cell[][]): Cell[][] => {
  return board.map((row) =>
    row.map((cell) => ({
      pieces: [...cell.pieces],
    }))
  );
};

// Get move direction from positions
const getMoveDirection = (from: Position, to: Position): Direction | null => {
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

// Validate move based on direction and board state
const isValidMove = (
  from: Position,
  to: Position,
  board: Cell[][],
  movingStack: MovingStack | null,
  selectedStackIndex: number | null
): boolean => {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);

  if (!movingStack) {
    // Initial move validation
    if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) return false;

    const fromCell = board[from.y][from.x];
    const toCell = board[to.y][to.x];

    if (toCell.pieces.length > 0) {
      const movingPiece = fromCell.pieces[selectedStackIndex ?? 0];
      const targetPiece = toCell.pieces[toCell.pieces.length - 1];

      if (
        (targetPiece.isStanding || targetPiece.isCapstone) &&
        !movingPiece.isCapstone
      ) {
        return false;
      }
    }

    return true;
  }

  // Continuing move validation
  const currentPos = movingStack.path[movingStack.path.length - 1];

  // Allow dropping in current position
  if (currentPos.x === to.x && currentPos.y === to.y) return true;

  const direction = movingStack.direction;

  // Check direction constraints
  const validDirection =
    direction === "up" || direction === "down"
      ? dx === 0 &&
        dy === 1 &&
        (direction === "up" ? to.y < currentPos.y : to.y > currentPos.y)
      : dy === 0 &&
        dx === 1 &&
        (direction === "left" ? to.x < currentPos.x : to.x > currentPos.x);

  if (!validDirection) return false;

  // Check for standing stones and capstones
  const movingPiece = movingStack.heldPieces[movingStack.heldPieces.length - 1];
  const targetCell = board[to.y][to.x];

  if (targetCell.pieces.length > 0) {
    const targetPiece = targetCell.pieces[targetCell.pieces.length - 1];
    if (
      (targetPiece.isStanding || targetPiece.isCapstone) &&
      !movingPiece.isCapstone
    ) {
      return false;
    }
  }

  return true;
};

// The complete reducer
export const gameReducer = (
  state: GameState,
  action: GameAction
): GameState => {
  console.log("Action", { action });
  switch (action.type) {
    case "ADD_STONE": {
      const { position, stone } = action;
      const newBoard = cloneBoard(state.board);
      newBoard[position.y][position.x].pieces.push(stone);

      return {
        ...state,
        board: newBoard,
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
      };
    }

    case "SELECT_STACK": {
      const { position, stackIndex } = action;

      // If no position, clear selection
      if (!position) {
        return {
          ...state,
          selectedCell: null,
          selectedStackIndex: null,
          movingStack: null,
        };
      }

      const cell = state.board[position.y][position.x];
      const topPiece = cell.pieces[cell.pieces.length - 1];

      // Only allow selection of current player's pieces
      if (topPiece?.color === state.currentPlayer) {
        return {
          ...state,
          selectedCell: position,
          selectedStackIndex: stackIndex,
        };
      }

      return state;
    }

    case "START_MOVE": {
      const { from, to, stackIndex } = action;

      if (!isValidMove(from, to, state.board, null, stackIndex)) {
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
        return {
          ...state,
          board: newBoard,
          selectedCell: null,
          selectedStackIndex: null,
          movingStack: null,
          currentPlayer: state.currentPlayer === "white" ? "black" : "white",
        };
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
      if (!state.movingStack) return state;

      const { path, heldPieces } = state.movingStack;
      const lastPos = path[path.length - 1];

      if (!isValidMove(lastPos, to, state.board, state.movingStack, null)) {
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
          return {
            ...state,
            board: newBoard,
            movingStack: null,
            selectedCell: null,
            selectedStackIndex: null,
            currentPlayer: state.currentPlayer === "white" ? "black" : "white",
          };
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
        return {
          ...state,
          board: newBoard,
          movingStack: null,
          selectedCell: null,
          selectedStackIndex: null,
          currentPlayer: state.currentPlayer === "white" ? "black" : "white",
        };
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

    case "END_TURN": {
      return {
        ...state,
        currentPlayer: state.currentPlayer === "white" ? "black" : "white",
        selectedCell: null,
        selectedStackIndex: null,
        movingStack: null,
      };
    }

    default:
      return state;
  }
};

export { getInitialState };
