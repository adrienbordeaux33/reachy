import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { PauseMenu } from "../components/PauseMenu";
import { MediaPlayer } from "../components/ui/MediaPlayer";
import SongPianoHero, {
    type SongGameResult,
} from "../components/song-piano/SongPianoHero";
import { EndGamePopup } from "../components/EndGamePopup";
import { getSongDefinition, type SongId } from "../music/library/SongLibrary";
import type { PlayMode } from "../game/model/PlayMode.ts";

type GameState = {
    musicMode?: "upload" | "library";
    instrument?: "piano" | "guitar" | "bass";
    songId?: SongId;
};

function GamePage() {
    const location = useLocation();
    const navigate = useNavigate();

    const { songId } = (location.state as GameState) ?? {};
    const selectedSong = getSongDefinition(songId ?? "mario");

    // États qui seront partagés avec le futur PianoHero
    const [playMode, setPlayMode] = useState<PlayMode>("play");
    const [tempo, setTempo] = useState(100);
    const [isPaused, setIsPaused] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [restartKey, setRestartKey] = useState(0);
    const [gameResult, setGameResult] = useState<SongGameResult | null>(null);

    const totalAttempts =
        gameResult === null
            ? 0
            : gameResult.hits + gameResult.misses + gameResult.wrongHits;

    const successRate =
        gameResult === null || totalAttempts === 0
            ? 0
            : Math.round((gameResult.hits / totalAttempts) * 100);

    const handleGameFinished = useCallback((result: SongGameResult) => {
        setGameResult(result);
        setHasStarted(false);
    }, []);

    const handleRestart = () => {
        setGameResult(null);

        setRestartKey((value) => value + 1);

        setIsPaused(false);
    };

    const handlePlay = () => {
        setGameResult(null);
        setIsPaused(false);
        setRestartKey((value) => value + 1);
    };

    const handlePlayModeChange = (newMode: PlayMode) => {
        if (newMode === playMode) {
            return;
        }

        setPlayMode(newMode);

        setGameResult(null);
        setIsPaused(false);

        setHasStarted(false);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code !== "Space" || gameResult !== null) {
                return;
            }

            event.preventDefault();

            if (!hasStarted) {
                handlePlay();
                return;
            }

            setIsPaused((previous) => !previous);
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [hasStarted, gameResult]);

    return (
        <div className="min-h-screen w-full pt-4">
            {" "}
            <SongPianoHero
                key={`${selectedSong.id}-${playMode}`}
                songSource={selectedSong.source}
                playMode={playMode}
                tempo={tempo}
                isPaused={isPaused}
                restartKey={restartKey}
                onFinished={handleGameFinished}
                onStarted={() => setHasStarted(true)}
            />
            <MediaPlayer
                playMode={playMode}
                tempo={tempo}
                hasStarted={hasStarted}
                isPaused={isPaused}
                onPlayModeChange={handlePlayModeChange}
                onTempoChange={setTempo}
                onPlay={handlePlay}
                onPause={() => setIsPaused(true)}
            />
            {isPaused && (
                <PauseMenu
                    onResume={() => setIsPaused(false)}
                    onRestart={handleRestart}
                    onChangeInstrument={() => {
                        console.log("Changer instrument");
                    }}
                    onQuit={() => navigate("/")}
                />
            )}
            {gameResult !== null && (
                <div className="fixed inset-0 z-50">
                    <EndGamePopup
                        playMode={playMode}
                        score={gameResult.score}
                        successRate={successRate}
                        hits={gameResult.hits}
                        misses={gameResult.misses}
                        wrongHits={gameResult.wrongHits}
                        onRestart={handleRestart}
                        onQuit={() => navigate("/")}
                    />
                </div>
            )}
        </div>
    );
}

export default GamePage;
