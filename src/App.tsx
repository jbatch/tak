// src/App.tsx
import { GameBoard } from "./components/GameBoard";
import { Card, CardContent } from "@/components/ui/card";
import { GameProvider } from "./state/gameContext";

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-100 p-8">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-center mb-8">Tak Game</h1>
            <GameBoard />
          </CardContent>
        </Card>
      </div>
    </GameProvider>
  );
}

export default App;
