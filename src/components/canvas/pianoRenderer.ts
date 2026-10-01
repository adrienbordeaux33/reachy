// components/song-piano/canvas/pianoRenderer.ts

import {
    FIRST_MIDI,
    LAST_MIDI,
    KEYBOARD_FAR_SCALE,
    KEY_LABELS,
    WHITE_NOTES,
    isBlackKey
} from "../config/pianoConfig";

import {
    getKeyRect,
    getKeyboardHeight,
    getTrackTopY,
    projectTrackX,
    type Point, projectKeyboardX, getTrackProgressY,
} from "./pianoGeometry";

export interface PianoRenderState {
    width: number;
    height: number;
    pressedNotes: ReadonlySet<number>;
}

export function renderPiano(
    ctx: CanvasRenderingContext2D,
    state: PianoRenderState,
): void {
    const {
        width,
        height,
        pressedNotes
    } = state;

    // Nettoyage du canvas avant chaque frame.
    // ctx.clearRect(0, 0, width, height);

    const keyTop =
        height - getKeyboardHeight(height);



    drawTrack(
        ctx,
        width,
        height,
        keyTop
    );

    drawWhiteKeys(
        ctx,
        width,
        height,
        keyTop,
        pressedNotes,
    );

    drawBlackKeys(
        ctx,
        width,
        height,
        keyTop,
        pressedNotes,
    );
}


function drawTrack(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    keyTop: number,
): void {
    const trackTopY =
        getTrackTopY(height);

    /*
     * Limites gauche/droite de la piste
     * en haut.
     */
    const topLeft =
        projectTrackX(
            0,
            0,
            width,
        );

    const topRight =
        projectTrackX(
            width,
            0,
            width,
        );

    /*
     * Limites gauche/droite de la piste
     * au niveau du piano.
     */
    const bottomLeft =
        projectTrackX(
            0,
            1,
            width,
        );

    const bottomRight =
        projectTrackX(
            width,
            1,
            width,
        );

    /*
     * Fond transparent de la piste.
     */
    const trackGradient =
        ctx.createLinearGradient(
            0,
            trackTopY,
            0,
            keyTop,
        );

    trackGradient.addColorStop(
        0,
        "rgba(255, 255, 255, 0.16)",
    );

    trackGradient.addColorStop(
        1,
        "rgba(255, 255, 255, 0.06)",
    );

    ctx.beginPath();

    ctx.moveTo(
        topLeft,
        trackTopY,
    );

    ctx.lineTo(
        topRight,
        trackTopY,
    );

    ctx.lineTo(
        bottomRight,
        keyTop,
    );

    ctx.lineTo(
        bottomLeft,
        keyTop,
    );

    ctx.closePath();

    ctx.fillStyle =
        trackGradient;

    ctx.fill();

    /*
     * Lignes verticales des canaux.
     *
     * C'EST ICI que va la boucle
     * dont on parlait.
     */
    const whiteWidth =
        width / WHITE_NOTES.length;

    ctx.strokeStyle =
        "rgba(255, 255, 255, 0.20)";

    ctx.lineWidth = 1;

    for (
        let boundary = 0;
        boundary <= WHITE_NOTES.length;
        boundary += 1
    ) {
        const flatX =
            boundary * whiteWidth;

        const topX =
            projectTrackX(
                flatX,
                0,
                width,
            );

        const bottomX =
            projectTrackX(
                flatX,
                1,
                width,
            );

        ctx.beginPath();

        ctx.moveTo(
            topX,
            trackTopY,
        );

        ctx.lineTo(
            bottomX,
            keyTop,
        );

        ctx.stroke();
    }

    /*
     * Lignes horizontales donnant
     * la sensation de profondeur.
     */
    const depthLines = [
        0.2,
        0.38,
        0.59,
        0.82,
    ];

    for (const progress of depthLines) {
        const y =
            getTrackProgressY(
                progress,
                height,
            );

        const left =
            projectTrackX(
                0,
                progress,
                width,
            );

        const right =
            projectTrackX(
                width,
                progress,
                width,
            );

        ctx.beginPath();

        ctx.moveTo(left, y);
        ctx.lineTo(right, y);

        ctx.stroke();
    }
}

