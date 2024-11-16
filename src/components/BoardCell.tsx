import React, { useState } from "react";
import { Cell, MovingStack, Position, Stone as StoneType } from "../types/game";
import { StoneStack } from "./StoneStack";
import { Stone } from "./Stone";

interface BoardCellProps {
  cell: Cell;
  position: Position;
  onDrop: (x: number, y: number, stone: StoneType) => void;
  onStackSelect: (pos: Position | undefined, stackIndex: number | null) => void;
  onStackMove: (to: Position) => void;
  isSelected: boolean;
  isValidMove: boolean;
  selectedStackIndex: number | null;
  movingStack: MovingStack | null;
  isInMovePath: boolean;
  isStartingCell: boolean;
}

export const BoardCell: React.FC<BoardCellProps> = ({
  cell,
  position: { x, y },
  onDrop,
  onStackSelect,
  onStackMove,
  isSelected,
  isValidMove,
  selectedStackIndex,
  movingStack,
  isInMovePath,
  isStartingCell,
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
    if (movingStack) return;

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

  const isCurrentStackPosition =
    movingStack &&
    movingStack.path.length > 0 &&
    (() => {
      const lastPos = movingStack.path[movingStack.path.length - 1];
      return lastPos.x === x && lastPos.y === y;
    })();

  const handleCellClick = () => {
    if (isStartingCell && movingStack) {
      onStackSelect({ x, y }, selectedStackIndex);
      return;
    }

    if (isSelected) {
      onStackSelect(undefined, null);
    } else if (
      !movingStack &&
      selectedStackIndex !== null &&
      cell.pieces.length > 0
    ) {
      onStackSelect({ x, y }, selectedStackIndex);
    } else if (!movingStack && cell.pieces.length > 0) {
      onStackSelect({ x, y }, 0);
    } else if (isValidMove) {
      onStackMove({ x, y });
    }
  };

  const handleStackClick = (stackIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("handleStackClick", {
      stackIndex,
      selectedStackIndex,
      isCurrentStackPosition,
      movingStack,
      isSelected,
      isValidMove,
    });
    if (isCurrentStackPosition && movingStack) {
      // If clicking on the current position during a move, continue the move
      onStackMove({ x, y });
    } else if (cell.pieces.length > 0) {
      if (isSelected) {
        onStackSelect(undefined, null);
      } else if (selectedStackIndex != null && isValidMove) {
        // We have selected stones and haven't started a move yet
        onStackMove({ x, y });
      } else {
        onStackSelect({ x, y }, stackIndex);
      }
    }
  };

  return (
    <div
      onClick={handleCellClick}
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
        transition-all duration-200
        relative
        group
        ${isSelected ? "ring-2 ring-blue-500 ring-offset-0 ring-inset" : ""}
        ${isValidMove ? "ring-2 ring-green-500 ring-offset-0 ring-inset" : ""}
        ${isStartingCell ? "ring-2 ring-red-500 ring-offset-0 rin-inset" : ""}
        ${isInMovePath ? "bg-amber-200" : ""}
        ${x === 0 ? "border-l-4" : ""}
        ${x === 4 ? "border-r-4" : ""}
        ${y === 0 ? "border-t-4" : ""}
        ${y === 4 ? "border-b-4" : ""}
      `}
    >
      {cell.pieces.length > 0 && (
        <div className="relative group">
          <StoneStack
            pieces={cell.pieces}
            onPieceClick={(index) =>
              handleStackClick(index, event as unknown as React.MouseEvent)
            }
            isInteractive={cell.pieces.length > 0}
            selectedIndex={isSelected ? selectedStackIndex : undefined}
            isMoving={isSelected && movingStack !== null}
          />
        </div>
      )}

      {isCurrentStackPosition && movingStack.heldPieces.length > 0 && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <StoneStack
            pieces={movingStack.heldPieces}
            isFloating={true}
            isInteractive={false}
          />
        </div>
      )}

      {showPlacementOptions && droppedStone && !movingStack && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-2 flex gap-4 z-50">
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
