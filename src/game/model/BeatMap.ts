// game/model/Beatmap.ts

import type { GameNote } from "./GameNote";

export interface Beatmap {
    /**
     * Durée totale du morceau.
     */
    duration: number;

    /**
     * Notes que le joueur devra jouer.
     */
    notes: GameNote[];

    /**
     * Plage MIDI utilisée par cette beatmap.
     */
    playableRange: {
        min: number;
        max: number;
    };
}
