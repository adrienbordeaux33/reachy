import marioTxt from "../../fixtures/mario.txt?raw";
import pirateTxt from "../../fixtures/pirate caraibes.txt?raw";

export type SongId =
    | "mario"
    | "pirate";

export interface SongDefinition {
    id: SongId;
    title: string;
    source: string;
}

export const SONG_LIBRARY: Record<
    SongId,
    SongDefinition
> = {
    mario: {
        id: "mario",
        title: "Mario",
        source: marioTxt,
    },

    pirate: {
        id: "pirate",
        title: "Pirates des caraïbes",
        source: pirateTxt,
    },
};

export function getSongDefinition(
    songId: SongId,
): SongDefinition {
    return SONG_LIBRARY[songId];
}