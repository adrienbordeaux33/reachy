import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FreeModePauseMenu } from "../components/FreeModePauseMenu";
import PianoHero from "../components/PianoHero";
import { MediaPlayer } from "../components/ui/MediaPlayer";

type FreeGameState = {
    instrument?: "piano" | "guitar" | "bass";
};

function FreeGamePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { instrument } = (location.state as FreeGameState) ?? {};
    const [isPaused, setIsPaused] = useState(false);
    const [shouldSaveRecording, setShouldSaveRecording] = useState(false);
    const [saveStatus, setSaveStatus] = useState("");

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

    return (
        <div className="game-page">
            {/* Navbar / Player spécifique au mode libre */}

            {instrument && (
                <>
                    <div className={isPaused ? "hidden" : undefined}>
                        <PianoHero
                            instrument={instrument}
                            isPaused={isPaused}
                            shouldSaveRecording={shouldSaveRecording}
                            onRecordingReady={downloadRecording}
                            onRecordingError={handleRecordingError}
                        />
                        <MediaPlayer onPause={() => setIsPaused(true)} />
                    </div>
                    {isPaused && (
                        <FreeModePauseMenu
                            isOpen
                            saveStatus={saveStatus}
                            isSaveDisabled={shouldSaveRecording}
                            onResume={() => setIsPaused(false)}
                            onSave={() => {
                                setSaveStatus(
                                    "Préparation de l'enregistrement...",
                                );
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
