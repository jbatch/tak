import React from "react";
import { DraggablePiece } from "./DraggablePiece";
import { useGame } from "@/state/gameContext";
import { PlayerColor } from "@/types/game";

interface CompactPieceBankProps {
  color: PlayerColor;
  stones: number;
  capstones: number;
  isCurrentPlayer: boolean;
  isDisabled?: boolean;
}

export const CompactPieceBank: React.FC<CompactPieceBankProps> = ({
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

  return (
    <div
      className={`
      flex items-center gap-4 p-3
      ${color === "white" ? "bg-slate-100" : "bg-gray-800"}
      ${isCurrentPlayer && !isDisabled ? "ring-2 ring-blue-500" : ""}
      ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
      rounded-lg shadow-md transition-all duration-200
    `}
    >
      {showFirstMovePiece ? (
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-blue-600">
            Place opponent's stone:
          </div>
          <DraggablePiece
            color={color === "white" ? "black" : "white"}
            isCapstone={false}
            isDisabled={!isCurrentPlayer}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <DraggablePiece
              color={color}
              isCapstone={false}
              isDisabled={
                isDisabled ||
                !isCurrentPlayer ||
                (needsFirstMove && isCurrentPlayer)
              }
            />
            <span
              className={`font-medium ${
                color === "white" ? "text-gray-800" : "text-white"
              }`}
            >
              ×{stones}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DraggablePiece
              color={color}
              isCapstone={true}
              isDisabled={isDisabled || !isCurrentPlayer || needsFirstMove}
            />
            <span
              className={`font-medium ${
                color === "white" ? "text-gray-800" : "text-white"
              }`}
            >
              ×{capstones}
            </span>
          </div>
        </>
      )}
    </div>
  );
};
