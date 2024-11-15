import React from "react";
import { Stone } from "./Stone";
import { Stone as StoneType } from "../types/game";

interface StoneStackProps {
  pieces: StoneType[];
}

export const StoneStack: React.FC<StoneStackProps> = ({ pieces }) => {
  return (
    <div className="relative w-12 h-12">
      {pieces.length > 1 && (
        <div className="absolute -right-2 -top-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md z-30">
          {pieces.length}
        </div>
      )}

      {pieces.map((stone, index) => (
        <div
          key={index}
          className={`absolute ${
            stone.isStanding ? "left-1/2 -translate-x-1/2" : ""
          }`}
          style={{
            transform: `translateY(${-index * 6}px) ${
              stone.isStanding ? "translateX(-50%)" : ""
            }`,
            zIndex: index,
          }}
        >
          <Stone
            color={stone.color}
            isCapstone={stone.isCapstone}
            isStanding={stone.isStanding}
            size="md"
            className="hover:z-20"
          />
        </div>
      ))}
    </div>
  );
};
