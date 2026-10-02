import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MusicSong } from "../music/model/MusicSong";
import PlayButton from "../components/ui/PlayButton";
import { GameSetupPopup } from "../components/GameSetupPopup";

function HomePage() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const navigate = useNavigate();

    const handleStart = (
        musicMode: "upload" | "library" | "free",
        instrument: "piano" | "guitar" | "bass",
        songId?: "mario" | "pirate",
        uploadedSong?: MusicSong,
    ) => {
        if (musicMode === "free") {
            navigate("/free-game", {
                state: {
                    instrument,
                },
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
            <div
                className="
                relative
                flex w-full max-w-3xl
                flex-col items-center
                overflow-hidden
                rounded-[40px]
                border border-cyan-300/70
                bg-slate-950/45
                px-8 py-16
                shadow-[0_0_25px_rgba(34,211,238,0.35),0_0_55px_rgba(217,70,239,0.20)]
                backdrop-blur-xl
                md:px-16 md:py-20
            "
            >
                {/* Lueur intérieure */}
                <div
                    className="
                    pointer-events-none
                    absolute inset-0
                    rounded-[40px]
                    border border-fuchsia-400/30
                    shadow-[inset_0_0_35px_rgba(34,211,238,0.12)]
                "
                />

                {/* Titre */}
                <div className="relative z-10 mb-12 text-center">
                    <h1
                        className="
                        text-6xl
                        font-black
                        italic
                        tracking-tight
                        text-white
                        drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]
                        md:text-8xl
                    "
                    >
                        REACHY
                    </h1>

                    {/* Petite déco néon */}
                    <div className="mt-4 flex items-center justify-center gap-3">
                        <span className="h-px w-14 bg-gradient-to-r from-transparent to-cyan-400" />
                        <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,1)]" />
                        <span className="h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,1)]" />
                        <span className="h-px w-14 bg-gradient-to-l from-transparent to-fuchsia-400" />
                    </div>
                </div>

                {/* Bouton existant */}
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
