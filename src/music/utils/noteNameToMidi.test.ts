// src/music/utils/noteNameToMidi.test.ts

import { describe, expect, it } from "vitest";
import { noteNameToMidi } from "../parsers/TxtMusicParser.ts";

describe("noteNameToMidi", () => {
    it("convertit les notes naturelles", () => {
        expect(noteNameToMidi("C4")).toBe(60);
        expect(noteNameToMidi("A4")).toBe(69);
        expect(noteNameToMidi("C5")).toBe(72);
    });

    it("convertit les dièses", () => {
        expect(noteNameToMidi("C#4")).toBe(61);
        expect(noteNameToMidi("A#6")).toBe(94);
    });

    it("convertit les notes présentes dans mario.txt", () => {
        expect(noteNameToMidi("E6")).toBe(88);
        expect(noteNameToMidi("G6")).toBe(91);
        expect(noteNameToMidi("C7")).toBe(96);
        expect(noteNameToMidi("E7")).toBe(100);
        expect(noteNameToMidi("A7")).toBe(105);
    });

    it("rejette une note invalide", () => {
        expect(() => noteNameToMidi("TEST")).toThrow();
    });
});