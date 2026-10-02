import type { HitRating } from "../engine/GameEngine";

const BASE_SCORE: Record<HitRating, number> = {
    perfect: 1000,
    great: 700,
    good: 400,
};

export function getComboMultiplier(combo: number): number {
    if (combo >= 30) {
        return 4;
    }

    if (combo >= 20) {
        return 3;
    }

    if (combo >= 10) {
        return 2;
    }

    return 1;
}

export function calculateHitScore(rating: HitRating, combo: number): number {
    const baseScore = BASE_SCORE[rating];

    const multiplier = getComboMultiplier(combo);

    return baseScore * multiplier;
}
