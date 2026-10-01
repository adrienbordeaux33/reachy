// src/music/player/MusicPlayer.ts

import type { MusicSong } from "../model/MusicSong";

export class MusicPlayer {
    private oscillators: OscillatorNode[] = [];

    play(
        song: MusicSong,
        audioContext: AudioContext,
        startTime: number,
    ): void {
        this.stop();

        for (const note of song.notes) {
            this.scheduleNote(
                audioContext,
                note.midi,
                startTime + note.startTime,
                note.duration,
            );
        }
    }

    stop(): void {
        for (const oscillator of this.oscillators) {
            try {
                oscillator.stop();
            } catch {
                // Oscillateur déjà arrêté.
            }
        }

        this.oscillators = [];
    }

    private scheduleNote(
        audioContext: AudioContext,
        midi: number,
        startTime: number,
        duration: number,
    ): void {
        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        const frequency =
            440 * 2 ** ((midi - 69) / 12);

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            frequency,
            startTime,
        );

        // Petit fade-in pour éviter les clics audio.
        gain.gain.setValueAtTime(
            0.0001,
            startTime,
        );

        gain.gain.exponentialRampToValueAtTime(
            0.15,
            startTime + 0.005,
        );

        // Petit fade-out.
        const endTime =
            startTime + duration;

        gain.gain.setValueAtTime(
            0.15,
            Math.max(
                startTime + 0.005,
                endTime - 0.01,
            ),
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            endTime,
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(endTime);

        this.oscillators.push(oscillator);

        oscillator.onended = () => {
            this.oscillators =
                this.oscillators.filter(
                    (item) => item !== oscillator,
                );
        };
    }
}