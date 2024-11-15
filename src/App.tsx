// src/App.tsx
import { useState } from "react";
import { GameBoard } from "./components/GameBoard";
import { Cell, GameState } from "./types/game";
import { Card, CardContent } from "@/components/ui/card";

const createInitialBoard = (size: number): Cell[][] => {
  const board: Cell[][] = Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => ({ pieces: [] }))
    );

  // return board;
  board[1][0] = {
    pieces: [
      { color: "white", isCapstone: false, isStanding: false },
      { color: "white", isCapstone: false, isStanding: false },
      { color: "white", isCapstone: false, isStanding: false },
    ],
  };
  return board;
};

const initialGameState: GameState = {
  board: createInitialBoard(5), // Starting with a 5x5 board
  currentPlayer: "white",
  selectedCell: null,
  selectedStackIndex: null,
  whiteCapstones: 1,
  blackCapstones: 1,
  whiteStones: 21,
  blackStones: 21,
  movingStack: null,
};

function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold text-center mb-8">Tak Game</h1>
          <GameBoard gameState={gameState} setGameState={setGameState} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
