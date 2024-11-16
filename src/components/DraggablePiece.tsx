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
  const { setDraggedStone } = useGame();

  const handleDragStart = (e: React.DragEvent) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }

    const data = { color, isCapstone };
    e.dataTransfer.setData("text/plain", JSON.stringify(data));
    e.dataTransfer.effectAllowed = "move";
    setDraggedStone(data);
  };

  const handleDragEnd = () => {
    setDraggedStone(null);
  };

  return (
    <div
      draggable={!isDisabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        ${
          isDisabled
            ? "cursor-not-allowed"
            : "cursor-grab hover:scale-110 active:cursor-grabbing"
        }
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
