import React from "react";

interface StoneProps {
  color: "white" | "black";
  isCapstone: boolean;
  isStanding: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Stone: React.FC<StoneProps> = ({
  color,
  isCapstone,
  isStanding,
  className = "",
  size = "sm",
}) => {
  // Base dimensions for flat pieces
  const sizeClasses = {
    sm: isCapstone ? "w-6 h-10" : "w-8 h-8",
    md: isCapstone ? "w-8 h-14" : "w-12 h-12",
    lg: isCapstone ? "w-10 h-18" : "w-16 h-16",
  };

  // Standing pieces are thinner and taller
  const standingSizeClasses = {
    sm: "w-2 h-8",
    md: "w-3 h-12",
    lg: "w-4 h-16",
  };

  const CapstonePiece = () => (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Half circle crown */}
      <div
        className={`
            absolute top-0 left-0 right-0
            ${
              color === "white"
                ? "bg-white border-gray-300"
                : "bg-gray-900 border-gray-600"
            }
            border-r-2 border-t-2 border-l-2
            rounded-t-full
            h-3
          `}
      />
      {/* Main body */}
      <div
        className={`
            absolute bottom-0 left-0 right-0
            ${
              color === "white"
                ? "bg-white border-gray-300"
                : "bg-gray-900 border-gray-600"
            }
            border-r-2 border-b-2 border-l-2
            h-[calc(100%-0.75rem)]
            shadow-md
          `}
      />
    </div>
  );

  const StonePiece = () => (
    <div
      className={`
        ${isStanding ? standingSizeClasses[size] : sizeClasses[size]}
        ${isStanding ? "border border-r-2" : "border-r-2 border-b-2"}
        ${
          color === "white"
            ? "bg-white border-gray-300"
            : "bg-gray-900 border-gray-600"
        }
        shadow-md
        transition-transform
        ${className}
      `}
    />
  );

  if (isCapstone && !isStanding) {
    return <CapstonePiece />;
  }

  return <StonePiece />;
};

export default Stone;
