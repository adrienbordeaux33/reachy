import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { PauseMenu } from "../components/PauseMenu";
import { MediaPlayer } from "../components/ui/MediaPlayer";
import SongPianoHero from "../components/song-piano/SongPianoHero";

type GameState = {
    musicMode?: "upload" | "library";
    instrument?: "piano" | "guitar" | "bass";
    songId?: "mario" | "pirate";
};

type PlayMode = "listen" | "play";

function GamePage() {
    const location = useLocation();
    const navigate = useNavigate();

    const { musicMode, instrument, songId } =
        (location.state as GameState) ?? {};
    // États qui seront partagés avec le futur PianoHero
    const [playMode, setPlayMode] = useState<PlayMode>("play");
    const [tempo, setTempo] = useState(100);
    const [isPaused, setIsPaused] = useState(false);

    return (
        <div className="min-h-screen w-full pt-30">

            <SongPianoHero isPaused={isPaused}/>

            <MediaPlayer
                playMode={playMode}
                tempo={tempo}
                onPlayModeChange={setPlayMode}
                onTempoChange={setTempo}
                onPause={() => setIsPaused(true)}
            />

            {isPaused && (
                <PauseMenu
                    onResume={() => setIsPaused(false)}
                    onRestart={() => {
                        console.log("Recommencer");
                        setIsPaused(false);
                    }}
                    onChangeInstrument={() => {
                        console.log("Changer instrument");
                    }}
                    onQuit={() => navigate("/")}
                />
            )}

            {/* Informations temporaires pour le développement */}
            <div className="mt-4 text-center text-sm text-white/50">
                <p>Source : {musicMode}</p>
                <p>Instrument : {instrument}</p>
                <p>Pause : {isPaused ? "oui" : "non"}</p>
                <p>Morceau : {songId ?? "aucun"}</p>
            </div>
        </div>
    );
}

export default GamePage;
