import { useState } from "react";
import "./App.css";
import { PauseMenu } from "./components/PauseMenu.tsx";
import { EndGamePopup } from "./components/EndGamePopup.tsx";
import { GameSetupPopup } from "./components/GameSetupPopup.tsx";
import { FreeModePauseMenu } from "./components/FreeModePauseMenu.tsx";
import PianoHero from "./components/PianoHero.tsx";
import MusicDebugPage from "./pages/MusicDebugPage.tsx";

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

          <MusicDebugPage/>
      </div>
    </main>
  );
}

export default App;
