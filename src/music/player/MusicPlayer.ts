// src/music/player/MusicPlayer.ts

import type { MusicSong } from "../model/MusicSong";
import type {Instrument} from "../../audio/Instrument.ts";
import {INSTRUMENT_PROFILES} from "../../audio/InstrumentProfiles.ts";

export class MusicPlayer {
    private oscillators: OscillatorNode[] = [];

    play(
        song: MusicSong,
        audioContext: AudioContext,
        startTime: number,
        playbackRate = 1,
        songTime = 0,
        instrument: Instrument = "piano",
    ): void {
        if (playbackRate <= 0) {
            throw new Error(
                "playbackRate must be greater than 0",
            );
        }

        this.stop();

        for (const note of song.notes) {
            const noteEndTime =
                note.startTime + note.duration;

            if (noteEndTime <= songTime) {
                continue;
            }

            if (note.startTime >= songTime) {
                const delay =
                    (note.startTime - songTime) /
                    playbackRate;

                this.scheduleNote(
                    audioContext,
                    note.midi,
                    startTime + delay,
                    note.duration / playbackRate,
                    instrument,
                );

                continue;
            }

            const remainingDuration =
                noteEndTime - songTime;

            this.scheduleNote(
                audioContext,
                note.midi,
                startTime,
                remainingDuration / playbackRate,
                instrument,
            );
        }
    }

    stop(): void {
        for (
            const oscillator of
            this.oscillators
            ) {
            try {
                oscillator.stop();
            } catch {
                // Oscillateur déjà arrêté.
            }
        }

        this.oscillators = [];
    }

    private decibelsToGain(
        decibels: number,
    ): number {
        return 10 ** (decibels / 20);
    }

    private scheduleNote(
        audioContext: AudioContext,
        midi: number,
        startTime: number,
        duration: number,
        instrument: Instrument,
    ): void {
        const profile =
            INSTRUMENT_PROFILES[instrument];

        const soundingMidi =
            midi + profile.octaveOffset;

        const frequency =
            440 *
            2 ** ((soundingMidi - 69) / 12);

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.type =
            profile.oscillator.type;

        oscillator.frequency.setValueAtTime(
            frequency,
            startTime,
        );

        const peakGain =
            this.decibelsToGain(
                profile.volume,
            );

        const {
            attack,
            decay,
            sustain,
            release,
        } = profile.envelope;

        /*
         * On adapte attack + decay aux notes
         * éventuellement très courtes.
         */
        const attackDuration =
            Math.min(
                attack,
                duration * 0.25,
            );

        const decayDuration =
            Math.min(
                decay,
                duration * 0.25,
            );

        const noteOffTime =
            startTime + duration;

        const attackEnd =
            startTime + attackDuration;

        const decayEnd =
            Math.min(
                attackEnd + decayDuration,
                noteOffTime,
            );

        const sustainGain =
            Math.max(
                0.0001,
                peakGain * sustain,
            );

        const endTime =
            noteOffTime + release;

        gain.gain.setValueAtTime(
            0.0001,
            startTime,
        );

        // Attack
        gain.gain.exponentialRampToValueAtTime(
            peakGain,
            attackEnd,
        );

        // Decay
        gain.gain.exponentialRampToValueAtTime(
            sustainGain,
            decayEnd,
        );

        // Sustain
        gain.gain.setValueAtTime(
            sustainGain,
            noteOffTime,
        );

        // Release
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            endTime,
        );

        oscillator.connect(gain);
        gain.connect(
            audioContext.destination,
        );

        oscillator.start(startTime);
        oscillator.stop(endTime);

        this.oscillators.push(
            oscillator,
        );

        oscillator.onended = () => {
            this.oscillators =
                this.oscillators.filter(
                    (item) =>
                        item !== oscillator,
                );
        };
    }
}