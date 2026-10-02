import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Instrument } from "../audio/Instrument.ts";
import type { PlayMode } from "../game/model/PlayMode.ts";
import { getSongDefinition, type SongId } from "../music/library/SongLibrary";
import type { UploadedSong } from "../music/model/UploadedSong.ts";
import { EndGamePopup } from "../components/EndGamePopup";
import { PauseMenu } from "../components/PauseMenu";
import {
    ReachyRobot,
    type ReachyRobotAction,
    type ReachyRobotActionEvent,
} from "../components/ReachyRobot/ReachyRobot";
import { MediaPlayer } from "../components/ui/MediaPlayer";
import SongPianoHero, {
    type SongGameResult,
} from "../components/song-piano/SongPianoHero";

type GameState = {
    musicMode?: "upload" | "library";
    instrument?: Instrument;
    songId?: SongId;
    uploadedSong?: UploadedSong;
};

interface WidgetPosition {
    left: number;
    top: number;
}

interface WidgetDrag {
    pointerId: number;
    offsetX: number;
    offsetY: number;
}

function GamePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        musicMode,
        instrument: initialInstrument,
        songId,
        uploadedSong,
    } = (location.state as GameState) ?? {};
    const selectedSong =
        musicMode === "upload" && uploadedSong
            ? uploadedSong
            : getSongDefinition(songId ?? "mario");

    const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(
        initialInstrument ?? "piano",
    );
    const [isInstrumentSelectorOpen, setIsInstrumentSelectorOpen] =
        useState(false);
    const [playMode, setPlayMode] = useState<PlayMode>("play");
    const [tempo, setTempo] = useState(100);
    const [isPaused, setIsPaused] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [restartKey, setRestartKey] = useState(0);
    const [resetKey, setResetKey] = useState(0);
    const [gameResult, setGameResult] = useState<SongGameResult | null>(null);
    const [robotAction, setRobotAction] =
        useState<ReachyRobotActionEvent | null>(null);
    const [reachyWidgetPosition, setReachyWidgetPosition] =
        useState<WidgetPosition | null>(null);
    const robotActionIdRef = useRef(0);
    const reachyWidgetRef = useRef<HTMLElement | null>(null);
    const widgetDragRef = useRef<WidgetDrag | null>(null);

    const totalAttempts = gameResult
        ? gameResult.hits + gameResult.misses + gameResult.wrongHits
        : 0;
    const successRate =
        gameResult === null || totalAttempts === 0
            ? 0
            : Math.round((gameResult.hits / totalAttempts) * 100);

    const handleRobotEvent = useCallback((action: ReachyRobotAction) => {
        robotActionIdRef.current += 1;
        setRobotAction({
            id: `game-${robotActionIdRef.current}`,
            action,
        });
    }, []);

    const handleGameFinished = useCallback((result: SongGameResult) => {
        setGameResult(result);
        setHasStarted(false);
    }, []);

    const handleRestart = () => {
        setGameResult(null);
        setRestartKey((value) => value + 1);
        setIsInstrumentSelectorOpen(false);
        setIsPaused(false);
        setHasStarted(false);
    };

    const handlePlay = () => {
        setGameResult(null);
        setIsPaused(false);
        setRestartKey((value) => value + 1);
    };

    const handlePlayModeChange = (newMode: PlayMode) => {
        if (newMode === playMode) return;

        setPlayMode(newMode);
        setGameResult(null);
        setIsPaused(false);
        setIsInstrumentSelectorOpen(false);
        setHasStarted(false);
        setResetKey((value) => value + 1);
    };
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code !== "Space" || gameResult !== null) return;

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
    const handleWidgetPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
        const target = event.target;
        if (
            !(target instanceof HTMLElement) ||
            !target.closest(".reachy-robot__header") ||
            target.closest("button")
        ) {
            return;
        }

        const widget = reachyWidgetRef.current;
        if (!widget) return;

        const bounds = widget.getBoundingClientRect();
        widgetDragRef.current = {
            pointerId: event.pointerId,
            offsetX: event.clientX - bounds.left,
            offsetY: event.clientY - bounds.top,
        };
        setReachyWidgetPosition({ left: bounds.left, top: bounds.top });
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
    };

    const handleWidgetPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
        const drag = widgetDragRef.current;
        const widget = reachyWidgetRef.current;
        if (!drag || drag.pointerId !== event.pointerId || !widget) return;

        const bounds = widget.getBoundingClientRect();
        const maxLeft = Math.max(8, window.innerWidth - bounds.width - 8);
        const maxTop = Math.max(8, window.innerHeight - bounds.height - 8);

        setReachyWidgetPosition({
            left: Math.min(maxLeft, Math.max(8, event.clientX - drag.offsetX)),
            top: Math.min(maxTop, Math.max(8, event.clientY - drag.offsetY)),
        });
    };

    const handleWidgetPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
        if (widgetDragRef.current?.pointerId !== event.pointerId) return;

        widgetDragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    return (
        <div className="min-h-screen w-full pt-30">
            <SongPianoHero
                key={selectedSong.id}
                songSource={selectedSong.source}
                songFormat={selectedSong.format}
                instrument={selectedInstrument}
                playMode={playMode}
                tempo={tempo}
                isPaused={isPaused}
                restartKey={restartKey}
                resetKey={resetKey}
                onFinished={handleGameFinished}
                onRobotEvent={handleRobotEvent}
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
                    onResume={() => {
                        setIsInstrumentSelectorOpen(false);
                        setIsPaused(false);
                    }}
                    onRestart={handleRestart}
                    onChangeInstrument={() => {
                        setIsInstrumentSelectorOpen((previous) => !previous);
                    }}
                    onQuit={() => navigate("/")}
                    showInstrumentSelector={isInstrumentSelectorOpen}
                    instrument={selectedInstrument}
                    onInstrumentChange={setSelectedInstrument}
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

            <aside
                ref={reachyWidgetRef}
                className="fixed bottom-4 right-4 z-40 max-h-[calc(100dvh-2rem)] w-[min(340px,calc(100vw-2rem))] overflow-y-auto"
                style={
                    reachyWidgetPosition
                        ? {
                              left: reachyWidgetPosition.left,
                              top: reachyWidgetPosition.top,
                              right: "auto",
                              bottom: "auto",
                          }
                        : undefined
                }
                onPointerDown={handleWidgetPointerDown}
                onPointerMove={handleWidgetPointerMove}
                onPointerUp={handleWidgetPointerUp}
                onPointerCancel={handleWidgetPointerUp}
            >
                <ReachyRobot action={robotAction} compact />
            </aside>
        </div>
    );
}

export default GamePage;
