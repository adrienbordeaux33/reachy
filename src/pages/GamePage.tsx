import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { PauseMenu } from "../components/PauseMenu";
import { MediaPlayer } from "../components/ui/MediaPlayer";
import SongPianoHero, {type SongGameResult} from "../components/song-piano/SongPianoHero";
import { EndGamePopup } from "../components/EndGamePopup";
import {getSongDefinition, type SongId,} from "../music/library/SongLibrary";
import type {PlayMode} from "../game/model/PlayMode.ts";
import type {Instrument} from "../audio/Instrument.ts";

type GameState = {
    musicMode?: "upload" | "library";
    instrument?: Instrument;
    songId?: SongId;
};


function GamePage() {
    const location = useLocation();
    const navigate = useNavigate();

    const { musicMode,
        instrument: initialInstrument,
        songId } = (location.state as GameState) ?? {};

    const selectedSong = getSongDefinition(songId ?? "mario");

    const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(initialInstrument ?? "piano");
    const [isInstrumentSelectorOpen, setIsInstrumentSelectorOpen] = useState(false);

    // États qui seront partagés avec le futur PianoHero
    const [playMode, setPlayMode] = useState<PlayMode>("play");
    const [tempo, setTempo] = useState(100);
    const [isPaused, setIsPaused] = useState(false);
    const [restartKey, setRestartKey] = useState(0);

    const [gameResult, setGameResult] = useState<SongGameResult | null>(null);

    const totalAttempts =
        gameResult === null
            ? 0
            : gameResult.hits + gameResult.misses + gameResult.wrongHits;

    const successRate =
        gameResult === null ||
        totalAttempts === 0
            ? 0
            : Math.round((gameResult.hits / totalAttempts) * 100);

    const handleGameFinished =
        useCallback(
            (result: SongGameResult) => {
                setGameResult(result);
            },
            [],
        );

    const handleRestart = () => {
        setGameResult(null);

        setRestartKey(
            (value) => value + 1,
        );

        setIsInstrumentSelectorOpen(false);
        setIsPaused(false);
    };

    const handlePlayModeChange = (
        newMode: PlayMode,
    ) => {
        if (newMode === playMode) {
            return;
        }

        setPlayMode(newMode);

        setGameResult(null);
        setIsPaused(false);

        setRestartKey(
            (previous) => previous + 1,
        );
    };

    return (
        <div className="min-h-screen w-full pt-30">

            <SongPianoHero
                key={selectedSong.id}
                songSource={selectedSong.source}
                playMode={playMode}
                tempo={tempo}
                instrument={selectedInstrument}
                isPaused={isPaused}
                restartKey={restartKey}
                onFinished={handleGameFinished}
            />

            <MediaPlayer
                playMode={playMode}
                tempo={tempo}
                onPlayModeChange={handlePlayModeChange}
                onTempoChange={setTempo}
                onPause={() => setIsPaused(true)}
            />

            {isPaused && (
                <PauseMenu
                    onResume={() => {
                        setIsInstrumentSelectorOpen(false);
                        setIsPaused(false);
                    }}
                    onRestart={handleRestart}
                    onChangeInstrument={() => {
                        setIsInstrumentSelectorOpen(
                            (previous) => !previous,
                        );
                    }}
                    onQuit={() => navigate("/")}
                    showInstrumentSelector={
                        isInstrumentSelectorOpen
                    }
                    instrument={selectedInstrument}
                    onInstrumentChange={
                        setSelectedInstrument
                    }
                />
            )}

            {gameResult !== null && (
                <div className="fixed inset-0 z-50">
                    <EndGamePopup
                        playMode={playMode}
                        score={gameResult.score}
                        successRate={successRate}
                        onRestart={handleRestart}
                        onQuit={() => navigate("/")}
                    />
                </div>
            )}

            {/* Informations temporaires pour le développement */}
            <div className="mt-4 text-center text-sm text-white/50">
                <p>Source : {musicMode}</p>
                <p>Instrument : {initialInstrument}</p>
                <p>Pause : {isPaused ? "oui" : "non"}</p>
                <p>Morceau : {songId ?? "aucun"}</p>
            </div>
        </div>
    );
}

export default GamePage;
