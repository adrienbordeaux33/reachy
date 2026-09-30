// src/music/parsers/TxtMusicParser.test.ts

import { describe, expect, it } from "vitest";
import { TxtMusicParser } from "./TxtMusicParser";

describe("TxtMusicParser", () => {
    const parser = new TxtMusicParser();

    it("parse les notes et les silences", () => {
        const input = `
Unknown 0.083
0 0.083
E7 0.083
0 0.083
0 0.083
C7 0.083
`;

        const song = parser.parse(input);

        expect(song.notes).toHaveLength(2);

        expect(song.notes[0].midi).toBe(100);
        expect(song.notes[0].startTime).toBeCloseTo(0.166);
        expect(song.notes[0].duration).toBeCloseTo(0.083);

        expect(song.notes[1].midi).toBe(96);
        expect(song.notes[1].startTime).toBeCloseTo(0.415);
        expect(song.notes[1].duration).toBeCloseTo(0.083);
    });

    it("conserve les silences dans la durée totale", () => {
        const input = `
E7 0.083
0 0.083
0 0.083
C7 0.083
`;

        const song = parser.parse(input);

        expect(song.duration).toBeCloseTo(0.332);
    });

    it("ignore Unknown comme une note mais conserve sa durée", () => {
        const input = `
Unknown 0.083
C4 0.083
`;

        const song = parser.parse(input);

        expect(song.notes).toHaveLength(1);

        expect(song.notes[0].midi).toBe(60);
        expect(song.notes[0].startTime).toBeCloseTo(0.083);
    });

    it("rejette une durée invalide", () => {
        expect(() =>
            parser.parse("C4 nope"),
        ).toThrow("Durée invalide");
    });
});