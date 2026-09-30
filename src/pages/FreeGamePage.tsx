import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FreeModePauseMenu } from "../components/FreeModePauseMenu";
import PianoHero from "../components/PianoHero";

type FreeGameState = {
  instrument?: "piano" | "guitar" | "bass";
};

function FreeGamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { instrument } = (location.state as FreeGameState) ?? {};
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="game-page">
      {/* Navbar / Player spécifique au mode libre */}

      {instrument === "piano" &&
        (isPaused ? (
          <FreeModePauseMenu
            isOpen
            onResume={() => setIsPaused(false)}
            onQuit={() => navigate("/")}
          />
        ) : (
          <PianoHero
            isPaused={false}
            onPause={() => setIsPaused(true)}
            onResume={() => setIsPaused(false)}
          />
        ))}
    </div>
  );
}

export default FreeGamePage;
