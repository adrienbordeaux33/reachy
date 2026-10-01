import { useEffect, useRef } from "react";
import * as Tone from "tone";
import type { Instrument } from "./InstrumentSelector.tsx";
import {
  PIANO_FIRST_NOTE,
  PIANO_LAST_NOTE,
  PianoCanvas,
  type TrailNote,
} from "./PianoCanvas";
import { PauseIcon } from "./icons.tsx";

interface RecordedNote {
  midi: number;
  instrument: Instrument;
  startedAt: number;
  endedAt?: number;
}

const INSTRUMENT_PROFILES = {
  piano: {
    volume: -8,
    oscillator: { type: "triangle" },
    envelope: { attack: 0.008, decay: 0.28, sustain: 0.16, release: 0.65 },
  },
  guitar: {
    volume: -10,
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.004, decay: 0.24, sustain: 0.08, release: 0.22 },
  },
  bass: {
    volume: -10,
    oscillator: { type: "square" },
    envelope: { attack: 0.006, decay: 0.12, sustain: 0.56, release: 0.2 },
  },
} satisfies Record<
  Instrument,
  {
    volume: number;
    oscillator: { type: "triangle" | "sawtooth" | "square" };
    envelope: {
      attack: number;
      decay: number;
      sustain: number;
      release: number;
    };
  }
>;

interface PianoHeroProps {
  instrument: Instrument;
  isPaused: boolean;
  isReplaying: boolean;
  shouldSaveRecording: boolean;
  replayRequest: number;
  onRecordingReady: (recording: Blob) => void;
  onRecordingError: (message: string) => void;
  onNotePlayed: () => void;
  onReplayComplete: () => void;
  onStopReplay: () => void;
  onPause: () => void;
  onResume: () => void;
}

function getToneNote(midi: number, instrument: Instrument): string {
  const adjustedMidi = instrument === "bass" ? midi - 12 : midi;
  return Tone.Frequency(adjustedMidi, "midi").toNote();
}

function getRecordingTime(audioContext: AudioContext | null): number {
  return audioContext ? audioContext.currentTime * 1000 : performance.now();
}

function createInstrumentSynth(
  instrument: Instrument,
  destination: AudioNode,
): Tone.PolySynth<Tone.Synth> {
  const profile = INSTRUMENT_PROFILES[instrument];
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: profile.oscillator,
    envelope: profile.envelope,
  });
  synth.volume.value = profile.volume;
  synth.connect(destination);
  return synth;
}

function createMidiRecording(notes: RecordedNote[]) {
  if (notes.length === 0) return new Blob();

  const startedAt = Math.min(...notes.map((note) => note.startedAt));
  const events = notes.flatMap((note) => [
    {
      time: note.startedAt - startedAt,
      status: 0x90,
      midi: note.midi,
      velocity: 100,
    },
    {
      time: (note.endedAt ?? note.startedAt + 80) - startedAt,
      status: 0x80,
      midi: note.midi,
      velocity: 0,
    },
  ]);
  events.sort(
    (first, second) => first.time - second.time || first.status - second.status,
  );

  const track = [0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20];
  let previousTick = 0;
  for (const event of events) {
    const tick = Math.round((event.time * 480) / 500);
    let delta = tick - previousTick;
    previousTick = tick;
    const encodedDelta = [delta & 0x7f];
    while ((delta >>= 7) > 0) {
      encodedDelta.unshift((delta & 0x7f) | 0x80);
    }
    track.push(...encodedDelta, event.status, event.midi, event.velocity);
  }
  track.push(0x00, 0xff, 0x2f, 0x00);

  const trackLength = track.length;
  const header = [
    0x4d,
    0x54,
    0x68,
    0x64,
    0x00,
    0x00,
    0x00,
    0x06,
    0x00,
    0x00,
    0x00,
    0x01,
    0x01,
    0xe0,
    0x4d,
    0x54,
    0x72,
    0x6b,
    (trackLength >>> 24) & 0xff,
    (trackLength >>> 16) & 0xff,
    (trackLength >>> 8) & 0xff,
    trackLength & 0xff,
  ];
  return new Blob([new Uint8Array([...header, ...track])], {
    type: "audio/midi",
  });
}

