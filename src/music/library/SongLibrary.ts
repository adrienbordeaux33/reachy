import marioTxt from "../../fixtures/mario.txt?raw";
import pirateTxt from "../../fixtures/pirate caraibes.txt?raw";

export type SongId =
    | "mario"
    | "pirate";

export interface SongDefinition {
    id: SongId;
    title: string;
    format: "txt";
    source: string;
}
export const SONG_LIBRARY: Record<
    SongId,
    SongDefinition
> = {
    mario: {
        id: "mario",
        title: "Mario",
        format: "txt",
        source: marioTxt,
    },

    pirate: {
        id: "pirate",
        title: "Pirates des caraïbes",
        format: "txt",
        source: pirateTxt,
    },
};

export function getSongDefinition(
    songId: SongId,
): SongDefinition {
    return SONG_LIBRARY[songId];
}