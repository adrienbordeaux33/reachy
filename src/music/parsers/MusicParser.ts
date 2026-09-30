// music/parsers/MusicParser.ts

import type { MusicSong } from "../model/MusicSong";

export interface MusicParser<TInput> {
    parse(input: TInput): MusicSong;
}