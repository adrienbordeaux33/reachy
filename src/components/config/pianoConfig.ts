// components/song-piano/config/pianoConfig.ts
export const TRACK_FAR_SCALE = 0.15;

export const FIRST_MIDI = 60;
export const LAST_MIDI = 72;

export const WHITE_NOTES = [
    60,
    62,
    64,
    65,
    67,
    69,
    71,
    72,
] as const;

export const BLACK_PITCHES = new Set([
    1,
    3,
    6,
    8,
    10,
]);

export const KEYBOARD_FAR_SCALE = 0.82;

export const KEY_MAP: Record<string, number> = {
    KeyS: 60,
    KeyE: 61,
    KeyD: 62,
    KeyR: 63,
    KeyF: 64,
    KeyG: 65,
    KeyY: 66,
    KeyH: 67,
    KeyU: 68,
    KeyJ: 69,
    KeyI: 70,
    KeyK: 71,
    KeyL: 72,
};

export const KEY_LABELS: Record<number, string> = {
    60: "S",
    61: "E",
    62: "D",
    63: "R",
    64: "F",
    65: "G",
    66: "Y",
    67: "H",
    68: "U",
    69: "J",
    70: "I",
    71: "K",
    72: "L",
};

export function isBlackKey(midi: number): boolean {
    return BLACK_PITCHES.has(midi % 12);
}