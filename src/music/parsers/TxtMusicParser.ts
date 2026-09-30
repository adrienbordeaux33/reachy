import type {MusicParser} from "./MusicParser.ts";
import type {MusicSong} from "../model/MusicSong.ts";
import type {MusicNote} from "../model/MusicNote.ts";

const NOTE_TO_SEMITONE: Record<string, number> = {
    C: 0,
    "C#": 1,
    D: 2,
    "D#": 3,
    E: 4,
    F: 5,
    "F#": 6,
    G: 7,
    "G#": 8,
    A: 9,
    "A#": 10,
    B: 11,
};

export function noteNameToMidi(note: string): number {
    const match = note.match(/^([A-G]#?)(-?\d+)$/);

    if (!match) {
        throw new Error(`Note invalide : ${note}`);
    }

    const [, pitch, octaveString] = match;

    const octave = Number(octaveString);

    return (
        12 * (octave + 1) +
        NOTE_TO_SEMITONE[pitch]
    );
}


export class TxtMusicParser implements MusicParser<string> {
    parse(input: string): MusicSong {
        const lines = input
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        const notes: MusicNote[] = [];

        let currentTime = 0;

        for (const line of lines) {
            const [noteName, durationString] = line.split(/\s+/);

            const duration = Number.parseFloat(durationString);

            if (!Number.isFinite(duration) || duration < 0) {
                throw new Error(`Durée invalide : "${line}"`);
            }

            if (noteName !== "0" && noteName !== "Unknown") {
                notes.push({
                    midi: noteNameToMidi(noteName),
                    startTime: currentTime,
                    duration,
                });
            }

            currentTime += duration;
        }

        return {
            duration: currentTime,
            notes,
        };
    }
}