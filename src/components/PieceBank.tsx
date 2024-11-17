// src/components/PieceBank.tsx
import React from "react";
import { DraggablePiece } from "./DraggablePiece";
import { useGame } from "@/state/gameContext";

interface PieceBankProps {
  color: "white" | "black";
  stones: number;
  capstones: number;
  isCurrentPlayer: boolean;
  isDisabled?: boolean;
}

export const PieceBank: React.FC<PieceBankProps> = ({
  color,
  stones,
  capstones,
  isCurrentPlayer,
  isDisabled = false,
}) => {
  const { state } = useGame();

  const needsFirstMove =
    (color === "white" && !state.whiteFirstMoveDone) ||
    (color === "black" && !state.blackFirstMoveDone);

  const showFirstMovePiece = needsFirstMove && isCurrentPlayer;

  const Title = () => (
    <h3
      className={`
          text-lg font-bold text-center
          ${color === "white" ? "text-gray-800" : "text-white"}
        `}
    >
      {color === "white" ? "White" : "Black"} Pieces
    </h3>
  );

  const FirstMovePiece = () => (
    <div className="border-b-2 border-blue-300 pb-4 mb-2">
      <div className="text-sm text-center mb-2 font-medium text-blue-600">
        Place your opponent's stone flat to start
      </div>
      <div className="flex justify-center">
        <DraggablePiece
          color={color === "white" ? "black" : "white"}
          isCapstone={false}
          isDisabled={!isCurrentPlayer}
        />
      </div>
    </div>
  );

  const Stones = () => (
    <div className="flex flex-wrap gap-2 justify-center">
      {Array.from({ length: stones }).map((_, i) => (
        <DraggablePiece
          key={`stone-${i}`}
          color={color}
          isCapstone={false}
          isDisabled={
            isDisabled ||
            !isCurrentPlayer ||
            (needsFirstMove && isCurrentPlayer) // Disable own pieces until first move is made
          }
        />
      ))}
    </div>
  );

  const Capstones = () => (
    <div className="flex justify-center gap-2">
      {Array.from({ length: capstones }).map((_, i) => (
        <DraggablePiece
          key={`capstone-${i}`}
          color={color}
          isCapstone={true}
          isDisabled={
            isDisabled || !isCurrentPlayer || needsFirstMove // Always disable capstones on first move
          }
        />
      ))}
    </div>
  );

  return (
    <div
      className={`
        w-48 h-full p-4 
        ${color === "white" ? "bg-slate-100" : "bg-gray-800"} 
        ${isCurrentPlayer && !isDisabled ? "ring-2 ring-blue-500" : ""}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
        rounded-lg shadow-md
        transition-all duration-200
        flex flex-col gap-4
      `}
    >
      <Title />
      {showFirstMovePiece && <FirstMovePiece />}
      <Stones />
      <Capstones />
    </div>
  );
};
