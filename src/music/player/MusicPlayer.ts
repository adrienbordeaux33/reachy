// src/music/player/MusicPlayer.ts

import type { MusicSong } from "../model/MusicSong";

export class MusicPlayer {
    private oscillators: OscillatorNode[] = [];

    play(
        song: MusicSong,
        audioContext: AudioContext,
        startTime: number,
        playbackRate = 1,
        songTime = 0,
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

            // Note entièrement passée.
            if (noteEndTime <= songTime) {
                continue;
            }

            /*
             * Note pas encore commencée.
             */
            if (note.startTime >= songTime) {
                const delay =
                    (note.startTime - songTime) /
                    playbackRate;

                this.scheduleNote(
                    audioContext,
                    note.midi,
                    startTime + delay,
                    note.duration /
                    playbackRate,
                );

                continue;
            }

            /*
             * Le changement de tempo arrive pendant
             * que cette note devrait être jouée.
             *
             * On reprend uniquement la durée restante.
             */
            const remainingDuration =
                noteEndTime - songTime;

            this.scheduleNote(
                audioContext,
                note.midi,
                startTime,
                remainingDuration /
                playbackRate,
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
            440 *
            2 ** ((midi - 69) / 12);

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            frequency,
            startTime,
        );

        const attackDuration =
            Math.min(0.005, duration / 2);

        const releaseDuration =
            Math.min(0.01, duration / 2);

        const endTime =
            startTime + duration;

        gain.gain.setValueAtTime(
            0.0001,
            startTime,
        );

        gain.gain.exponentialRampToValueAtTime(
            0.15,
            startTime + attackDuration,
        );

        gain.gain.setValueAtTime(
            0.15,
            Math.max(
                startTime + attackDuration,
                endTime - releaseDuration,
            ),
        );

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