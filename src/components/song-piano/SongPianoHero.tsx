import { useCallback, useEffect, useRef, useState } from "react";

import sceneBackground from "../../assets/fond.png";
import marioTxt from "../../fixtures/mario.txt?raw";

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
import type { ReachyRobotAction } from "../ReachyRobot/ReachyRobot";

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

const LEAD_IN = NOTE_TRAVEL_TIME;

interface SongPianoHeroProps {
  onRobotEvent?: (action: ReachyRobotAction) => void;
}

export default function SongPianoHero({ onRobotEvent }: SongPianoHeroProps) {
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
  const lastUiStateRef = useRef(engine.getState());
  const onRobotEventRef = useRef(onRobotEvent);
  const consecutiveMissesRef = useRef(0);

  useEffect(() => {
    onRobotEventRef.current = onRobotEvent;
  }, [onRobotEvent]);

  const getSongTime = useCallback(() => {
    return clockRef.current.getCurrentTime() - LEAD_IN;
  }, []);

  /**
   * Appelé directement par le Canvas
   * pendant requestAnimationFrame.
   *
   * Aucun setState React ici.
   */
  const getVisibleNotes = useCallback(() => {
    const currentTime = getSongTime();

    return timeline.getVisibleNotes(currentTime).filter(({ note }) => {
      return engine.getNoteStatus(note.id) !== "hit";
    });
  }, [getSongTime]);

  const syncGameState = useCallback(() => {
    const next = engine.getState();

    const previous = lastUiStateRef.current;

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

    lastUiStateRef.current = snapshot;

    setGameState(snapshot);

    if (next.status === "playing" && previous.status !== "playing") {
      consecutiveMissesRef.current = 0;
    }

    if (next.misses > previous.misses) {
      const previousMissStreak = consecutiveMissesRef.current;
      consecutiveMissesRef.current += next.misses - previous.misses;
      if (previousMissStreak < 5 && consecutiveMissesRef.current >= 5) {
        onRobotEventRef.current?.("five-missed");
      }
    }

    if (next.hits > previous.hits) {
      consecutiveMissesRef.current = 0;
      if (next.combo === 3) onRobotEventRef.current?.("three-success");
    }
  }, []);

  /**
   * Lance/recommence le morceau.
   */
  const startGame = async () => {
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

    const songStartTime = gameStartTime + LEAD_IN;

    const player = new MusicPlayer();

    playerRef.current = player;

    consecutiveMissesRef.current = 0;
    engine.restart();
    syncGameState();

    /*
     * Audio ET jeu reçoivent exactement
     * le même instant de départ.
     */
    player.play(song, audioContext, songStartTime);

    clockRef.current.start(audioContext, gameStartTime);

    setIsPlaying(true);
  };

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
  }, []);

  useEffect(() => {
    const detachKeyboard = attachKeyboardInput({
      onPress: (midi) => {
        setPressedNotes((previous) => {
          const next = new Set(previous);
          next.add(midi);

          return next;
        });

        const currentTime = getSongTime();

        engine.notePressed(midi, currentTime);
        syncGameState();
      },

      onRelease: (midi) => {
        setPressedNotes((previous) => {
          const next = new Set(previous);
          next.delete(midi);
          return next;
        });

        const currentTime = getSongTime();

        engine.noteReleased(midi, currentTime);
      },
    });

    return detachKeyboard;
  }, [getSongTime, syncGameState]);

  useEffect(() => {
    let frameId = 0;

    const updateGame = () => {
      engine.update(getSongTime());

      syncGameState();

      frameId = requestAnimationFrame(updateGame);
    };

    frameId = requestAnimationFrame(updateGame);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [getSongTime, syncGameState]);

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
        backgroundImage: `url(${sceneBackground})`,
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
    gap-6
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

          <div
            className="
      flex
      items-center
      gap-8
      text-white
    "
          >
            <div className="text-center">
              <div
                className="
          text-xs
          uppercase
          tracking-wider
          text-white/50
        "
              >
                Score
              </div>

              <div
                className="
          text-2xl
          font-bold
        "
              >
                {gameState.score}
              </div>
            </div>

            <div className="text-center">
              <div
                className="
          text-xs
          uppercase
          tracking-wider
          text-white/50
        "
              >
                Combo
              </div>

              <div
                className="
          text-2xl
          font-bold
        "
              >
                x{gameState.combo}
              </div>
            </div>

            <div className="text-center">
              <div className=" text-xs uppercase tracking-widertext-white/50">
                Hits
              </div>

              <div className="text-xl font-semibold">{gameState.hits}</div>
            </div>

            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-white/50">
                Miss
              </div>

              <div className="text-xl font-semibold">{gameState.misses}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={startGame}
            className=" rounded-md bg-white px-5 py-2 font-semibold text-black transition hover:bg-white/90"
          >
            {isPlaying ? "Recommencer" : "Jouer"}
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
