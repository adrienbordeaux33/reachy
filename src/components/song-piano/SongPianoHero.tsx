import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import sceneBackground from "../../assets/fond.png";
import { BeatmapGenerator } from "../../game/beatmap/BeatmapGenerator";
import { GameClock } from "../../game/clock/GameClock.ts";
import { DefaultGameEngine } from "../../game/engine/DefaultGameEngine";
import type { PlayMode } from "../../game/model/PlayMode.ts";
import {
  GameTimeline,
  NOTE_TRAVEL_TIME,
} from "../../game/timeline/GameTimeline";
import { MusicPlayer } from "../../music/player/MusicPlayer";
import { TxtMusicParser } from "../../music/parsers/TxtMusicParser";
import PianoCanvas from "../canvas/PianoCanvas";
import { attachKeyboardInput } from "../input/keyboardInput";
import type { ReachyRobotAction } from "../ReachyRobot/ReachyRobot";

const MIN_PLAYBACK_RATE = 0.25;
const MAX_PLAYBACK_RATE = 2;
const EMPTY_PRESSED_NOTES = new Set<number>();
const LEAD_IN = NOTE_TRAVEL_TIME;

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
  playMode: PlayMode;
  restartKey?: number;
  onFinished: (result: SongGameResult) => void;
  onRobotEvent?: (action: ReachyRobotAction) => void;
}

export default function SongPianoHero({
  onRobotEvent,
  songSource,
  tempo,
  isPaused = false,
  playMode,
  restartKey,
  onFinished,
}: SongPianoHeroProps) {
  const { song, engine, timeline } = useMemo(() => {
    const parser = new TxtMusicParser();
    const beatmapGenerator = new BeatmapGenerator();
    const parsedSong = parser.parse(songSource);
    const beatmap = beatmapGenerator.generate(parsedSong);
    const gameEngine = new DefaultGameEngine();

    gameEngine.load(beatmap);

    return {
      song: parsedSong,
      engine: gameEngine,
      timeline: new GameTimeline(beatmap, {
        travelTime: NOTE_TRAVEL_TIME,
        postHitTime: 0.15,
      }),
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
  const hasFinishedRef = useRef(false);
  const previousRestartKeyRef = useRef(restartKey);
  const lastUiStateRef = useRef(engine.getState());
  const onRobotEventRef = useRef(onRobotEvent);
  const consecutiveMissesRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [pressedNotes, setPressedNotes] = useState<Set<number>>(
    () => new Set(),
  );
  const [gameState, setGameState] = useState(() => ({
    ...engine.getState(),
  }));

  useEffect(() => {
    onRobotEventRef.current = onRobotEvent;
  }, [onRobotEvent]);

  const getSongTime = useCallback(() => {
    return clockRef.current.getCurrentTime() - LEAD_IN;
  }, []);

  const getVisibleNotes = useCallback(() => {
    const visibleNotes = timeline.getVisibleNotes(getSongTime());

    if (playMode === "listen") return visibleNotes;

    return visibleNotes.filter(
      ({ note }) => engine.getNoteStatus(note.id) !== "hit",
    );
  }, [engine, getSongTime, playMode, timeline]);

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

    lastUiStateRef.current = { ...next };
    setGameState({ ...next });

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
  }, [engine]);

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
    const songStartTime = gameStartTime + LEAD_IN / playbackRate;
    const player = new MusicPlayer();

    playerRef.current = player;
    hasFinishedRef.current = false;
    consecutiveMissesRef.current = 0;
    engine.restart();
    syncGameState();

    player.play(song, audioContext, songStartTime, playbackRate, 0);
    clockRef.current.start(audioContext, gameStartTime);
    clockRef.current.setPlaybackRate(playbackRate);
    setPressedNotes(new Set());
    setIsPlaying(true);
  }, [engine, playbackRate, song, syncGameState]);

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
        if (isPaused || playMode === "listen") return;

        setPressedNotes((previous) => new Set(previous).add(midi));
        engine.notePressed(midi, getSongTime());
        syncGameState();
      },
      onRelease: (midi) => {
        setPressedNotes((previous) => {
          const next = new Set(previous);
          next.delete(midi);
          return next;
        });

        if (isPaused || playMode === "listen") return;
        engine.noteReleased(midi, getSongTime());
      },
    });

    return detachKeyboard;
  }, [engine, getSongTime, isPaused, playMode, syncGameState]);

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
    return () => cancelAnimationFrame(frameId);
  }, [engine, getSongTime, onFinished, playMode, syncGameState]);

  useEffect(() => {
    const audioContext = audioContextRef.current;
    if (audioContext === null || !isPlaying) return;

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
    if (restartKey === previousRestartKeyRef.current) return;

    previousRestartKeyRef.current = restartKey;
    void startGame();
  }, [restartKey, startGame]);

  useEffect(() => {
    clockRef.current.setPlaybackRate(playbackRate);
  }, [playbackRate]);

  useEffect(() => {
    const previousRate = currentPlaybackRateRef.current;
    if (previousRate === playbackRate) return;

    currentPlaybackRateRef.current = playbackRate;
    const audioContext = audioContextRef.current;

    if (audioContext === null || !isPlaying) {
      clockRef.current.setPlaybackRate(playbackRate);
      return;
    }

    const songTime = getSongTime();
    clockRef.current.setPlaybackRate(playbackRate);
    playerRef.current?.play(
      song,
      audioContext,
      audioContext.currentTime,
      playbackRate,
      songTime,
    );
  }, [getSongTime, isPlaying, playbackRate, song]);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${sceneBackground})` }}
    >
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 py-6">
        <header className="mb-4 flex items-center justify-between gap-6">
          <div>
            <div className="text-sm uppercase tracking-wider text-white/60">
              Morceau
            </div>
            <div className="text-xl font-semibold text-white">
              {song.title ?? "Morceau"}
            </div>
          </div>

          {playMode === "play" && (
            <div className="flex items-center gap-8 text-white">
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider text-white/50">
                  Score
                </div>
                <div className="text-2xl font-bold">{gameState.score}</div>
              </div>
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider text-white/50">
                  Combo
                </div>
                <div className="text-2xl font-bold">x{gameState.combo}</div>
              </div>
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider text-white/50">
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
          )}

          <button
            type="button"
            onClick={() => void startGame()}
            className="rounded-md bg-white px-5 py-2 font-semibold text-black transition hover:bg-white/90"
          >
            {isPlaying ? "Recommencer" : "Jouer"}
          </button>
        </header>

        <div className="mx-auto aspect-video w-full max-w-[1000px] overflow-hidden">
          <PianoCanvas
            pressedNotes={isPaused ? EMPTY_PRESSED_NOTES : pressedNotes}
            getVisibleNotes={getVisibleNotes}
          />
        </div>
      </div>
    </main>
  );
}
