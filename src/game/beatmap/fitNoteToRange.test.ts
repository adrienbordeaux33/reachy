// src/game/beatmap/fitNoteToRange.test.ts

import { describe, expect, it } from "vitest";

import { fitNoteToRange } from "./fitNoteToRange";
import { PIANO_PLAYABLE_RANGE } from "./PlayableRange";

describe("fitNoteToRange", () => {
    it("ramène les notes aiguës dans la plage jouable", () => {
        expect(
            fitNoteToRange(100, PIANO_PLAYABLE_RANGE),
        ).toBe(64); // E7 → E4

        expect(
            fitNoteToRange(103, PIANO_PLAYABLE_RANGE),
        ).toBe(67); // G7 → G4

        expect(
            fitNoteToRange(105, PIANO_PLAYABLE_RANGE),
        ).toBe(69); // A7 → A4
    });

    it("conserve les notes déjà jouables", () => {
        expect(
            fitNoteToRange(64, PIANO_PLAYABLE_RANGE),
        ).toBe(64);
    });

    it("peut utiliser C4 ou C5", () => {
        expect(
            fitNoteToRange(
                96,
                PIANO_PLAYABLE_RANGE,
                71,
            ),
        ).toBe(72);

        expect(
            fitNoteToRange(
                96,
                PIANO_PLAYABLE_RANGE,
                62,
            ),
        ).toBe(60);
    });
});