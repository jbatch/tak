import { BoardCell } from "./BoardCell";
import { PieceBank } from "./PieceBank";
import { CompactPieceBank } from "./CompactPieceBank";
import { useGame } from "@/state/gameContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Position } from "@/types/game";

export const GameBoard = () => {
  const { state, isValidMove, getCurrentPlayer } = useGame();

  const isStartingCell = (pos: Position): boolean => {
    if (!state.movingStack) return false;
    const startPos = state.movingStack.path[0];
    return startPos.x === pos.x && startPos.y === pos.y;
  };

  const isInMovePath = (pos: Position): boolean => {
    if (!state.movingStack) return false;
    return state.movingStack.path.some((p) => p.x === pos.x && p.y === pos.y);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-[1400px] p-4">
        {/* Alert */}
        {state.winner && (
          <Alert className="w-full max-w-md mx-auto mb-4">
            <AlertTitle>Game Over!</AlertTitle>
            <AlertDescription className="space-y-2">
              {state.winner.player === "draw" ? (
                <p>
                  The game is a draw! Both players control{" "}
                  {state.winner.territory.white} territories.
                </p>
              ) : (
                <>
                  <p>
                    {state.winner.player.charAt(0).toUpperCase() +
                      state.winner.player.slice(1)}{" "}
                    wins by{" "}
                    {state.winner.condition === "road"
                      ? "building a road"
                      : "controlling more territory"}
                    !
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Final territory count - White:{" "}
                    {state.winner.territory.white}, Black:{" "}
                    {state.winner.territory.black}
                  </p>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Game Area */}
        <div className="flex items-center justify-center gap-8">
          {/* Desktop Left Bank */}
          <div className="hidden lg:block">
            <PieceBank
              color="white"
              stones={state.whiteStones}
              capstones={state.whiteCapstones}
              isCurrentPlayer={getCurrentPlayer() === "white"}
              isDisabled={!!state.winner}
            />
          </div>

          {/* Board */}
          <div className="relative w-full max-w-[400px] mx-auto">
            {/* Letter coordinates (A-E) */}
            <div className="absolute inset-x-0 flex justify-around px-6 -translate-y-full top-10 lg:-top-2">
              {["A", "B", "C", "D", "E"].map((letter) => (
                <div
                  key={letter}
                  className=" text-center font-semibold text-gray-600"
                >
                  {letter}
                </div>
              ))}
            </div>

            {/* Number coordinates (1-5) */}
            <div className="absolute top-0 bottom-0 left-2 flex flex-col justify-around">
              {[1, 2, 3, 4, 5].map((number) => (
                <div
                  key={number}
                  className="h-8 flex items-center font-semibold text-gray-600"
                >
                  {number}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-0 bg-amber-900 p-1 shadow-lg rounded">
              {state.board.map((row, y) =>
                row.map((cell, x) => {
                  const pos = { x, y };
                  const isSelected =
                    state.selectedCell?.x === x && state.selectedCell?.y === y;
                  const isValidMoveTarget = state.selectedCell
                    ? isValidMove(state.selectedCell, pos)
                    : false;

                  return (
                    <BoardCell
                      key={`${x}-${y}`}
                      cell={cell}
                      position={pos}
                      isSelected={isSelected}
                      isValidMove={isValidMoveTarget}
                      isInMovePath={isInMovePath(pos)}
                      isStartingCell={isStartingCell(pos)}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Desktop Right Bank */}
          <div className="hidden lg:block">
            <PieceBank
              color="black"
              stones={state.blackStones}
              capstones={state.blackCapstones}
              isCurrentPlayer={getCurrentPlayer() === "black"}
              isDisabled={!!state.winner}
            />
          </div>
        </div>

        {/* Mobile Banks */}
        <div className="lg:hidden flex justify-between gap-4 mt-4">
          <CompactPieceBank
            color="white"
            stones={state.whiteStones}
            capstones={state.whiteCapstones}
            isCurrentPlayer={getCurrentPlayer() === "white"}
            isDisabled={!!state.winner}
          />
          <CompactPieceBank
            color="black"
            stones={state.blackStones}
            capstones={state.blackCapstones}
            isCurrentPlayer={getCurrentPlayer() === "black"}
            isDisabled={!!state.winner}
          />
        </div>
      </div>
    </div>
  );
};
