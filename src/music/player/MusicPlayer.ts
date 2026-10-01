// src/music/player/MusicPlayer.ts

import type { MusicSong } from "../model/MusicSong";

export class MusicPlayer {
    private audioContext: AudioContext | null = null;
    private oscillators: OscillatorNode[] = [];

    async play(song: MusicSong): Promise<void> {
        this.stop();

        this.audioContext = new AudioContext();

        if (this.audioContext.state === "suspended") {
            await this.audioContext.resume();
        }

        const startTime = this.audioContext.currentTime;

        for (const note of song.notes) {
            this.scheduleNote(
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

        if (this.audioContext) {
            void this.audioContext.close();
            this.audioContext = null;
        }
    }

    private scheduleNote(
        midi: number,
        startTime: number,
        duration: number,
    ): void {
        if (!this.audioContext) {
            return;
        }

        const oscillator =
            this.audioContext.createOscillator();

        const gain =
            this.audioContext.createGain();

        const frequency =
            440 * 2 ** ((midi - 69) / 12);

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            frequency,
            startTime,
        );

        // Petit fade-in pour éviter les clics audio.
        gain.gain.setValueAtTime(0.0001, startTime);

        gain.gain.exponentialRampToValueAtTime(
            0.15,
            startTime + 0.005,
        );

        // Petit fade-out.
        const endTime = startTime + duration;

        gain.gain.setValueAtTime(
            0.15,
            Math.max(startTime + 0.005, endTime - 0.01),
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            endTime,
        );

        oscillator.connect(gain);
        gain.connect(this.audioContext.destination);

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