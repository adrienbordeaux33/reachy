// src/game/beatmap/getPlayableCandidates.ts

import type { PlayableRange } from "./PlayableRange";

export function getPlayableCandidates(
    midi: number,
    range: PlayableRange,
): number[] {
    const pitchClass = ((midi % 12) + 12) % 12;

    const candidates: number[] = [];

    for (
        let candidate = range.min;
        candidate <= range.max;
        candidate++
    ) {
        if (candidate % 12 === pitchClass) {
            candidates.push(candidate);
        }
    }

    return candidates;
}