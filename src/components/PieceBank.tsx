// src/components/PieceBank.tsx
import React from "react";
import { DraggablePiece } from "./DraggablePiece";

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
}) => (
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
    <h3
      className={`
        text-lg font-bold text-center
        ${color === "white" ? "text-gray-800" : "text-white"}
      `}
    >
      {color === "white" ? "White" : "Black"} Pieces
    </h3>

    <div className="flex flex-wrap gap-2 justify-center">
      {Array.from({ length: stones }).map((_, i) => (
        <DraggablePiece
          key={`stone-${i}`}
          color={color}
          isCapstone={false}
          isDisabled={isDisabled || !isCurrentPlayer}
        />
      ))}
    </div>

    <div className="flex justify-center gap-2">
      {Array.from({ length: capstones }).map((_, i) => (
        <DraggablePiece
          key={`capstone-${i}`}
          color={color}
          isCapstone={true}
          isDisabled={isDisabled || !isCurrentPlayer}
        />
      ))}
    </div>
  </div>
);
