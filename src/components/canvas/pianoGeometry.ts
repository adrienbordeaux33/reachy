// components/song-piano/canvas/pianoGeometry.ts

import {
    KEYBOARD_FAR_SCALE,
    WHITE_NOTES,
    isBlackKey,
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