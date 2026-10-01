import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PlayButton from "../components/ui/PlayButton";
import { GameSetupPopup } from "../components/GameSetupPopup";

function HomePage() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const navigate = useNavigate();

    const handleStart = (
        musicMode: "upload" | "random" | "free",
        instrument: "piano" | "guitar" | "bass",
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
