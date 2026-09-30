// game/model/Beatmap.ts

import type { GameNote } from "./GameNote";
import type { MusicSong } from "../../music/model/MusicSong";


export interface Beatmap {
    duration: number;
    notes: GameNote[];
}


export function createBeatmap(
    song: MusicSong,
): Beatmap {
    return {
        duration: song.duration,

        notes: song.notes.map((note, index) => ({
            id: `note-${index}`,
            midi: note.midi,
            hitTime: note.startTime,
            duration: note.duration,
        })),
    };
}