export default function PianoHero({
  instrument,
  isPaused,
  isReplaying,
  shouldSaveRecording,
  replayRequest,
  onRecordingReady,
  onRecordingError,
  onNotePlayed,
  onReplayComplete,
  onStopReplay,
  onPause,
  onResume,
}: PianoHeroProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioOutputRef = useRef<GainNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordedNotesRef = useRef<RecordedNote[]>([]);
  const activeRecordedNotesRef = useRef(new Map<number, RecordedNote>());
  const exportRecordingRef = useRef(false);
  const onRecordingReadyRef = useRef(onRecordingReady);
  const onRecordingErrorRef = useRef(onRecordingError);
  const onNotePlayedRef = useRef(onNotePlayed);
  const onReplayCompleteRef = useRef(onReplayComplete);
  const toneSynthRef = useRef<Tone.PolySynth<Tone.Synth> | null>(null);
  const activeVoicesRef = useRef(new Map<number, string>());
  const replayTrailTimersRef = useRef<number[]>([]);
  const replayPressedCountsRef = useRef(new Map<number, number>());
  const replayGenerationRef = useRef(0);
  const replaySuspendTimerRef = useRef<number | null>(null);
  const lastReplayRequestRef = useRef(0);
  const pressedRef = useRef(new Set<number>());
  const trailNotesRef = useRef<TrailNote[]>([]);
  const pausedRef = useRef(false);

  useEffect(() => {
    onRecordingReadyRef.current = onRecordingReady;
    onRecordingErrorRef.current = onRecordingError;
    onNotePlayedRef.current = onNotePlayed;
    onReplayCompleteRef.current = onReplayComplete;
  }, [onNotePlayed, onRecordingError, onRecordingReady, onReplayComplete]);

  useEffect(() => {
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) return;

    const audioContext =
      audioContextRef.current ?? new AudioContextConstructor();
    audioContextRef.current = audioContext;
    if (!audioOutputRef.current) {
      const recordingDestination = audioContext.createMediaStreamDestination();
      const audioOutput = audioContext.createGain();
      audioOutput.connect(audioContext.destination);
      audioOutput.connect(recordingDestination);
      audioOutputRef.current = audioOutput;

      if (typeof MediaRecorder !== "undefined") {
        const mimeType = ["audio/webm;codecs=opus", "audio/mp4"].find((type) =>
          MediaRecorder.isTypeSupported(type),
        );
        const recorder = new MediaRecorder(
          recordingDestination.stream,
          mimeType ? { mimeType } : undefined,
        );
        recordingChunksRef.current = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) recordingChunksRef.current.push(event.data);
        };
        recorder.onstop = () => {
          if (!exportRecordingRef.current) return;
          const recording = new Blob(recordingChunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          if (recording.size > 0) onRecordingReadyRef.current(recording);
          else onRecordingErrorRef.current("Aucun son n'a été enregistré.");
        };
        recorder.onerror = () => {
          onRecordingErrorRef.current("L'enregistrement audio a échoué.");
        };
        recorder.start();
        recorderRef.current = recorder;
      }
    }

    Tone.setContext(audioContext);
    const synth = createInstrumentSynth(
      instrument,
      audioOutputRef.current ?? audioContext.destination,
    );
    toneSynthRef.current = synth;

    return () => {
      if (toneSynthRef.current === synth) toneSynthRef.current = null;
      synth.releaseAll();
      synth.dispose();
    };
  }, [instrument]);

  useEffect(
    () => () => {
      const audioContext = audioContextRef.current;
      const recorder = recorderRef.current;
      exportRecordingRef.current = false;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      recorderRef.current = null;
      toneSynthRef.current?.dispose();
      toneSynthRef.current = null;

      if (audioContext) {
        if (audioContext.state !== "closed") void audioContext.close();
        if (audioContextRef.current === audioContext) {
          audioContextRef.current = null;
        }
        if (audioOutputRef.current?.context === audioContext) {
          audioOutputRef.current = null;
        }
      }
    },
    [],
  );

  const playSound = (midi: number) => {
    if (!audioContextRef.current || !toneSynthRef.current) return;
    if (audioContextRef.current.state === "suspended") void Tone.start();

    const note = getToneNote(midi, instrument);
    toneSynthRef.current.triggerAttack(note);
    activeVoicesRef.current.set(midi, note);
  };

  const pressNote = (midi: number) => {
    if (
      pausedRef.current ||
      midi < PIANO_FIRST_NOTE ||
      midi > PIANO_LAST_NOTE ||
      pressedRef.current.has(midi)
    ) {
      return;
    }

    pressedRef.current.add(midi);
    const recordedNote = {
      midi,
      instrument,
      startedAt: getRecordingTime(audioContextRef.current),
    };
    recordedNotesRef.current.push(recordedNote);
    activeRecordedNotesRef.current.set(midi, recordedNote);
    trailNotesRef.current.push({ midi, startedAt: performance.now() });
    onNotePlayedRef.current();
    playSound(midi);
  };

  const releaseNote = (midi: number) => {
    pressedRef.current.delete(midi);
    const recordedNote = activeRecordedNotesRef.current.get(midi);
    if (recordedNote) {
      recordedNote.endedAt = getRecordingTime(audioContextRef.current);
      activeRecordedNotesRef.current.delete(midi);
    }
    const activeNote = activeVoicesRef.current.get(midi);
    if (activeNote) toneSynthRef.current?.triggerRelease(activeNote);
    activeVoicesRef.current.delete(midi);
  };

  useEffect(() => {
    pausedRef.current = isPaused;
    if (isPaused) {
      [...pressedRef.current].forEach(releaseNote);
      trailNotesRef.current.length = 0;
      void audioContextRef.current?.suspend();
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.pause();
      }
    } else {
      void audioContextRef.current?.resume();
      if (recorderRef.current?.state === "paused") {
        recorderRef.current.resume();
      }
    }
  }, [isPaused]);

  useEffect(() => {
    if (!shouldSaveRecording) return;

    if (recordedNotesRef.current.length === 0) {
      onRecordingErrorRef.current("Aucune note à enregistrer.");
      return;
    }

    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      const midiRecording = createMidiRecording(recordedNotesRef.current);
      if (midiRecording.size > 0) {
        onRecordingReadyRef.current(midiRecording);
      }
      return;
    }

    exportRecordingRef.current = true;
    recorder.stop();
  }, [shouldSaveRecording]);

  useEffect(() => {
    if (
      replayRequest === 0 ||
      !isPaused ||
      !isReplaying ||
      replayRequest <= lastReplayRequestRef.current
    ) {
      return;
    }
    lastReplayRequestRef.current = replayRequest;

    const notes = recordedNotesRef.current;
    if (notes.length === 0) {
      onRecordingErrorRef.current("Aucune note à réécouter.");
      onReplayCompleteRef.current();
      return;
    }

    const audioContext = audioContextRef.current;
    if (!audioContext) {
      onRecordingErrorRef.current(
        "La lecture audio n'est pas prise en charge par ce navigateur.",
      );
      onReplayCompleteRef.current();
      return;
    }

    const generation = ++replayGenerationRef.current;
    if (replaySuspendTimerRef.current !== null) {
      window.clearTimeout(replaySuspendTimerRef.current);
      replaySuspendTimerRef.current = null;
    }
    toneSynthRef.current?.releaseAll();
    replayTrailTimersRef.current.forEach(window.clearTimeout);
    replayTrailTimersRef.current = [];
    replayPressedCountsRef.current.forEach((_, midi) =>
      pressedRef.current.delete(midi),
    );
    replayPressedCountsRef.current.clear();
    trailNotesRef.current.length = 0;
    const replaySynths = new Map<Instrument, Tone.PolySynth<Tone.Synth>>();

    const replay = async () => {
      if (generation !== replayGenerationRef.current) return;
      if (audioContext.state === "suspended") await Tone.start();
      if (generation !== replayGenerationRef.current) return;

      const output = audioOutputRef.current ?? audioContext.destination;
      for (const replayInstrument of new Set(
        notes.map((note) => note.instrument),
      )) {
        replaySynths.set(
          replayInstrument,
          createInstrumentSynth(replayInstrument, output),
        );
      }

      const startedAt = Math.min(...notes.map((note) => note.startedAt));
      const playbackStart = Tone.now() + 0.05;
      let lastNoteEnd = 0;

      notes.forEach((note) => {
        const noteStart = Math.max(0, (note.startedAt - startedAt) / 1000);
        const noteEnd = Math.max(
          noteStart + 0.08,
          ((note.endedAt ?? note.startedAt + 80) - startedAt) / 1000,
        );
        const startTime = playbackStart + noteStart;
        const endTime = playbackStart + noteEnd;
        lastNoteEnd = Math.max(lastNoteEnd, noteEnd);

        const startTrailTimer = window.setTimeout(
          () => {
            const pressedCount =
              (replayPressedCountsRef.current.get(note.midi) ?? 0) + 1;
            replayPressedCountsRef.current.set(note.midi, pressedCount);
            pressedRef.current.add(note.midi);
            trailNotesRef.current.push({
              midi: note.midi,
              startedAt: performance.now(),
            });
          },
          noteStart * 1000 + 50,
        );
        const endTrailTimer = window.setTimeout(
          () => {
            const pressedCount =
              (replayPressedCountsRef.current.get(note.midi) ?? 1) - 1;
            if (pressedCount > 0) {
              replayPressedCountsRef.current.set(note.midi, pressedCount);
            } else {
              replayPressedCountsRef.current.delete(note.midi);
              pressedRef.current.delete(note.midi);
            }
          },
          noteEnd * 1000 + 50,
        );
        replayTrailTimersRef.current.push(startTrailTimer, endTrailTimer);

        const toneNote = getToneNote(note.midi, note.instrument);
        const synth = replaySynths.get(note.instrument);
        synth?.triggerAttack(toneNote, startTime);
        synth?.triggerRelease(toneNote, endTime);
      });

      replaySuspendTimerRef.current = window.setTimeout(
        () => {
          if (generation !== replayGenerationRef.current) return;
          if (pausedRef.current) void audioContext.suspend();
          onReplayCompleteRef.current();
        },
        lastNoteEnd * 1000 + 250,
      );
    };

    void replay().catch(() => {
      if (generation !== replayGenerationRef.current) return;
      onRecordingErrorRef.current("La relecture audio a échoué.");
      onReplayCompleteRef.current();
    });

    const replayTrailTimers = replayTrailTimersRef.current;
    const replayPressedCounts = replayPressedCountsRef.current;
    const pressedNotes = pressedRef.current;

    return () => {
      replayGenerationRef.current += 1;
      if (replaySuspendTimerRef.current !== null) {
        window.clearTimeout(replaySuspendTimerRef.current);
        replaySuspendTimerRef.current = null;
      }
      replayTrailTimers.forEach(window.clearTimeout);
      if (replayTrailTimersRef.current === replayTrailTimers) {
        replayTrailTimersRef.current = [];
      }
      replayPressedCounts.forEach((_, midi) => pressedNotes.delete(midi));
      replayPressedCounts.clear();
      toneSynthRef.current?.releaseAll(Tone.now());
      replaySynths.forEach((synth) => {
        synth.releaseAll(Tone.now());
        synth.dispose();
      });
      if (pausedRef.current) void audioContextRef.current?.suspend();
    };
  }, [instrument, isPaused, isReplaying, replayRequest]);

  return (
    <section
      className="mx-auto my-[30px] box-border w-full max-w-[1000px] rounded-lg border border-[rgba(193,218,197,0.16)] bg-[radial-gradient(ellipse_at_50%_0%,rgba(78,117,91,0.2),transparent_62%),#101713] p-[22px] text-[#edf2e9] shadow-[0_24px_80px_rgba(0,0,0,0.28)] max-[600px]:my-3 max-[600px]:p-[13px]"
      aria-label="Piano Hero"
    >
      <PianoCanvas
        isPaused={isPaused}
        pressedNotesRef={pressedRef}
        trailNotesRef={trailNotesRef}
        onNotePress={pressNote}
        onNoteRelease={releaseNote}
      />
      {isReplaying ? (
        <div className="mt-3 flex justify-center border-t border-[rgba(193,218,197,0.16)] pt-4">
          <button
            type="button"
            onClick={onStopReplay}
            className="group relative flex min-h-24 w-full max-w-xl items-center justify-center gap-5 overflow-hidden rounded-3xl border-2 border-rose-300/90 bg-rose-950/40 px-6 py-6 text-rose-100 shadow-[0_0_28px_rgba(244,63,94,.3)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:bg-rose-900/45 hover:shadow-[0_0_45px_rgba(244,63,94,.45)] active:translate-y-0 active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span
              aria-hidden="true"
              className="h-5 w-5 shrink-0 rounded-sm border-2 border-current"
            />
            <span className="text-center text-lg font-black uppercase sm:text-xl">
              Arrêter la réécoute et revenir au menu
            </span>
          </button>
        </div>
      ) : (
        <div className="mt-3 flex justify-center border-t border-[rgba(193,218,197,0.16)] pt-4">
          <button
            type="button"
            aria-pressed={isPaused}
            onClick={isPaused ? onResume : onPause}
            className="group relative flex min-h-24 w-full max-w-xl items-center justify-center gap-5 overflow-hidden rounded-3xl border-2 border-emerald-300/90 bg-emerald-950/40 px-10 py-6 text-emerald-100 shadow-[0_0_28px_rgba(52,211,153,.36)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:bg-emerald-900/45 hover:shadow-[0_0_45px_rgba(52,211,153,.48)] active:translate-y-0 active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <PauseIcon />
            <span className="text-xl font-black uppercase tracking-wide sm:text-2xl">
              {isPaused ? "Reprendre" : "Pause"}
            </span>
            <span className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </button>
        </div>
      )}
    </section>
  );
}