function drawWhiteKeys(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    keyTop: number,
    pressedNotes: ReadonlySet<number>,
): void {
    const whiteWidth =
        width / WHITE_NOTES.length;

    for (
        let index = 0;
        index < WHITE_NOTES.length;
        index += 1
    ) {
        const midi = WHITE_NOTES[index];

        const flatLeft =
            index * whiteWidth;

        const flatRight =
            flatLeft + whiteWidth;

        const farLeft =
            projectKeyboardX(
                flatLeft,
                width,
                KEYBOARD_FAR_SCALE,
            );

        const farRight =
            projectKeyboardX(
                flatRight,
                width,
                KEYBOARD_FAR_SCALE,
            );

        const nearLeft = flatLeft;
        const nearRight = flatRight;

        const isPressed =
            pressedNotes.has(midi);

        const keyPoints: Point[] = [
            {
                x: farLeft,
                y: keyTop,
            },
            {
                x: farRight,
                y: keyTop,
            },
            {
                x: nearRight,
                y: height,
            },
            {
                x: nearLeft,
                y: height,
            },
        ];

        ctx.save();

        traceRoundedPolygon(
            ctx,
            keyPoints,
            isPressed ? 3 : 2.5,
        );

        const keyGradient =
            ctx.createLinearGradient(
                0,
                keyTop,
                0,
                height,
            );

        keyGradient.addColorStop(
            0,
            isPressed
                ? "#b5b3b3"
                : "#f7f4de",
        );

        keyGradient.addColorStop(
            0.22,
            isPressed
                ? "#a1a0a0"
                : "#f7f4de",
        );

        keyGradient.addColorStop(
            1,
            isPressed
                ? "#787777"
                : "#f7f4de",
        );

        ctx.fillStyle = keyGradient;
        ctx.fill();

        ctx.strokeStyle =
            "rgba(6, 6, 6, 0.72)";

        ctx.lineWidth = 1;
        ctx.stroke();

        // Reflet sur le côté gauche.
        ctx.beginPath();

        ctx.moveTo(
            farLeft + 2,
            keyTop + 3,
        );

        ctx.lineTo(
            nearLeft + 2,
            height - 4,
        );

        ctx.strokeStyle =
            "rgba(255, 255, 255, 0.62)";

        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();

        // Label clavier.
        ctx.fillStyle = "#26352d";

        ctx.font =
            `600 ${
                Math.max(
                    11,
                    Math.min(
                        15,
                        whiteWidth * 0.34,
                    ),
                )
            }px sans-serif`;

        ctx.textAlign = "center";

        ctx.fillText(
            KEY_LABELS[midi],
            projectKeyboardX(
                flatLeft +
                whiteWidth / 2,
                width,
                0.96,
            ),
            height - 13,
        );
    }
}

