import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SongId } from "../music/library/SongLibrary.ts";
import { GameSetupPopup } from "../components/GameSetupPopup";
import PlayButton from "../components/ui/PlayButton";

function HomePage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();

  const handleStart = (
    musicMode: "upload" | "library" | "free",
    instrument: "piano" | "guitar" | "bass",
    songId?: SongId,
  ) => {
    if (musicMode === "free") {
      navigate("/free-game", {
        state: { instrument },
      });
      return;
    }

    navigate("/game", {
      state: {
        musicMode,
        instrument,
        songId,
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <button
        type="button"
        onClick={() => navigate("/robot")}
        className="fixed right-5 top-5 z-10 rounded-md border border-white/30 bg-black/50 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Reachy Mini
      </button>
      <PlayButton onClick={() => setIsPopupOpen(true)} />

      {isPopupOpen && (
        <GameSetupPopup
          onClose={() => setIsPopupOpen(false)}
          onStart={handleStart}
        />
      )}
    </div>
  );
}

export default HomePage;
