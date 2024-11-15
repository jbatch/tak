// src/components/GameBoard.tsx
import React from "react";
import { GameState, Stone } from "../types/game";
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
            row.map((cell, x) => (
              <BoardCell
                key={`${x}-${y}`}
                cell={cell}
                position={{ x, y }}
                onDrop={handlePieceDrop}
              />
            ))
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
