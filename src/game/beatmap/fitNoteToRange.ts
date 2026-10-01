// src/game/beatmap/fitNoteToRange.ts

import type { PlayableRange } from "./PlayableRange";
import { getPlayableCandidates } from "./getPlayableCandidates";

export function fitNoteToRange(
    midi: number,
    range: PlayableRange,
    previousMidi?: number,
): number {
    const candidates =
        getPlayableCandidates(midi, range);

    if (candidates.length === 0) {
        throw new Error(
            `Impossible d'adapter la note MIDI ${midi} ` +
            `à la plage ${range.min}-${range.max}`,
        );
    }

    if (candidates.length === 1) {
        return candidates[0];
    }

    if (previousMidi === undefined) {
        return candidates[0];
    }

    return candidates.reduce((best, candidate) => {
        const candidateDistance =
            Math.abs(candidate - previousMidi);

        const bestDistance =
            Math.abs(best - previousMidi);

        return candidateDistance < bestDistance
            ? candidate
            : best;
    });
}