// music/model/MusicSong.ts

import type { MusicNote } from "./MusicNote";

export interface MusicSong {
    title?: string;

    /**
     * Durée totale en secondes.
     */
    duration: number;

    /**
     * BPM lorsqu'il est connu.
     */
    bpm?: number;

    notes: MusicNote[];
}