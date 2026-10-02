import { useCallback, useEffect, useRef, useState, useMemo } from "react";

import PianoCanvas from "../canvas/PianoCanvas";

import { TxtMusicParser } from "../../music/parsers/TxtMusicParser";
import { BeatmapGenerator } from "../../game/beatmap/BeatmapGenerator";
import {
    GameTimeline,
    NOTE_TRAVEL_TIME,
} from "../../game/timeline/GameTimeline";
import { MusicPlayer } from "../../music/player/MusicPlayer";
import { GameClock } from "../../game/clock/GameClock.ts";
import { DefaultGameEngine } from "../../game/engine/DefaultGameEngine";
import { attachKeyboardInput } from "../input/keyboardInput";
import type { PlayMode } from "../../game/model/PlayMode.ts";

const MIN_PLAYBACK_RATE = 0.25;
const MAX_PLAYBACK_RATE = 2;

export interface SongGameResult {
    mode: PlayMode;
    score: number;
    hits: number;
    misses: number;
    wrongHits: number;
}

interface SongPianoHeroProps {
    songSource: string;
    tempo: number;
    isPaused?: boolean;
    playMode: "listen" | "play";
    restartKey?: number;
    onFinished: (result: SongGameResult) => void;
    onStarted?: () => void;
}

const EMPTY_PRESSED_NOTES = new Set<number>();

const LEAD_IN = NOTE_TRAVEL_TIME;

