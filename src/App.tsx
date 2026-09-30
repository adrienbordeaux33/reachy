<<<<<<< HEAD
import { Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import FreeGamePage from "./pages/FreeGamePage";

import "./App.css";

function App() {
    return (
        <main className="app">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/game" element={<GamePage />} />
                <Route path="/free-game" element={<FreeGamePage />} />
            </Routes>
        </main>
    );
=======
import { useState } from "react";
import "./App.css";
import { PauseMenu } from "./components/PauseMenu.tsx";
import { EndGamePopup } from "./components/EndGamePopup.tsx";
import { GameSetupPopup } from "./components/GameSetupPopup.tsx";
import { FreeModePauseMenu } from "./components/FreeModePauseMenu.tsx";
import PianoHero from "./components/PianoHero.tsx";

function App() {
  const [isFreeModePaused, setIsFreeModePaused] = useState(false);

  return (
    <main className="app bg-[#030712]">
      <div className="game-screen">
        ©
        <PianoHero
          isPaused={isFreeModePaused}
          onPause={() => setIsFreeModePaused(true)}
          onResume={() => setIsFreeModePaused(false)}
        />
        <PauseMenu
          onResume={function (): void {
            throw new Error("Function not implemented.");
          }}
          onRestart={function (): void {
            throw new Error("Function not implemented.");
          }}
          onChangeInstrument={function (): void {
            throw new Error("Function not implemented.");
          }}
          onQuit={function (): void {
            throw new Error("Function not implemented.");
          }}
        ></PauseMenu>
        <EndGamePopup></EndGamePopup>
        <GameSetupPopup></GameSetupPopup>
        <FreeModePauseMenu
          isOpen={isFreeModePaused}
          onResume={() => setIsFreeModePaused(false)}
        />
      </div>
    </main>
  );
>>>>>>> main
}

export default App;