function drawBlackKeys(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    keyTop: number,
    pressedNotes: ReadonlySet<number>,
): void {
    const whiteHeight =
        height - keyTop;

    for (
        let midi = FIRST_MIDI;
        midi <= LAST_MIDI;
        midi += 1
    ) {
        if (!isBlackKey(midi)) {
            continue;
        }

        const { x, w } =
            getKeyRect(midi, width);

        const blackDepth = 0.62;

        const blackHeight =
            whiteHeight * blackDepth;

        const nearScale =
            KEYBOARD_FAR_SCALE +
            blackDepth *
            (1 - KEYBOARD_FAR_SCALE);

        const farLeft =
            projectKeyboardX(
                x,
                width,
                KEYBOARD_FAR_SCALE,
            );

        const farRight =
            projectKeyboardX(
                x + w,
                width,
                KEYBOARD_FAR_SCALE,
            );

        const nearLeft =
            projectKeyboardX(
                x,
                width,
                nearScale,
            );

        const nearRight =
            projectKeyboardX(
                x + w,
                width,
                nearScale,
            );

        const nearY =
            keyTop + blackHeight;

        const isPressed =
            pressedNotes.has(midi);

        ctx.save();

        // Petite face avant de la touche noire.
        ctx.beginPath();

        ctx.moveTo(
            nearLeft,
            nearY - 2,
        );

        ctx.lineTo(
            nearRight,
            nearY - 2,
        );

        ctx.lineTo(
            nearRight,
            nearY + 4,
        );

        ctx.lineTo(
            nearLeft,
            nearY + 4,
        );

        ctx.closePath();

        ctx.fillStyle = "#080b09";
        ctx.fill();

        const keyPoints: Point[] = [
            {
                x: farLeft,
                y: keyTop,
            },
            {
                x: farRight,
                y: keyTop,
            },
            {
                x: nearRight,
                y: nearY,
            },
            {
                x: nearLeft,
                y: nearY,
            },
        ];

        traceRoundedPolygon(
            ctx,
            keyPoints,
            Math.min(3, w * 0.06),
        );

        const keyGradient =
            ctx.createLinearGradient(
                0,
                keyTop,
                0,
                nearY,
            );

        keyGradient.addColorStop(
            0,
            isPressed
                ? "#717070"
                : "#191919",
        );

        keyGradient.addColorStop(
            1,
            isPressed
                ? "#94918f"
                : "#606260",
        );

        ctx.fillStyle = keyGradient;
        ctx.fill();

        ctx.strokeStyle =
            "rgba(0, 0, 0, 0.82)";

        ctx.lineWidth = 1;
        ctx.stroke();

        // Reflet supérieur.
        ctx.beginPath();

        ctx.moveTo(
            farLeft + 2,
            keyTop + 2,
        );

        ctx.lineTo(
            farRight - 2,
            keyTop + 2,
        );

        ctx.strokeStyle =
            "rgba(255, 255, 255, 0.24)";

        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();

        // Label clavier.
        ctx.beginPath();

        ctx.fillStyle =
            "rgba(255, 255, 255, 0.76)";

        ctx.font =
            `600 ${
                Math.max(
                    9,
                    Math.min(
                        12,
                        w * 0.34,
                    ),
                )
            }px sans-serif`;

        ctx.textAlign = "center";

        ctx.fillText(
            KEY_LABELS[midi],
            projectKeyboardX(
                x + w / 2,
                width,
                nearScale,
            ),
            nearY - 10,
        );
    }
}

function traceRoundedPolygon(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    radius: number,
): void {
    ctx.beginPath();

    points.forEach(
        (point, index) => {
            const previous =
                points[
                (index +
                    points.length -
                    1) %
                points.length
                    ];

            const next =
                points[
                (index + 1) %
                points.length
                    ];

            const previousLength =
                Math.hypot(
                    point.x - previous.x,
                    point.y - previous.y,
                );

            const nextLength =
                Math.hypot(
                    next.x - point.x,
                    next.y - point.y,
                );

            const cornerRadius =
                Math.min(
                    radius,
                    previousLength * 0.45,
                    nextLength * 0.45,
                );

            const startX =
                point.x +
                ((previous.x - point.x) /
                    previousLength) *
                cornerRadius;

            const startY =
                point.y +
                ((previous.y - point.y) /
                    previousLength) *
                cornerRadius;

            const endX =
                point.x +
                ((next.x - point.x) /
                    nextLength) *
                cornerRadius;

            const endY =
                point.y +
                ((next.y - point.y) /
                    nextLength) *
                cornerRadius;

            if (index === 0) {
                ctx.moveTo(
                    startX,
                    startY,
                );
            } else {
                ctx.lineTo(
                    startX,
                    startY,
                );
            }

            ctx.quadraticCurveTo(
                point.x,
                point.y,
                endX,
                endY,
            );
        },
    );

    ctx.closePath();
}