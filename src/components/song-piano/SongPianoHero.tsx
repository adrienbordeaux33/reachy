import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import marioTxt from "../../fixtures/mario.txt?raw";

import PianoCanvas from "../canvas/PianoCanvas";

import { TxtMusicParser } from "../../music/parsers/TxtMusicParser";
import { BeatmapGenerator } from "../../game/beatmap/BeatmapGenerator";
import {GameTimeline, NOTE_TRAVEL_TIME} from "../../game/timeline/GameTimeline";
import { MusicPlayer } from "../../music/player/MusicPlayer";
import {GameClock} from "../../game/clock/GameClock.ts";
import { DefaultGameEngine } from "../../game/engine/DefaultGameEngine";
import { attachKeyboardInput } from "../input/keyboardInput";

//
// Chargement du morceau.
//
// Important : on fait ça hors du composant pour ne pas
// parser/regénérer la Beatmap à chaque render React.
//
const parser = new TxtMusicParser();
const beatmapGenerator = new BeatmapGenerator();

const song = parser.parse(marioTxt);
const beatmap = beatmapGenerator.generate(song);

const engine = new DefaultGameEngine();
engine.load(beatmap);

const timeline = new GameTimeline(beatmap, {
    travelTime: NOTE_TRAVEL_TIME,
    postHitTime: 0.15,
});

export interface SongGameResult {
    score: number;
    hits: number;
    misses: number;
}

interface SongPianoHeroProps{
    isPaused?: boolean;
    restartKey?: number;
    onFinished: (result: SongGameResult) => void;
}

const EMPTY_PRESSED_NOTES = new Set<number>();

const LEAD_IN = NOTE_TRAVEL_TIME;

