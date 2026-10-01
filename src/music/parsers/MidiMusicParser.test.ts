import { describe, expect, it } from "vitest";
import { MidiMusicParser } from "./MidiMusicParser";

function makeMidiFile(track: number[]): ArrayBuffer {
  const header = [
    0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01,
    0x01, 0xe0,
  ];
  const trackHeader = [
    0x4d,
    0x54,
    0x72,
    0x6b,
    (track.length >>> 24) & 0xff,
    (track.length >>> 16) & 0xff,
    (track.length >>> 8) & 0xff,
    track.length & 0xff,
  ];
  return new Uint8Array([...header, ...trackHeader, ...track]).buffer;
}

describe("MidiMusicParser", () => {
  const parser = new MidiMusicParser();

  it("parse les notes et convertit les ticks en secondes", () => {
    const song = parser.parse(
      makeMidiFile([
        0x00, 0x90, 0x3c, 0x64, 0x83, 0x60, 0x80, 0x3c, 0x00, 0x00, 0xff, 0x2f,
        0x00,
      ]),
    );

    expect(song.notes).toEqual([
      {
        midi: 60,
        velocity: 100,
        startTime: 0,
        duration: 0.5,
      },
    ]);
    expect(song.duration).toBe(0.5);
    expect(song.bpm).toBe(120);
  });

  it("applique les changements de tempo et lit le nom de piste", () => {
    const song = parser.parse(
      makeMidiFile([
        0x00, 0xff, 0x03, 0x04, 0x44, 0x65, 0x6d, 0x6f, 0x00, 0xff, 0x51, 0x03,
        0x07, 0xa1, 0x20, 0x00, 0x90, 0x3c, 0x64, 0x81, 0x70, 0xff, 0x51, 0x03,
        0x0f, 0x42, 0x40, 0x81, 0x70, 0x80, 0x3c, 0x00, 0x00, 0x90, 0x3e, 0x64,
        0x83, 0x60, 0x80, 0x3e, 0x00, 0x00, 0xff, 0x2f, 0x00,
      ]),
    );

    expect(song.title).toBe("Demo");
    expect(song.notes[0].startTime).toBe(0);
    expect(song.notes[0].duration).toBeCloseTo(0.75);
    expect(song.notes[1].startTime).toBeCloseTo(0.75);
    expect(song.notes[1].duration).toBeCloseTo(1);
    expect(song.duration).toBeCloseTo(1.75);
  });

  it("rejette un fichier qui ne contient pas d'en-tête MIDI", () => {
    expect(() => parser.parse(new ArrayBuffer(4))).toThrow(
      "En-tête MIDI introuvable.",
    );
  });
});
