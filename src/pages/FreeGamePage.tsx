import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Chrono } from "../components/Chrono";
import { FreeModePauseMenu } from "../components/FreeModePauseMenu";
import type { Instrument } from "../components/InstrumentSelector";
import PianoHero from "../components/PianoHero";

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

  const handleNotePlayed = () => setHasStarted(true);
  const pauseSession = () => setIsPaused(true);
  const resumeSession = () => setIsPaused(false);

  const restartSession = () => {
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
              onPause={pauseSession}
              onResume={resumeSession}
            />
          </div>
          {isPaused && !isReplaying && (
            <FreeModePauseMenu
              isOpen
              duration={duration}
              instrument={instrument}
              onChangeInstrument={setInstrument}
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
    </div>
  );
}

export default FreeGamePage;
