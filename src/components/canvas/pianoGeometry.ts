// components/song-piano/canvas/pianoGeometry.ts

import {
    KEYBOARD_FAR_SCALE,
    WHITE_NOTES,
    isBlackKey, TRACK_FAR_SCALE,
} from "../config/pianoConfig";

export interface Point {
    x: number;
    y: number;
}

export interface KeyRect {
    x: number;
    w: number;
}

export function getKeyboardHeight(
    height: number,
): number {
    return Math.min(108, height * 0.24);
}

export function getKeyRect(
    midi: number,
    width: number,
): KeyRect {
    const whiteWidth =
        width / WHITE_NOTES.length;

    if (!isBlackKey(midi)) {
        return {
            x:
                WHITE_NOTES.indexOf(
                    midi as (typeof WHITE_NOTES)[number],
                ) * whiteWidth,
            w: whiteWidth,
        };
    }

    const blackWidth = whiteWidth * 0.58;

    return {
        x:
            (WHITE_NOTES.indexOf(
                    (midi - 1) as (typeof WHITE_NOTES)[number],
                ) +
                1) *
            whiteWidth -
            blackWidth / 2,

        w: blackWidth,
    };
}

export function projectKeyboardX(
    x: number,
    width: number,
    scale: number,
): number {
    const vanishingX = width / 2;

    return (
        vanishingX +
        (x - vanishingX) * scale
    );
}

export function getPerspectiveScale(
    depth: number,
): number {
    return (
        KEYBOARD_FAR_SCALE +
        depth * (1 - KEYBOARD_FAR_SCALE)
    );
}
export function lerp(
    from: number,
    to: number,
    progress: number,
): number {
    return from + (to - from) * progress;
}

export function clamp01(
    value: number,
): number {
    return Math.max(
        0,
        Math.min(1, value),
    );
}

export function getTrackTopY(
    height: number,
): number {
    // On remonte légèrement le début de la piste.
    return height * 0.015;
}

export function getTrackProgressY(
    progress: number,
    height: number,
): number {
    const keyTop =
        height - getKeyboardHeight(height);

    const trackTopY =
        getTrackTopY(height);

    return lerp(
        trackTopY,
        keyTop,
        clamp01(progress),
    );
}

export function getTrackScale(
    progress: number,
): number {
    return lerp(
        TRACK_FAR_SCALE,
        KEYBOARD_FAR_SCALE,
        clamp01(progress),
    );
}

export function projectTrackX(
    flatX: number,
    progress: number,
    width: number,
): number {
    return projectKeyboardX(
        flatX,
        width,
        getTrackScale(progress),
    );
}

export function getVisualProgress(
    progress: number,
): number {
    const t = clamp01(progress);

    return 1 - Math.pow(1 - t, 1.20);
}