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
  return (
    <div
      className={`
      relative w-12 h-12
      ${isMoving ? "translate-y-[-8px]" : ""}
      ${isFloating ? "translate-y-[-16px]" : ""}
      transition-all duration-200
    `}
    >
      {pieces.length > 1 && (
        <div className="absolute -right-2 -top-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md z-30">
          {pieces.length}
        </div>
      )}

      {pieces.map((stone, index) => (
        <div
          key={index}
          className={`
            absolute 
            ${stone.isStanding ? "left-1/2 -translate-x-1/2" : ""} 
            ${isInteractive ? "cursor-pointer" : ""}
            transition-all duration-200
            ${isSelected(index) ? "scale-110 brightness-110" : ""}
          `}
          onClick={(e) => {
            e.stopPropagation();
            onPieceClick?.(index);
          }}
          style={{
            transform: `translateY(${-index * 6}px) ${
              stone.isStanding ? "translateX(-50%)" : ""
            } ${isSelected(index) ? "scale(1.1)" : ""}`,
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
      ))}
    </div>
  );
};
