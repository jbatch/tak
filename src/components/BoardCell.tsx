import React, { useState } from "react";
import { Cell, Stone as StoneType } from "../types/game";
import { StoneStack } from "./StoneStack";
import { Stone } from "./Stone";

interface BoardCellProps {
  cell: Cell;
  position: { x: number; y: number };
  onDrop: (x: number, y: number, stone: StoneType) => void;
}

export const BoardCell: React.FC<BoardCellProps> = ({
  cell,
  position: { x, y },
  onDrop,
}) => {
  const [showPlacementOptions, setShowPlacementOptions] = useState(false);
  const [droppedStone, setDroppedStone] = useState<{
    color: "white" | "black";
    isCapstone: boolean;
  } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setShowPlacementOptions(false);
      setDroppedStone(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    try {
      const stone = JSON.parse(data) as {
        color: "white" | "black";
        isCapstone: boolean;
      };

      if (stone.isCapstone) {
        onDrop(x, y, { ...stone, isStanding: false });
      } else {
        setDroppedStone(stone);
        setShowPlacementOptions(true);
      }
    } catch (err) {
      console.error("Failed to parse drop data:", err);
    }
  };

  const handlePlacementOption = (isStanding: boolean) => {
    if (droppedStone) {
      onDrop(x, y, {
        ...droppedStone,
        isStanding,
      });
      setShowPlacementOptions(false);
      setDroppedStone(null);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-20 h-20 
        bg-amber-100 
        border-2 border-amber-800
        flex items-center justify-center
        cursor-pointer
        hover:bg-amber-200
        transition-colors
        relative
        group
        ${x === 0 ? "border-l-4" : ""}
        ${x === 4 ? "border-r-4" : ""}
        ${y === 0 ? "border-t-4" : ""}
        ${y === 4 ? "border-b-4" : ""}
      `}
    >
      {cell.pieces.length > 0 && (
        <div className="relative group">
          <StoneStack pieces={cell.pieces} />

          {cell.pieces.length > 1 && (
            <div
              className="
              absolute bottom-full left-1/2 -translate-x-1/2 mb-2
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              bg-white/90 backdrop-blur-sm
              p-2 rounded-lg shadow-xl
              z-30
              hidden group-hover:block
            "
            >
              <div className="flex flex-col-reverse gap-1">
                {cell.pieces.map((stone, index) => (
                  <Stone
                    key={index}
                    color={stone.color}
                    isCapstone={stone.isCapstone}
                    isStanding={stone.isStanding}
                    className="shadow-sm"
                  />
                ))}
              </div>
              <div className="absolute w-3 h-3 bg-white/90 rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
            </div>
          )}
        </div>
      )}

      {showPlacementOptions && droppedStone && (
        <div
          className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-white rounded-lg shadow-xl p-2
          flex gap-4
          z-50
        "
        >
          <button
            onClick={() => handlePlacementOption(false)}
            className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <Stone
              color={droppedStone.color}
              isCapstone={droppedStone.isCapstone}
              isStanding={false}
            />
            <span className="text-xs font-medium text-gray-600">Flat</span>
          </button>

          <button
            onClick={() => handlePlacementOption(true)}
            className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <Stone
              color={droppedStone.color}
              isCapstone={droppedStone.isCapstone}
              isStanding={true}
            />
            <span className="text-xs font-medium text-gray-600">Standing</span>
          </button>
        </div>
      )}
    </div>
  );
};
