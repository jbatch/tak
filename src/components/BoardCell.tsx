// src/components/BoardCell.tsx
import React, { useState } from "react";
import { Cell, MovingStack, Position } from "../types/game";
import { StoneStack } from "./StoneStack";
import Stone from "./Stone";
import { useGame } from "../state/gameContext";
import { isValidDrop } from "../game/moveValidator";

interface BoardCellProps {
  cell: Cell;
  position: Position;
  isSelected: boolean;
  isValidMove: boolean;
  isInMovePath: boolean;
  isStartingCell: boolean;
}

export const BoardCell: React.FC<BoardCellProps> = ({
  cell,
  position,
  isSelected,
  isValidMove,
  isInMovePath,
  isStartingCell,
}) => {
  const { state, addStone, selectStack, continueMove, cancelMove } = useGame();
  const [showPlacementOptions, setShowPlacementOptions] = useState(false);
  const [droppedStone, setDroppedStone] = useState<{
    color: "white" | "black";
    isCapstone: boolean;
  } | null>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggedOver) {
      try {
        setIsDraggedOver(true);
      } catch (err) {
        console.error("Failed to parse drag data:", err);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggedOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(false);
    const data = e.dataTransfer.getData("text/plain");
    try {
      const stone = JSON.parse(data) as {
        color: "white" | "black";
        isCapstone: boolean;
      };

      // Check if this is a valid drop target
      if (!isValidDrop(position, state.board)) {
        return;
      }

      if (stone.isCapstone) {
        addStone(position, { ...stone, isStanding: false });
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
      // Check if the standing placement would be valid
      if (isValidDrop(position, state.board)) {
        addStone(position, {
          ...droppedStone,
          isStanding,
        });
      }
      setShowPlacementOptions(false);
      setDroppedStone(null);
    }
  };

  const handleCellClick = () => {
    if (isStartingCell && state.movingStack) {
      cancelMove();
      return;
    }

    if (isSelected) {
      selectStack(undefined, null);
    } else if (isValidMove) {
      continueMove(position);
    }
  };

  const handleStackClick = (stackIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();

    const piecesToMove = cell.pieces.length - stackIndex;
    // Can't move more pieces than the board size
    if (piecesToMove > state.board.length) {
      return;
    }

    if (isStartingCell && state.movingStack) {
      cancelMove();
      return;
    }

    if (isSelected) {
      selectStack(undefined, null);
      return;
    }
    if (isValidMove) {
      continueMove(position);
      return;
    }
    selectStack(position, stackIndex);
  };

  const isCurrentStackPosition = (
    position: Position,
    movingStack: MovingStack | null
  ): boolean => {
    if (!movingStack || movingStack.heldPieces.length === 0) return false;

    const currentPos = movingStack.path[movingStack.path.length - 1];
    return currentPos.x === position.x && currentPos.y === position.y;
  };

  const isValidDropTarget =
    isDraggedOver && state.draggedStone
      ? isValidDrop(position, state.board)
      : false;

  const isFirstMove =
    state.currentPlayer === "white"
      ? !state.whiteFirstMoveDone
      : !state.blackFirstMoveDone;

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
        ${isStartingCell ? "ring-2 ring-red-500 ring-offset-0 ring-inset" : ""}
        ${isInMovePath ? "bg-amber-200" : ""}
        ${
          isDraggedOver && isValidDropTarget
            ? "ring-2 ring-green-500 ring-offset-0 ring-inset"
            : ""
        }
        ${
          isDraggedOver && !isValidDropTarget
            ? "ring-2 ring-red-500 ring-offset-0 ring-inset"
            : ""
        }
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
            selectedIndex={isSelected ? state.selectedStackIndex : undefined}
            isMoving={isSelected && state.movingStack !== null}
          />
        </div>
      )}

      {state.movingStack &&
        isCurrentStackPosition(position, state.movingStack) && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <StoneStack
              pieces={state.movingStack.heldPieces}
              isFloating={true}
              isInteractive={false}
            />
          </div>
        )}

      {showPlacementOptions && droppedStone && !state.movingStack && (
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

          {/* Only show standing option if it's not a first move */}
          {!isFirstMove && (
            <button
              onClick={() => handlePlacementOption(true)}
              className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <Stone
                color={droppedStone.color}
                isCapstone={droppedStone.isCapstone}
                isStanding={true}
              />
              <span className="text-xs font-medium text-gray-600">
                Standing
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
