import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SongId } from "../music/library/SongLibrary.ts";
import type { UploadedSong } from "../music/model/UploadedSong.ts";
import { GameSetupPopup } from "../components/GameSetupPopup";
import PlayButton from "../components/ui/PlayButton";

function HomePage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();

  const handleStart = (
    musicMode: "upload" | "library" | "free",
    instrument: "piano" | "guitar" | "bass",
    songId?: SongId,
    uploadedSong?: UploadedSong,
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
        uploadedSong,
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

      <div className="relative flex w-full max-w-3xl flex-col items-center overflow-hidden rounded-[40px] border border-cyan-300/70 bg-slate-950/45 px-8 py-16 shadow-[0_0_25px_rgba(34,211,238,0.35),0_0_55px_rgba(217,70,239,0.20)] backdrop-blur-xl md:px-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 rounded-[40px] border border-fuchsia-400/30 shadow-[inset_0_0_35px_rgba(34,211,238,0.12)]" />

        <div className="relative z-10 mb-12 text-center">
          <h1 className="text-6xl font-black italic tracking-tight text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.35)] md:text-8xl">
            REACHY
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="h-px w-14 bg-gradient-to-r from-transparent to-cyan-400" />
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,1)]" />
            <span className="h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,1)]" />
            <span className="h-px w-14 bg-gradient-to-l from-transparent to-fuchsia-400" />
          </div>
        </div>

        <div className="relative z-10">
          <PlayButton onClick={() => setIsPopupOpen(true)} />
        </div>
      </div>

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
