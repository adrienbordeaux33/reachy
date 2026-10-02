import type { Instrument } from "./Instrument";

export const INSTRUMENT_PROFILES = {
    piano: {
        volume: -8,
        oscillator: {
            type: "triangle",
        },
        envelope: {
            attack: 0.008,
            decay: 0.28,
            sustain: 0.16,
            release: 0.65,
        },
        octaveOffset: 0,
    },

    guitar: {
        volume: -10,
        oscillator: {
            type: "sawtooth",
        },
        envelope: {
            attack: 0.004,
            decay: 0.24,
            sustain: 0.08,
            release: 0.22,
        },
        octaveOffset: 0,
    },

    bass: {
        volume: -10,
        oscillator: {
            type: "square",
        },
        envelope: {
            attack: 0.006,
            decay: 0.12,
            sustain: 0.56,
            release: 0.2,
        },
        octaveOffset: -12,
    },
} satisfies Record<
    Instrument,
    {
        volume: number;
        oscillator: {
            type:
                | "triangle"
                | "sawtooth"
                | "square";
        };
        envelope: {
            attack: number;
            decay: number;
            sustain: number;
            release: number;
        };
        octaveOffset: number;
    }
>;