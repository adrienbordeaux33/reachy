// music/MusicFileReader.ts

import type { MusicSong } from "./model/MusicSong";
import { TxtMusicParser } from "./parsers/TxtMusicParser";

export class MusicFileReader {
    private readonly txtParser = new TxtMusicParser();

    async read(file: File): Promise<MusicSong> {
        const extension = file.name.split(".").pop()?.toLowerCase();

        switch (extension) {
            case "txt": {
                const content = await file.text();

                return this.txtParser.parse(content);
            }

            default:
                throw new Error(`Format non supporté : .${extension}`);
        }
    }
}
