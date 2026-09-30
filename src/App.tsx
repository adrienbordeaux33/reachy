
import "./App.css";
import {PauseMenu} from "./components/PauseMenu.tsx";
import {EndGamePopup} from "./components/EndGamePopup.tsx";
import {GameSetupPopup} from "./components/GameSetupPopup.tsx";
import {FreeModePauseMenu} from "./components/FreeModePauseMenu.tsx";

function App() {
  return (
    <main className="app bg-[#030712]">
      <div className="game-screen">©
          <PauseMenu onResume={function(): void {
                  throw new Error("Function not implemented.");
              } } onRestart={function(): void {
                  throw new Error("Function not implemented.");
              } } onChangeInstrument={function(): void {
                  throw new Error("Function not implemented.");
              } } onQuit={function(): void {
                  throw new Error("Function not implemented.");
              } }></PauseMenu>
          <EndGamePopup>

          </EndGamePopup>
          <GameSetupPopup>

          </GameSetupPopup>
          <FreeModePauseMenu>

          </FreeModePauseMenu>
      </div>
    </main>
  );
}

export default App;
