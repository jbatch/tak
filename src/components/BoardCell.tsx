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
}) => {
  // State for initial piece placement from piece bank
  const [showPlacementOptions, setShowPlacementOptions] = useState(false);
  const [droppedStone, setDroppedStone] = useState<{
    color: "white" | "black";
    isCapstone: boolean;
  } | null>(null);

  // Handlers for initial piece placement (dragging from piece bank)
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
    // If we're in the middle of a stack move, ignore drops
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

  // Handler for stack movement and selection
  const handleStackClick = (stackIndex: number) => {
    if (cell.pieces.length > 0) {
      if (isSelected) {
        onStackSelect(undefined, null); // Clear selection
      } else {
        onStackSelect({ x, y }, stackIndex); // Make new selection
      }
    }
  };

  const handleCellClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    console.log("handleCellClick", {
      movingStack,
      isValidMove,
      selectedStackIndex,
    });

    // Case 1: We have selected pieces but haven't started moving yet
    if (!movingStack && isValidMove && selectedStackIndex !== null) {
      onStackMove({ x, y });
      return;
    }

    // Case 2: We're in the middle of a move
    if (movingStack) {
      if (isSelected) {
        // Cancel the move if clicking the start
        onStackSelect(undefined, null);
      } else if (isValidMove) {
        // Continue the move if clicking valid target
        onStackMove({ x, y });
      }
      return;
    }

    // Case 3: Normal selection/deselection
    if (isSelected) {
      onStackSelect(undefined, null);
    } else if (cell.pieces.length > 0) {
      onStackSelect({ x, y }, selectedStackIndex);
    }
  };

  const isCurrentStackPosition =
    movingStack &&
    movingStack.path.length > 0 &&
    (() => {
      const lastPos = movingStack.path[movingStack.path.length - 1];
      return lastPos.x === x && lastPos.y === y;
    })();

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
        ${isSelected ? "ring-2 ring-blue-500 ring-offset-0" : ""}
        ${isValidMove ? "ring-2 ring-green-500 ring-offset-0 ring-inset" : ""}
        ${isInMovePath ? "bg-amber-200" : ""}
        ${x === 0 ? "border-l-4" : ""}
        ${x === 4 ? "border-r-4" : ""}
        ${y === 0 ? "border-t-4" : ""}
        ${y === 4 ? "border-b-4" : ""}
      `}
    >
      {/* Main stack display */}
      {cell.pieces.length > 0 && (
        <div className="relative group">
          <StoneStack
            pieces={cell.pieces}
            onPieceClick={handleStackClick}
            isInteractive={cell.pieces.length > 0}
            selectedIndex={isSelected ? selectedStackIndex : undefined}
            isMoving={isSelected && movingStack !== null}
          />
        </div>
      )}

      {/* Floating stack during movement */}
      {isCurrentStackPosition && movingStack.heldPieces.length > 0 && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <StoneStack
            pieces={movingStack.heldPieces}
            isFloating={true}
            isInteractive={false}
          />
        </div>
      )}

      {/* Initial placement options popup */}
      {showPlacementOptions && droppedStone && !movingStack && (
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
