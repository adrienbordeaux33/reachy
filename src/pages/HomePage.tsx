import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PlayButton from "../components/ui/PlayButton";
import { GameSetupPopup } from "../components/GameSetupPopup";

function HomePage() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const navigate = useNavigate();

    const handleStart = (
        musicMode: "upload" | "library" | "free",
        instrument: "piano" | "guitar" | "bass",
        songId?: "mario" | "pirate",
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
            },
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-8">
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
