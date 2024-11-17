// src/App.tsx
import { GameBoard } from "./components/GameBoard";
import { GameProvider } from "./state/gameContext";

function App() {
  return (
    <GameProvider>
      <div className="h-screen w-screen bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-[10vh] flex items-center justify-center bg-amber-900/10 border-b border-amber-900/20">
          <h1 className="text-5xl font-bold text-amber-900 tracking-tight">
            Tak
          </h1>
        </header>

        {/* Main game area */}
        <main className="h-[85vh] flex items-center justify-center p-4">
          <div className="w-full h-full max-w-[1400px] bg-white/80 backdrop-blur rounded-xl shadow-2xl p-6 flex items-center justify-center">
            <GameBoard />
          </div>
        </main>

        {/* Footer */}
        <footer className="h-[5vh] flex items-center justify-center bg-amber-900/10 border-t border-amber-900/20">
          <p className="text-amber-900/60 text-sm">A beautiful game</p>
        </footer>
      </div>
    </GameProvider>
  );
}

export default App;
