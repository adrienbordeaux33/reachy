import { describe, expect, it } from "vitest";
import marioTxt from "../../fixtures/mario.txt?raw";
import { TxtMusicParser } from "../parsers/TxtMusicParser";

describe("mario.txt", () => {
    const parser = new TxtMusicParser();

    it("parse le fichier complet", () => {
        const song = parser.parse(marioTxt);

        expect(song.notes.length).toBeGreaterThan(0);
        expect(song.duration).toBeGreaterThan(0);

        console.log(song);
    });
});