import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Instrument } from "../audio/Instrument.ts";
import { Chrono } from "../components/Chrono";
import { FreeModePauseMenu } from "../components/FreeModePauseMenu";
import PianoHero from "../components/PianoHero";
import {
  ReachyRobot,
  type ReachyRobotAction,
  type ReachyRobotActionEvent,
} from "../components/ReachyRobot/ReachyRobot";
import { MediaPlayer } from "../components/ui/MediaPlayer";

type FreeGameState = {
  instrument?: Instrument;
};

function FreeGamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { instrument: initialInstrument } =
    (location.state as FreeGameState) ?? {};
  const [instrument, setInstrument] = useState(initialInstrument);
  const [isPaused, setIsPaused] = useState(false);
  const [shouldSaveRecording, setShouldSaveRecording] = useState(false);
  const [replayRequest, setReplayRequest] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [saveStatus, setSaveStatus] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [robotAction, setRobotAction] = useState<ReachyRobotActionEvent | null>(
    null,
  );
  const robotActionIdRef = useRef(0);
  const robotDanceActiveRef = useRef(false);

  const handleRobotEvent = useCallback((action: ReachyRobotAction) => {
    robotActionIdRef.current += 1;
    setRobotAction({
      id: `free-game-${robotActionIdRef.current}`,
      action,
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !isPaused) {
        event.preventDefault();
        setIsPaused(true);
        if (robotDanceActiveRef.current) {
          robotDanceActiveRef.current = false;
          handleRobotEvent("dance-stop");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleRobotEvent, isPaused]);
  const downloadRecording = (recording: Blob) => {
    const extension = recording.type.includes("mp4")
      ? "m4a"
      : recording.type.includes("ogg")
        ? "ogg"
        : recording.type.includes("midi")
          ? "mid"
          : "webm";

    const downloadLink = document.createElement("a");
    const recordingUrl = URL.createObjectURL(recording);

    downloadLink.href = recordingUrl;
    downloadLink.download = `reachy-composition-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.${extension}`;

    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    window.setTimeout(() => URL.revokeObjectURL(recordingUrl), 1000);

    setSaveStatus("Téléchargement de la composition lancé.");
  };

  const handleRecordingError = (message: string) => {
    setSaveStatus(message);
    setShouldSaveRecording(false);
  };
  const handleNotePlayed = () => {
    setHasStarted(true);
    if (robotDanceActiveRef.current) return;

    robotDanceActiveRef.current = true;
    handleRobotEvent("dance-start");
  };

  const pauseSession = () => {
    setIsPaused(true);
    if (!robotDanceActiveRef.current) return;

    robotDanceActiveRef.current = false;
    handleRobotEvent("dance-stop");
  };

  const resumeSession = () => {
    setIsPaused(false);
    if (!hasStarted || robotDanceActiveRef.current) return;

    robotDanceActiveRef.current = true;
    handleRobotEvent("dance-start");
  };

  const restartSession = () => {
    if (robotDanceActiveRef.current) {
      robotDanceActiveRef.current = false;
      handleRobotEvent("dance-stop");
    }
    setHasStarted(false);
    setDuration("0:00");
    setIsPaused(false);
    setShouldSaveRecording(false);
    setReplayRequest(0);
    setIsReplaying(false);
    setSaveStatus("");
    setSessionKey((key) => key + 1);
  };

  return (
    <div className="game-page">
      <Chrono
        hasStarted={hasStarted}
        isPaused={isPaused}
        resetKey={sessionKey}
        onDurationChange={setDuration}
      />

      {instrument && (
        <>
          <div className={isPaused && !isReplaying ? "hidden" : undefined}>
            <PianoHero
              key={sessionKey}
              instrument={instrument}
              isPaused={isPaused}
              isReplaying={isReplaying}
              shouldSaveRecording={shouldSaveRecording}
              replayRequest={replayRequest}
              onRecordingReady={downloadRecording}
              onRecordingError={handleRecordingError}
              onNotePlayed={handleNotePlayed}
              onReplayComplete={() => setIsReplaying(false)}
              onStopReplay={() => setIsReplaying(false)}
            />
            <MediaPlayer onPause={pauseSession} />
          </div>
          {isPaused && !isReplaying && (
            <FreeModePauseMenu
              isOpen
              duration={duration}
              instrument={instrument}
              onChangeInstrument={(nextInstrument) => {
                setInstrument(nextInstrument);
                if (robotDanceActiveRef.current) {
                  robotDanceActiveRef.current = false;
                  handleRobotEvent("dance-stop");
                }
              }}
              saveStatus={saveStatus}
              isSaveDisabled={shouldSaveRecording}
              onResume={resumeSession}
              onListen={() => {
                setSaveStatus("");
                setIsReplaying(true);
                setReplayRequest((request) => request + 1);
              }}
              onRestart={restartSession}
              onSave={() => {
                setSaveStatus("Préparation de l'enregistrement...");
                setShouldSaveRecording(true);
              }}
              onQuit={() => navigate("/")}
            />
          )}
        </>
      )}

      <aside className="fixed bottom-4 right-4 z-40 max-h-[calc(100dvh-2rem)] w-[min(340px,calc(100vw-2rem))] overflow-y-auto">
        <ReachyRobot action={robotAction} compact />
      </aside>
    </div>
  );
}

export default FreeGamePage;
