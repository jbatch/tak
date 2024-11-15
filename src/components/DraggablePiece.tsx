import React from "react";
import { Stone } from "./Stone";

interface DraggablePieceProps {
  color: "white" | "black";
  isCapstone: boolean;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({
  color,
  isCapstone,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    const data = { color, isCapstone };
    e.dataTransfer.setData("text/plain", JSON.stringify(data));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab hover:scale-110 active:cursor-grabbing"
    >
      <Stone color={color} isCapstone={isCapstone} isStanding={false} />
    </div>
  );
};
