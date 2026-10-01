import {
    describe,
    expect,
    it,
} from "vitest";

import {
    calculateHitScore,
    getComboMultiplier,
} from "./scoreCalculator";

describe("getComboMultiplier", () => {
    it("uses x1 below 10 combo", () => {
        expect(
            getComboMultiplier(0),
        ).toBe(1);

        expect(
            getComboMultiplier(9),
        ).toBe(1);
    });

    it("uses x2 from 10 combo", () => {
        expect(
            getComboMultiplier(10),
        ).toBe(2);

        expect(
            getComboMultiplier(19),
        ).toBe(2);
    });

    it("uses x3 from 20 combo", () => {
        expect(
            getComboMultiplier(20),
        ).toBe(3);
    });

    it("caps the multiplier at x4", () => {
        expect(
            getComboMultiplier(30),
        ).toBe(4);

        expect(
            getComboMultiplier(100),
        ).toBe(4);
    });
});

describe("calculateHitScore", () => {
    it("scores a perfect hit", () => {
        expect(
            calculateHitScore(
                "perfect",
                0,
            ),
        ).toBe(1000);
    });

    it("scores a great hit", () => {
        expect(
            calculateHitScore(
                "great",
                0,
            ),
        ).toBe(700);
    });

    it("scores a good hit", () => {
        expect(
            calculateHitScore(
                "good",
                0,
            ),
        ).toBe(400);
    });

    it("applies the combo multiplier", () => {
        expect(
            calculateHitScore(
                "perfect",
                20,
            ),
        ).toBe(3000);
    });
});