export default function SongPianoHero({isPaused, restartKey, onFinished} : SongPianoHeroProps) {
    const playerRef =
        useRef<MusicPlayer | null>(null);

    const clockRef = useRef(new GameClock());

    const audioContextRef = useRef<AudioContext | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);


    const [pressedNotes, setPressedNotes] = useState<Set<number>>(() => new Set());

    const [gameState, setGameState] =
        useState(() => ({
            ...engine.getState(),
        }));

    const hasFinishedRef = useRef(false);

    const previousRestartKeyRef = useRef(restartKey);

    const lastUiStateRef = useRef(engine.getState());

    const getSongTime =
        useCallback(() => {
            return (
                clockRef.current.getCurrentTime() -
                LEAD_IN
            );
        }, []);

    /**
     * Appelé directement par le Canvas
     * pendant requestAnimationFrame.
     *
     * Aucun setState React ici.
     */
    const getVisibleNotes =
        useCallback(() => {
            const currentTime =
                getSongTime();

            return timeline
                .getVisibleNotes(currentTime)
                .filter(({ note }) => {
                    return (
                        engine.getNoteStatus(note.id) !==
                        "hit"
                    );
                });
        }, [getSongTime]);

    const syncGameState = useCallback(() => {
        const next =
            engine.getState();

        const previous =
            lastUiStateRef.current;

        if (
            next.score === previous.score &&
            next.combo === previous.combo &&
            next.hits === previous.hits &&
            next.misses === previous.misses &&
            next.status === previous.status
        ) {
            return;
        }

        const snapshot = {
            ...next,
        };

        lastUiStateRef.current =
            snapshot;

        setGameState(snapshot);
    }, []);

    /**
     * Lance/recommence le morceau.
     */
    const startGame =
        useCallback(async () => {
            playerRef.current?.stop();

            let audioContext =
                audioContextRef.current;

            if (audioContext === null) {
                audioContext =
                    new AudioContext();

                audioContextRef.current =
                    audioContext;
            }

            if (
                audioContext.state ===
                "suspended"
            ) {
                await audioContext.resume();
            }

            const gameStartTime =
                audioContext.currentTime + 0.05;

            const songStartTime =
                gameStartTime +
                NOTE_TRAVEL_TIME;

            const player =
                new MusicPlayer();

            playerRef.current = player;

            hasFinishedRef.current = false;
            engine.restart();
            syncGameState();

            player.play(
                song,
                audioContext,
                songStartTime,
            );

            clockRef.current.start(
                audioContext,
                gameStartTime,
            );

            setPressedNotes(new Set());
            setIsPlaying(true);
        }, [syncGameState]);

    useEffect(() => {
        const clock = clockRef.current;

        return () => {
            playerRef.current?.stop();

            clock.stop();
            engine.stop()

            const audioContext =
                audioContextRef.current;

            if (audioContext) {
                void audioContext.close();

                audioContextRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const detachKeyboard =
            attachKeyboardInput({
                onPress: (midi) => {
                    if (isPaused) {
                        return;
                    }

                    setPressedNotes((previous) => {
                        const next = new Set(previous);

                        next.add(midi);

                        return next;
                    });

                    engine.notePressed(
                        midi,
                        getSongTime(),
                    );

                    syncGameState();
                },

                onRelease: (midi) => {

                    setPressedNotes((previous) => {
                        const next = new Set(previous);

                        next.delete(midi);

                        return next;
                    });

                    if (isPaused) {
                        return;
                    }


                    engine.noteReleased(
                        midi,
                        getSongTime(),
                    );
                },
            });

        return detachKeyboard;
    }, [isPaused, getSongTime, syncGameState]);

    useEffect(() => {
        let frameId = 0;

        const updateGame = () => {
            engine.update(
                getSongTime(),
            );

            syncGameState();

            const state =
                engine.getState();

            if (
                state.status === "finished" &&
                !hasFinishedRef.current
            ) {
                hasFinishedRef.current = true;

                playerRef.current?.stop();

                setIsPlaying(false);

                onFinished({
                    score: state.score,
                    hits: state.hits,
                    misses: state.misses,
                });
            }

            frameId =
                requestAnimationFrame(
                    updateGame,
                );
        };

        frameId =
            requestAnimationFrame(
                updateGame,
            );

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [getSongTime, syncGameState, onFinished]);
    useEffect(() => {
        const audioContext =
            audioContextRef.current;

        if (
            audioContext === null ||
            !isPlaying
        ) {
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
    }, [isPaused, isPlaying]);

    useEffect(() => {
        if (
            restartKey ===
            previousRestartKeyRef.current
        ) {
            return;
        }

        previousRestartKeyRef.current =
            restartKey;

        void startGame();
    }, [
        restartKey,
        startGame,
    ]);

    return (
            <div className=" relative z-10 mx-auto flex min-h-1/2 w-full max-w-[1400px] flex-col px-6 py-6">
                {/* UI temporaire */}
                <header className=" mb-4 flex items-center justify-between gap-6 ">
                    <div>
                        <div className=" text-sm uppercase tracking-widertext-white/60 ">
                            Morceau
                        </div>

                        <div className=" text-xl font-semiboldtext-white ">
                            {song.title ?? "Mario"}
                        </div>
                    </div>

                    <div className=" flex items-center gap-8 text-white">
                        <div className="text-center">
                            <div  className=" text-xs uppercase tracking-widertext-white/50 ">
                                Score
                            </div>

                            <div className=" text-2xl font-bold ">
                                {gameState.score}
                            </div>
                        </div>

                        <div className="text-center">
                            <div className=" text-xs uppercase tracking-widertext-white/50 ">
                                Combo
                            </div>

                            <div className=" text-2xl font-bold  ">
                                x{gameState.combo}
                            </div>
                        </div>

                        <div className="text-center">
                            <div className=" text-xs uppercase tracking-widertext-white/50">
                                Hits
                            </div>

                            <div className="text-xl font-semibold">
                                {gameState.hits}
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-xs uppercase tracking-wider text-white/50">
                                Miss
                            </div>

                            <div className="text-xl font-semibold">
                                {gameState.misses}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={startGame}
                        className=" rounded-md bg-white px-5 py-2 font-semibold text-black transition hover:bg-white/90">
                        {isPlaying
                            ? "Recommencer"
                            : "Jouer"}
                    </button>
                </header>

                {/* Surface de jeu */}
                <div className=" mx-auto aspect-video w-full max-w-[1000px] overflow-hidden ">
                    <PianoCanvas
                        pressedNotes={
                        isPaused
                            ? EMPTY_PRESSED_NOTES
                            : pressedNotes}
                        getVisibleNotes={getVisibleNotes}
                    />
                </div>
            </div>
    );
}
