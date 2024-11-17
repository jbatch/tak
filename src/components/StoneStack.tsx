import { Stone as StoneType } from "@/types/game";
import { Stone } from "./Stone";

interface StoneStackProps {
  pieces: StoneType[];
  onPieceClick?: (index: number) => void;
  isInteractive?: boolean;
  selectedIndex?: number | null;
  isMoving?: boolean;
  isFloating?: boolean;
}

export const StoneStack: React.FC<StoneStackProps> = ({
  pieces,
  onPieceClick,
  isInteractive,
  selectedIndex,
  isMoving,
  isFloating,
}) => {
  const isSelected = (index: number): boolean => {
    return (
      selectedIndex !== null &&
      selectedIndex !== undefined &&
      index >= selectedIndex
    );
  };

  const getVerticalOffset = (stone: StoneType, index: number): string => {
    let offset = 6;
    if (stone.isCapstone) {
      offset -= 8;
    }
    if (selectedIndex == null || index < selectedIndex) {
      // Non-selected stones stack normally
      offset -= index * 6; // Reduced from 6 to 4 for mobile
    } else {
      offset -= selectedIndex * 6 + (index - selectedIndex) * 6; // Reduced from 6 to 4
    }
    // Selected stones stack higher
    return `${offset}px`;
  };

  return (
    <div
      className={`
      relative flex items-center justify-center
      w-full h-full
      ${isMoving ? "-translate-y-2" : ""}
      ${isFloating ? "-translate-y-4" : ""}
      transition-all duration-200
    `}
    >
      {pieces.length > 1 && (
        <div
          className="absolute -right-2 -top-2 bg-blue-500 text-white text-xs 
                     rounded-full w-5 h-5 flex items-center justify-center shadow-md z-30"
        >
          {pieces.length}
        </div>
      )}
      {pieces.map((stone, index) => {
        const verticalOffset = getVerticalOffset(stone, index);
        return (
          <div
            key={index}
            className={`
              absolute
              ${isInteractive ? "cursor-pointer" : ""}
              transition-all duration-200
              ${isSelected(index) ? "scale-110 brightness-110" : ""}
            `}
            onClick={(e) => {
              e.stopPropagation();
              onPieceClick?.(index);
            }}
            style={{
              transform: `translateY(${verticalOffset})`,
              zIndex: index,
            }}
          >
            <Stone
              color={stone.color}
              isCapstone={stone.isCapstone}
              isStanding={stone.isStanding}
              size="md"
              className={`
                hover:z-20 
                transition-all duration-200
                ${isSelected(index) ? "ring-2 ring-blue-400 ring-offset-1" : ""}
              `}
            />
          </div>
        );
      })}
    </div>
  );
};
