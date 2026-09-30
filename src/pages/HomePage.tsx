import { useState } from "react";
import { useNavigate } from "react-router-dom";

type GameMode = "upload" | "random" | "free";
type Instrument = "piano" | "guitar" | "triangle";

function HomePage() {
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);

    const [gameMode, setGameMode] = useState<GameMode | null>(null);
    const [instrument, setInstrument] = useState<Instrument | null>(null);

    const handleStart = () => {
        if (!gameMode || !instrument) {
            return;
        }

        navigate("/game", {
            state: {
                gameMode,
                instrument,
            },
        });
    };

    return (
        <div className="home-page">
            <button onClick={() => setIsOpen(true)}>Jouer</button>

            {isOpen && (
                <div className="game-modal">
                    <h2>Choisis ton mode</h2>

                    <div>
                        <button onClick={() => setGameMode("upload")}>
                            Charger ma musique
                        </button>

                        <button onClick={() => setGameMode("random")}>
                            Musique aléatoire
                        </button>

                        <button onClick={() => setGameMode("free")}>
                            Mode libre
                        </button>
                    </div>

                    <h2>Choisis ta sonorité</h2>

                    <div>
                        <button onClick={() => setInstrument("piano")}>
                            Piano
                        </button>

                        <button onClick={() => setInstrument("guitar")}>
                            Guitare
                        </button>

                        <button onClick={() => setInstrument("triangle")}>
                            Triangle
                        </button>
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={!gameMode || !instrument}
                    >
                        Commencer
                    </button>

                    <button onClick={() => setIsOpen(false)}>Fermer</button>
                </div>
            )}
        </div>
    );
}

export default HomePage;
