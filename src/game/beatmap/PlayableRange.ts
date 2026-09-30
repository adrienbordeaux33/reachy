// src/game/beatmap/PlayableRange.ts

export interface PlayableRange {
    min: number;
    max: number;
}

export const PIANO_PLAYABLE_RANGE: PlayableRange = {
    min: 60, // C4
    max: 72, // C5
};