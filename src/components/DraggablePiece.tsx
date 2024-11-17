// src/components/DraggablePiece.tsx
import React from "react";
import { Stone } from "./Stone";
import { useGame } from "@/state/gameContext";

interface DraggablePieceProps {
  color: "white" | "black";
  isCapstone: boolean;
  isDisabled?: boolean;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({
  color,
  isCapstone,
  isDisabled = false,
}) => {
  const { state, setDraggedStone } = useGame();

  const isFirstMove =
    state.currentPlayer === "white"
      ? !state.whiteFirstMoveDone
      : !state.blackFirstMoveDone;

  const handleDragStart = (e: React.DragEvent) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }

    // If it's first move, force the stone to be flat
    const data = {
      color,
      isCapstone,
      isStanding: false, // Force flat on first move
    };

    e.dataTransfer.setData("text/plain", JSON.stringify(data));
    e.dataTransfer.effectAllowed = "move";
    setDraggedStone(data);
  };

  const handleDragEnd = () => {
    setDraggedStone(null);
  };

  // Show different hover states based on first move rules
  const getHoverState = () => {
    if (isDisabled) return "cursor-not-allowed opacity-50";
    if (isFirstMove && color === state.currentPlayer)
      return "cursor-not-allowed opacity-50";
    return "cursor-grab hover:scale-110 active:cursor-grabbing";
  };

  return (
    <div
      draggable={!isDisabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        ${getHoverState()}
        transition-all duration-200
      `}
    >
      <Stone
        color={color}
        isCapstone={isCapstone}
        isStanding={false}
        className={isDisabled ? "opacity-50" : ""}
      />
    </div>
  );
};
