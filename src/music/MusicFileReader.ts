// music/MusicFileReader.ts

import type { MusicSong } from "./model/MusicSong";
import { TxtMusicParser } from "./parsers/TxtMusicParser";
import { MidiMusicParser } from "./parsers/MidiMusicParser";

export class MusicFileReader {
    private readonly txtParser =
        new TxtMusicParser();

    private readonly midiParser =
        new MidiMusicParser();

    async read(file: File): Promise<MusicSong> {
        const extension =
            file.name
                .split(".")
                .pop()
                ?.toLowerCase();

        switch (extension) {
            case "txt": {
                const content = await file.text();

                return this.txtParser.parse(content);
            }

            case "mid":
            case "midi": {
                const content =
                    await file.arrayBuffer();

                return this.midiParser.parse(content);
            }

            default:
                throw new Error(
                    `Format non supporté : .${extension}`,
                );
        }
    }
}