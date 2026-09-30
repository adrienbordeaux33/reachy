// src/game/beatmap/marioBeatmap.test.ts

import { describe, expect, it } from "vitest";

import marioTxt from "../../fixtures/mario.txt?raw";

import { TxtMusicParser } from "../../music/parsers/TxtMusicParser";
import { BeatmapGenerator } from "./BeatmapGenerator";

describe("Mario Beatmap", () => {
    it("transforme Mario en morceau jouable sur C4-C5", () => {
        const parser = new TxtMusicParser();
        const generator = new BeatmapGenerator();

        const song = parser.parse(marioTxt);

        const beatmap = generator.generate(song);

        expect(beatmap.notes.length)
            .toBe(song.notes.length);

        expect(beatmap.duration)
            .toBe(song.duration);

        for (const note of beatmap.notes) {
            expect(note.midi)
                .toBeGreaterThanOrEqual(60);

            expect(note.midi)
                .toBeLessThanOrEqual(72);
        }

        console.table(
            beatmap.notes.slice(0, 30),
        );
    });
});