import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { PauseMenu } from "../components/PauseMenu";
import {
  ReachyRobot,
  type ReachyRobotAction,
  type ReachyRobotActionEvent,
} from "../components/ReachyRobot/ReachyRobot";
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

  const { musicMode, instrument, songId } = (location.state as GameState) ?? {};
  // États qui seront partagés avec le futur PianoHero
  const [playMode, setPlayMode] = useState<PlayMode>("play");
  const [tempo, setTempo] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [robotAction, setRobotAction] = useState<ReachyRobotActionEvent | null>(
    null,
  );
  const robotActionIdRef = useRef(0);

  const handleRobotEvent = (action: ReachyRobotAction) => {
    robotActionIdRef.current += 1;
    setRobotAction({
      id: `game-${robotActionIdRef.current}`,
      action,
    });
  };

  return (
    <div className="min-h-screen w-full">
      <SongPianoHero onRobotEvent={handleRobotEvent} />

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

      <aside className="fixed bottom-4 right-4 z-40 max-h-[calc(100dvh-2rem)] w-[min(340px,calc(100vw-2rem))] overflow-y-auto">
        <ReachyRobot action={robotAction} compact />
      </aside>

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
