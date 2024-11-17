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
  const { state, setDraggedStone, selectBankPiece } = useGame();

  const isFirstMove =
    state.currentPlayer === "white"
      ? !state.whiteFirstMoveDone
      : !state.blackFirstMoveDone;

  const data = {
    color,
    isCapstone,
    isStanding: false,
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData("text/plain", JSON.stringify(data));
    e.dataTransfer.effectAllowed = "move";
    setDraggedStone(data);
    selectBankPiece(data, false);
  };

  const handleClick = () => {
    if (isDisabled) return;

    // Toggle selection
    if (
      state.selectedBankPiece?.color === color &&
      state.selectedBankPiece?.isCapstone === isCapstone
    ) {
      selectBankPiece(null, false);
    } else {
      selectBankPiece(data, true);
    }
  };

  // Show different states based on selection and rules
  const getStateClasses = () => {
    if (isDisabled) return "cursor-not-allowed opacity-50";
    if (isFirstMove && color === state.currentPlayer)
      return "cursor-not-allowed opacity-50";

    const isSelected =
      state.selectedBankPiece?.color === color &&
      state.selectedBankPiece?.isCapstone === isCapstone;

    return `cursor-pointer hover:scale-110 
            ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}`;
  };

  return (
    <div
      draggable={!isDisabled}
      onDragStart={handleDragStart}
      onDragEnd={() => setDraggedStone(null)}
      onClick={handleClick}
      className={`
        ${getStateClasses()}
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
