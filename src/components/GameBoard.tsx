// src/components/GameBoard.tsx
import React from "react";
import { Position } from "../types/game";
import { BoardCell } from "./BoardCell";
import { PieceBank } from "./PieceBank";
import { useGame } from "../state/gameContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const GameBoard: React.FC = () => {
  const { state, isValidMove, getCurrentPlayer } = useGame();

  const isStartingCell = (pos: Position): boolean => {
    if (!state.movingStack) return false;
    const startPos = state.movingStack.path[0];
    return startPos.x === pos.x && startPos.y === pos.y;
  };

  const isInMovePath = (pos: Position): boolean => {
    if (!state.movingStack) return false;
    return state.movingStack.path.some((p) => p.x === pos.x && p.y === pos.y);
  };

  const Winner = () =>
    state.winner && (
      <Alert className="w-full max-w-md">
        <AlertTitle>Game Over!</AlertTitle>
        <AlertDescription className="space-y-2">
          {state.winner.player === "draw" ? (
            <p>
              The game is a draw! Both players control{" "}
              {state.winner.territory.white} territories.
            </p>
          ) : (
            <>
              <p>
                {state.winner.player.charAt(0).toUpperCase() +
                  state.winner.player.slice(1)}{" "}
                wins by{" "}
                {state.winner.condition === "road"
                  ? "building a road"
                  : "controlling more territory"}
                !
              </p>
              <p className="text-sm text-muted-foreground">
                Final territory count - White: {state.winner.territory.white},
                Black: {state.winner.territory.black}
              </p>
            </>
          )}
        </AlertDescription>
      </Alert>
    );

  const BoardCells = () => (
    <div className="grid grid-cols-5 gap-0 w-fit mx-auto bg-amber-900 p-1 shadow-lg rounded">
      {state.board.map((row, y) =>
        row.map((cell, x) => {
          const pos = { x, y };
          const isSelected =
            state.selectedCell?.x === x && state.selectedCell?.y === y;

          const isValidMoveTarget = state.selectedCell
            ? isValidMove(state.selectedCell, pos)
            : false;

          return (
            <BoardCell
              key={`${x}-${y}`}
              cell={cell}
              position={pos}
              isSelected={isSelected}
              isValidMove={isValidMoveTarget}
              isInMovePath={isInMovePath(pos)}
              isStartingCell={isStartingCell(pos)}
            />
          );
        })
      )}
    </div>
  );

  const Board = () => (
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
      <BoardCells />
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-8">
      {state.winner && <Winner />}

      <div className="flex items-center justify-center gap-8">
        <PieceBank
          color="white"
          stones={state.whiteStones}
          capstones={state.whiteCapstones}
          isCurrentPlayer={getCurrentPlayer() === "white"}
          isDisabled={!!state.winner}
        />
        <Board />
        <PieceBank
          color="black"
          stones={state.blackStones}
          capstones={state.blackCapstones}
          isCurrentPlayer={getCurrentPlayer() === "black"}
          isDisabled={!!state.winner}
        />
      </div>
    </div>
  );
};
