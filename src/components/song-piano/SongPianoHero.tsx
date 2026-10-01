import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import sceneBackground from "../../assets/fond.png";
import marioTxt from "../../fixtures/mario.txt?raw";

import PianoCanvas from "../canvas/PianoCanvas";

import { TxtMusicParser } from "../../music/parsers/TxtMusicParser";
import { BeatmapGenerator } from "../../game/beatmap/BeatmapGenerator";
import { GameTimeline } from "../../game/timeline/GameTimeline";
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
    travelTime: 2,
});


export default function SongPianoHero() {
    const playerRef =
        useRef<MusicPlayer | null>(null);

    const clockRef = useRef(new GameClock());

    const audioContextRef = useRef<AudioContext | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [pressedNotes, setPressedNotes] = useState<Set<number>>(() => new Set());

    /**
     * Appelé directement par le Canvas
     * pendant requestAnimationFrame.
     *
     * Aucun setState React ici.
     */
    const getVisibleNotes =
        useCallback(() => {
            return timeline.getVisibleNotes(
                clockRef.current.getCurrentTime(),
            );
        }, []);

    /**
     * Lance/recommence le morceau.
     */
    const startGame = async () => {
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
            audioContext.state === "suspended"
        ) {
            await audioContext.resume();
        }

        /*
         * On ne démarre pas exactement à currentTime.
         *
         * On laisse 50 ms au navigateur pour que
         * les oscillateurs soient tous programmés.
         */
        const startTime =
            audioContext.currentTime + 0.05;

        const player =
            new MusicPlayer();

        playerRef.current = player;

        engine.restart();

        /*
         * Audio ET jeu reçoivent exactement
         * le même instant de départ.
         */
        player.play(
            song,
            audioContext,
            startTime,
        );

        clockRef.current.start(
            audioContext,
            startTime,
        );

        setIsPlaying(true);
    };

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

                    setPressedNotes((previous) => {
                        const next = new Set(previous);
                        next.add(midi);

                        return next;
                    });

                    const currentTime =
                        clockRef.current.getCurrentTime();

                    engine.notePressed(
                        midi,
                        currentTime,
                    );
                },

                onRelease: (midi) => {

                    setPressedNotes((previous) => {
                        const next = new Set(previous);
                        next.delete(midi);
                        return next;
                    });

                    const currentTime =
                        clockRef.current.getCurrentTime();

                    engine.noteReleased(
                        midi,
                        currentTime,
                    );
                },
            });

        return detachKeyboard;
    }, []);

    useEffect(() => {
        let frameId = 0;

        const updateGame = () => {
            const currentTime =
                clockRef.current.getCurrentTime();

            engine.update(currentTime);

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
    }, []);

    return (
        <main
            className="
        relative
        min-h-screen
        overflow-hidden
        bg-cover
        bg-center
        bg-no-repeat
      "
            style={{
                backgroundImage:
                    `url(${sceneBackground})`,
            }}
        >
            <div
                className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-[1400px]
          flex-col
          px-6
          py-6
        "
            >
                {/* UI temporaire */}
                <header
                    className="
            mb-4
            flex
            items-center
            justify-between
          "
                >
                    <div>
                        <div
                            className="
                text-sm
                uppercase
                tracking-wider
                text-white/60
              "
                        >
                            Morceau
                        </div>

                        <div
                            className="
                text-xl
                font-semibold
                text-white
              "
                        >
                            {song.title ?? "Mario"}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={startGame}
                        className="
              rounded-md
              bg-white
              px-5
              py-2
              font-semibold
              text-black
              transition
              hover:bg-white/90
            "
                    >
                        {isPlaying
                            ? "Recommencer"
                            : "Jouer"}
                    </button>
                </header>

                {/* Surface de jeu */}
                <div
                    className="
            mx-auto
            aspect-video
            w-full
            max-w-[1000px]
            overflow-hidden
          "
                >
                    <PianoCanvas
                        pressedNotes={pressedNotes}
                        getVisibleNotes={getVisibleNotes}
                    />
                </div>
            </div>
        </main>
    );
}