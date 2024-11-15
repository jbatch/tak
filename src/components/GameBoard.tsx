// src/components/GameBoard.tsx
import React from "react";
import { Direction, GameState, Position, Stone } from "../types/game";
import { BoardCell } from "./BoardCell";
import { PieceBank } from "./PieceBank";

interface GameBoardProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  setGameState,
}) => {
  const handleStackSelect = (
    pos: Position | undefined,
    stackIndex: number | null
  ) => {
    console.log("handleStackSelect", { pos, stackIndex });
    // If pos is undefined, we're canceling the selection
    if (!pos) {
      setGameState({
        ...gameState,
        selectedCell: null,
        selectedStackIndex: null,
      });
      return;
    }

    // Only allow selection if it's the current player's piece on top
    const cell = gameState.board[pos.y][pos.x];
    const topPiece = cell.pieces[cell.pieces.length - 1];
    console.log({ cell, topPiece, player: gameState.currentPlayer });

    if (topPiece.color === gameState.currentPlayer) {
      console.log("SET");
      setGameState({
        ...gameState,
        selectedCell: pos,
        selectedStackIndex: stackIndex,
      });
    }
  };

  const isValidMove = (from: Position, to: Position): boolean => {
    // If we're in the middle of a move, check from the current stack position
    if (gameState.movingStack) {
      const currentPos =
        gameState.movingStack.path[gameState.movingStack.path.length - 1];
      const dx = Math.abs(to.x - currentPos.x);
      const dy = Math.abs(to.y - currentPos.y);

      // Must continue in the same direction
      const direction = gameState.movingStack.direction;
      if (direction === "up" || direction === "down") {
        return (
          dx === 0 &&
          dy === 1 &&
          (direction === "up" ? to.y < currentPos.y : to.y > currentPos.y)
        );
      } else {
        return (
          dy === 0 &&
          dx === 1 &&
          (direction === "left" ? to.x < currentPos.x : to.x > currentPos.x)
        );
      }
    }

    // Initial move validation (not in the middle of a move)
    if (!gameState.selectedCell) return false;

    // Check if the move is to an adjacent square
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    // Only allow moving to directly adjacent squares (not diagonally)
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  };

  const handlePieceDrop = (x: number, y: number, stone: Stone) => {
    const newState = { ...gameState };
    newState.board[y][x].pieces.push(stone);

    if (stone.color === "white") {
      if (stone.isCapstone) {
        newState.whiteCapstones--;
      } else {
        newState.whiteStones--;
      }
    } else {
      if (stone.isCapstone) {
        newState.blackCapstones--;
      } else {
        newState.blackStones--;
      }
    }

    setGameState(newState);
  };

  const getValidMoveDirection = (
    from: Position,
    to: Position
  ): Direction | null => {
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

  const handleStackMove = (to: Position) => {
    if (!gameState.selectedCell || gameState.selectedStackIndex === null)
      return;

    // If this is the start of a move
    if (!gameState.movingStack) {
      const direction = getValidMoveDirection(gameState.selectedCell, to);
      if (!direction) return;

      // Create a new board to avoid direct mutations
      const newBoard = [
        ...gameState.board.map((row) => [
          ...row.map((cell) => ({ ...cell, pieces: [...cell.pieces] })),
        ]),
      ];

      // Get references to the cells in our new board
      const fromCell =
        newBoard[gameState.selectedCell.y][gameState.selectedCell.x];
      const toCell = newBoard[to.y][to.x];

      // Get the pieces we're moving
      const movingPieces = fromCell.pieces.slice(gameState.selectedStackIndex);

      // Remove the pieces from the source cell
      fromCell.pieces = fromCell.pieces.slice(0, gameState.selectedStackIndex);

      // Drop one piece in the first cell
      const droppedPiece = movingPieces.pop()!;

      // Handle standing stones
      if (toCell.pieces.length > 0) {
        const topPiece = toCell.pieces[toCell.pieces.length - 1];
        if (topPiece.isStanding || topPiece.isCapstone) {
          if (!droppedPiece.isCapstone) return; // Can't move here
          topPiece.isStanding = false;
        }
      }

      // Add the first piece to the target cell
      toCell.pieces.push(droppedPiece);

      setGameState({
        ...gameState,
        board: newBoard,
        movingStack: {
          pieces: movingPieces,
          direction,
          path: [gameState.selectedCell, to],
          heldPieces: movingPieces,
        },
      });
      return;
    }

    // Continuing an existing move
    const { direction, path, heldPieces } = gameState.movingStack;
    const lastPos = path[path.length - 1];

    // Validate move direction
    const newDirection = getValidMoveDirection(lastPos, to);
    if (newDirection !== direction) return;

    // Create a new board for this move
    const newBoard = [
      ...gameState.board.map((row) => [
        ...row.map((cell) => ({ ...cell, pieces: [...cell.pieces] })),
      ]),
    ];

    // Drop at least one piece
    const droppedPiece = heldPieces[heldPieces.length - 1];
    const toCell = newBoard[to.y][to.x];
    toCell.pieces.push(droppedPiece);

    // Remove the dropped piece from held pieces
    const newHeldPieces = heldPieces.slice(0, -1);

    // If we have no more pieces, end the move
    if (newHeldPieces.length === 0) {
      setGameState({
        ...gameState,
        board: newBoard,
        movingStack: null,
        selectedCell: null,
        selectedStackIndex: null,
        currentPlayer: gameState.currentPlayer === "white" ? "black" : "white",
      });
      return;
    }

    // Continue the move
    setGameState({
      ...gameState,
      board: newBoard,
      movingStack: {
        ...gameState.movingStack,
        path: [...path, to],
        heldPieces: newHeldPieces,
      },
    });
  };

  const isInMovePath = (pos: Position): boolean => {
    if (!gameState.movingStack) return false;
    return gameState.movingStack.path.some(
      (p) => p.x === pos.x && p.y === pos.y
    );
  };

  return (
    <div className="flex items-center justify-center gap-8">
      <PieceBank
        color="white"
        stones={gameState.whiteStones}
        capstones={gameState.whiteCapstones}
        isCurrentPlayer={gameState.currentPlayer === "white"}
      />

      <div className="relative">
        <div className="absolute -top-8 left-0 right-0 flex justify-around px-10">
          {["A", "B", "C", "D", "E"].map((letter) => (
            <div
              key={letter}
              className="w-8 text-center font-semibold text-gray-600"
            >
              {letter}
            </div>
          ))}
        </div>

        <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-around py-2">
          {[1, 2, 3, 4, 5].map((number) => (
            <div
              key={number}
              className="h-8 flex items-center font-semibold text-gray-600"
            >
              {number}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-0 w-fit mx-auto bg-amber-900 p-1 shadow-lg rounded">
          {gameState.board.map((row, y) =>
            row.map((cell, x) => {
              const pos = { x, y };
              const isSelected =
                gameState.selectedCell?.x === x &&
                gameState.selectedCell?.y === y;
              const isValidMoveTarget = gameState.selectedCell
                ? isValidMove(gameState.selectedCell, pos)
                : false;

              return (
                <BoardCell
                  key={`${x}-${y}`}
                  cell={cell}
                  position={pos}
                  onDrop={handlePieceDrop}
                  onStackSelect={handleStackSelect}
                  onStackMove={handleStackMove}
                  isSelected={isSelected}
                  isValidMove={isValidMoveTarget}
                  selectedStackIndex={gameState.selectedStackIndex}
                  movingStack={gameState.movingStack}
                  isInMovePath={isInMovePath(pos)}
                />
              );
            })
          )}
        </div>
      </div>
      <PieceBank
        color="black"
        stones={gameState.blackStones}
        capstones={gameState.blackCapstones}
        isCurrentPlayer={gameState.currentPlayer === "black"}
      />
    </div>
  );
};

export default GameBoard;