export default function SongPianoHero({
    songSource,
    tempo,
    isPaused,
    playMode,
    restartKey,
    onFinished,
    onStarted,
}: SongPianoHeroProps) {
    const { song, engine, timeline } = useMemo(() => {
        const parser = new TxtMusicParser();

        const beatmapGenerator = new BeatmapGenerator();

        const song = parser.parse(songSource);

        const beatmap = beatmapGenerator.generate(song);

        const engine = new DefaultGameEngine();

        engine.load(beatmap);

        const timeline = new GameTimeline(beatmap, {
            travelTime: NOTE_TRAVEL_TIME,
            postHitTime: 0.15,
        });

        return {
            song,
            engine,
            timeline,
        };
    }, [songSource]);

    const playbackRate = Math.min(
        MAX_PLAYBACK_RATE,
        Math.max(MIN_PLAYBACK_RATE, tempo / 100),
    );
    const currentPlaybackRateRef = useRef(playbackRate);

    const playerRef = useRef<MusicPlayer | null>(null);

    const clockRef = useRef(new GameClock());

    const audioContextRef = useRef<AudioContext | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);

    const [pressedNotes, setPressedNotes] = useState<Set<number>>(
        () => new Set(),
    );

    const [gameState, setGameState] = useState(() => ({
        ...engine.getState(),
    }));

    type GameFeedback = {
        id: number;
        type: "hit" | "wrong" | "miss" | "combo";
        label: string;
        icon: string;
    } | null;

    const [feedback, setFeedback] = useState<GameFeedback>(null);
    const feedbackIdRef = useRef(0);

    const hasFinishedRef = useRef(false);

    const previousRestartKeyRef = useRef(restartKey);

    const lastUiStateRef = useRef(engine.getState());

    const getSongTime = useCallback(() => {
        return clockRef.current.getCurrentTime() - LEAD_IN;
    }, []);

    const getVisibleNotes = useCallback(() => {
        const currentTime = getSongTime();

        const visibleNotes = timeline.getVisibleNotes(currentTime);

        if (playMode === "listen") {
            return visibleNotes;
        }

        return visibleNotes.filter(
            ({ note }) => engine.getNoteStatus(note.id) !== "hit",
        );
    }, [getSongTime, timeline, engine, playMode]);

    const syncGameState = useCallback(() => {
        const next = engine.getState();

        const previous = lastUiStateRef.current;

        if (
            next.score === previous.score &&
            next.combo === previous.combo &&
            next.hits === previous.hits &&
            next.misses === previous.misses &&
            next.wrongHits === previous.wrongHits &&
            next.status === previous.status
        ) {
            return;
        }

        const snapshot = {
            ...next,
        };
        if (playMode === "play") {
            let nextFeedback: GameFeedback = null;

            if (next.wrongHits > previous.wrongHits) {
                nextFeedback = {
                    id: ++feedbackIdRef.current,
                    type: "wrong",
                    label: "WRONG!",
                    icon: "⚡",
                };
            } else if (next.misses > previous.misses) {
                nextFeedback = {
                    id: ++feedbackIdRef.current,
                    type: "miss",
                    label: "MISS!",
                    icon: "✕",
                };
            } else if (next.hits > previous.hits) {
                const isComboMoment = next.combo >= 5 && next.combo % 5 === 0;

                nextFeedback = {
                    id: ++feedbackIdRef.current,
                    type: isComboMoment ? "combo" : "hit",
                    label: isComboMoment ? `COMBO ×${next.combo}` : "PERFECT!",
                    icon: isComboMoment ? "🔥" : "★",
                };
            }

            if (nextFeedback !== null) {
                setFeedback(nextFeedback);
            }
        }
        lastUiStateRef.current = snapshot;

        setGameState(snapshot);
    }, [engine, playMode]);

    /**
     * Lance/recommence le morceau.
     */
    const startGame = useCallback(async () => {
        playerRef.current?.stop();

        let audioContext = audioContextRef.current;

        if (audioContext === null) {
            audioContext = new AudioContext();
            audioContextRef.current = audioContext;
        }

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        const gameStartTime = audioContext.currentTime + 0.05;

        const songStartTime = gameStartTime + NOTE_TRAVEL_TIME / playbackRate;

        const player = new MusicPlayer();

        playerRef.current = player;

        hasFinishedRef.current = false;
        engine.restart();
        syncGameState();

        player.play(song, audioContext, songStartTime, playbackRate, 0);

        clockRef.current.start(audioContext, gameStartTime);

        clockRef.current.setPlaybackRate(playbackRate);

        setPressedNotes(new Set());
        setIsPlaying(true);
        onStarted?.();
    }, [engine, song, syncGameState, playbackRate, onStarted]);

    useEffect(() => {
        const clock = clockRef.current;

        return () => {
            playerRef.current?.stop();

            clock.stop();
            engine.stop();

            const audioContext = audioContextRef.current;

            if (audioContext) {
                void audioContext.close();

                audioContextRef.current = null;
            }
        };
    }, [engine]);

    useEffect(() => {
        const detachKeyboard = attachKeyboardInput({
            onPress: (midi) => {
                if (isPaused || playMode === "listen") {
                    return;
                }

                setPressedNotes((previous) => {
                    const next = new Set(previous);

                    next.add(midi);

                    return next;
                });

                engine.notePressed(midi, getSongTime());

                syncGameState();
            },

            onRelease: (midi) => {
                setPressedNotes((previous) => {
                    const next = new Set(previous);

                    next.delete(midi);

                    return next;
                });

                if (isPaused || playMode === "listen") {
                    return;
                }

                engine.noteReleased(midi, getSongTime());
            },
        });

        return detachKeyboard;
    }, [isPaused, getSongTime, syncGameState, engine, playMode]);

    useEffect(() => {
        let frameId = 0;

        const updateGame = () => {
            engine.update(getSongTime());

            syncGameState();

            const state = engine.getState();

            if (state.status === "finished" && !hasFinishedRef.current) {
                hasFinishedRef.current = true;

                playerRef.current?.stop();

                setIsPlaying(false);

                onFinished({
                    mode: playMode,
                    score: state.score,
                    hits: state.hits,
                    misses: state.misses,
                    wrongHits: state.wrongHits,
                });
            }

            frameId = requestAnimationFrame(updateGame);
        };

        frameId = requestAnimationFrame(updateGame);

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [getSongTime, syncGameState, onFinished, engine]);
    useEffect(() => {
        const audioContext = audioContextRef.current;

        if (audioContext === null || !isPlaying) {
            return;
        }

        if (isPaused) {
            clockRef.current.pause();
            engine.pause();

            void audioContext.suspend();

            return;
        }

        void audioContext.resume().then(() => {
            clockRef.current.resume();
            engine.resume();
        });
    }, [engine, isPaused, isPlaying]);

    useEffect(() => {
        if (restartKey === previousRestartKeyRef.current) {
            return;
        }

        previousRestartKeyRef.current = restartKey;

        void startGame();
    }, [restartKey, startGame]);

    useEffect(() => {
        clockRef.current.setPlaybackRate(playbackRate);
    }, [playbackRate]);

    useEffect(() => {
        const previousRate = currentPlaybackRateRef.current;

        if (previousRate === playbackRate) {
            return;
        }

        currentPlaybackRateRef.current = playbackRate;

        const audioContext = audioContextRef.current;

        if (audioContext === null || !isPlaying) {
            clockRef.current.setPlaybackRate(playbackRate);

            return;
        }

        // Capturer AVANT le changement de rate.
        const songTime = getSongTime();

        clockRef.current.setPlaybackRate(playbackRate);

        playerRef.current?.play(
            song,
            audioContext,
            audioContext.currentTime,
            playbackRate,
            songTime,
        );
    }, [playbackRate, isPlaying, song, getSongTime]);

    return (
        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col px-4 py-2">
            {" "}
            {/* UI temporaire */}
            <header className="relative mx-auto mb-2 w-full max-w-[1000px]">
                {" "}
                {/* MORCEAU EN COURS */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <div
                        className="
        group flex items-center gap-3
        rounded-2xl
        border border-cyan-300/30
        bg-slate-950/45
        px-4 py-3
        shadow-[0_0_24px_rgba(34,211,238,.12)]
        backdrop-blur-xl
    "
                    >
                        {/* Flèche / indicateur */}
                        <div className="flex items-center gap-1 text-cyan-300">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,.9)]" />

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                className="h-5 w-5 drop-shadow-[0_0_8px_rgba(34,211,238,.7)]"
                            >
                                <path d="M5 12h12" />
                                <path d="m13 7 5 5-5 5" />
                            </svg>
                        </div>

                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200/50">
                                En cours
                            </div>

                            <div
                                className="
                mt-0.5 max-w-60 truncate
                text-lg font-black
                text-white
                drop-shadow-[0_0_10px_rgba(34,211,238,.30)]
            "
                            >
                                {song.title ?? "Mario"}
                            </div>
                        </div>
                    </div>
                </div>
                {/* SCOREBOARD */}
                {playMode === "play" && (
                    <div className="flex justify-center">
                        <div
                            className="
                relative
                rounded-[1.5rem]
                border border-white/15
                bg-slate-950/65
                px-5 py-3
                shadow-[0_0_35px_rgba(34,211,238,.10),0_0_55px_rgba(217,70,239,.07)]
                backdrop-blur-xl
            "
                        >
                            {/* Glow décoratif */}
                            <div
                                className="
                    pointer-events-none
                    absolute -inset-px -z-10
                    rounded-[1.5rem]
                    bg-gradient-to-r
                    from-cyan-500/20
                    via-fuchsia-500/10
                    to-cyan-500/20
                    blur-xl
                "
                            />

                            {/* LIGNE PRINCIPALE */}
                            <div className="flex items-center justify-center gap-5">
                                {/* SCORE */}
                                <div className="min-w-32 text-center">
                                    <div className="text-[9px] font-bold uppercase tracking-[0.28em] text-cyan-200/50">
                                        Score
                                    </div>

                                    <div
                                        key={gameState.score}
                                        className="
                                score-pop
                                mt-0.5
                                text-3xl font-black
                                text-cyan-300
                                drop-shadow-[0_0_12px_rgba(34,211,238,.65)]
                            "
                                    >
                                        {gameState.score.toLocaleString()}
                                    </div>
                                </div>

                                {/* séparation */}
                                <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

                                {/* COMBO */}
                                <div className="min-w-28 text-center">
                                    <div className="text-[9px] font-bold uppercase tracking-[0.28em] text-fuchsia-200/50">
                                        Combo
                                    </div>

                                    <div
                                        key={gameState.combo}
                                        className="
                                combo-pop
                                mt-0.5
                                text-3xl font-black
                                italic
                                text-fuchsia-300
                                drop-shadow-[0_0_14px_rgba(217,70,239,.75)]
                            "
                                    >
                                        ×{gameState.combo}
                                    </div>
                                </div>
                            </div>

                            {/* LIGNE SECONDAIRE */}
                            <div className="mt-2 flex items-center justify-center gap-3 border-t border-white/10 pt-2">
                                {/* HITS */}
                                <div
                                    className="
                        flex items-center gap-2
                        rounded-full
                        border border-emerald-400/20
                        bg-emerald-400/5
                        px-3 py-1
                    "
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,.8)]" />

                                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                                        Hits
                                    </span>

                                    <span
                                        key={gameState.hits}
                                        className="score-pop font-black text-emerald-300"
                                    >
                                        {gameState.hits}
                                    </span>
                                </div>

                                {/* MISS */}
                                <div
                                    key={gameState.misses}
                                    className="
                            miss-shake
                            flex items-center gap-2
                            rounded-full
                            border border-rose-400/20
                            bg-rose-400/5
                            px-3 py-1
                        "
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,.8)]" />

                                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                                        Miss
                                    </span>

                                    <span className="font-black text-rose-300">
                                        {gameState.misses}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>
            {/* Surface de jeu */}
            {/* Surface de jeu */}
            <div className="relative mx-auto aspect-video w-full max-w-[900px] overflow-hidden">
                <PianoCanvas
                    pressedNotes={isPaused ? EMPTY_PRESSED_NOTES : pressedNotes}
                    getVisibleNotes={getVisibleNotes}
                />

                {/* FEEDBACK VISUEL */}
                {feedback && (
                    <div
                        key={feedback.id}
                        className={`game-feedback game-feedback--${feedback.type}`}
                    >
                        {/* particules gauche */}
                        <span className="feedback-particle feedback-particle--1">
                            ✦
                        </span>

                        <span className="feedback-particle feedback-particle--2">
                            ✦
                        </span>

                        {/* feedback principal */}
                        <div className="feedback-icon">{feedback.icon}</div>

                        <div className="feedback-label">{feedback.label}</div>

                        {/* particules droite */}
                        <span className="feedback-particle feedback-particle--3">
                            ✦
                        </span>

                        <span className="feedback-particle feedback-particle--4">
                            ✦
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
