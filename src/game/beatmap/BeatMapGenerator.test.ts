// src/game/beatmap/BeatmapGenerator.test.ts

import { describe, expect, it } from "vitest";

import { BeatmapGenerator } from "./BeatmapGenerator";

describe("BeatmapGenerator", () => {
    const generator = new BeatmapGenerator();

    it("génère une beatmap jouable", () => {
        const beatmap = generator.generate({
            duration: 1,

            notes: [
                {
                    midi: 100, // E7
                    startTime: 0,
                    duration: 0.083,
                },
                {
                    midi: 103, // G7
                    startTime: 0.1,
                    duration: 0.083,
                },
                {
                    midi: 105, // A7
                    startTime: 0.2,
                    duration: 0.083,
                },
            ],
        });

        expect(beatmap.notes).toHaveLength(3);

        expect(beatmap.notes[0]).toEqual({
            id: "note-0",
            originalMidi: 100,
            midi: 64,
            hitTime: 0,
            duration: 0.083,
        });

        expect(beatmap.notes[1].midi).toBe(67);
        expect(beatmap.notes[2].midi).toBe(69);
    });

    it("garde toutes les notes dans la plage jouable", () => {
        const beatmap = generator.generate({
            duration: 1,

            notes: [
                { midi: 40, startTime: 0, duration: 0.1 },
                { midi: 60, startTime: 0.1, duration: 0.1 },
                { midi: 88, startTime: 0.2, duration: 0.1 },
                { midi: 105, startTime: 0.3, duration: 0.1 },
            ],
        });

        for (const note of beatmap.notes) {
            expect(note.midi).toBeGreaterThanOrEqual(60);
            expect(note.midi).toBeLessThanOrEqual(72);
        }
    });
});