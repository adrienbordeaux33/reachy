import type { VisibleGameNote } from "../../game/timeline/GameTimeline";

import {
    isBlackKey,
} from "../config/pianoConfig";

import {
    getKeyRect,
    getTrackProgressY,
    getTrackScale, getVisualProgress,
    projectTrackX,
} from "./pianoGeometry";

interface FallingNotesRenderState {
    width: number;
    height: number;
    notes: VisibleGameNote[];
}

export function renderFallingNotes(
    ctx: CanvasRenderingContext2D,
    state: FallingNotesRenderState,
): void {
    const {
        width,
        height,
        notes,
    } = state;

    for (const {
        note,
        progress,
    } of notes) {

        const visualProgress =
            getVisualProgress(progress);

        const key =
            getKeyRect(
                note.midi,
                width,
            );

        /*
         * Centre réel de la touche dans
         * l'espace "plat" du piano.
         */
        const flatCenterX =
            key.x + key.w / 2;

        /*
         * Puis projection de CE centre
         * sur la piste.
         */
        const centerX =
            projectTrackX(
                flatCenterX,
                visualProgress,
                width,
            );

        const y =
            getTrackProgressY(
                visualProgress,
                height,
            );

        const scale =
            getTrackScale(visualProgress);

        const black =
            isBlackKey(note.midi);

        /*
         * Les touches noires sont plus étroites,
         * donc leur note l'est également.
         */
        const noteWidth =
            Math.max(
                10,
                key.w * scale * 0.7,
            );

        const noteHeight =
            Math.max(
                7,
                18 * scale,
            );

        ctx.save();

        if (black) {
            ctx.fillStyle =
                "rgba(244, 114, 182, 0.95)";

            ctx.shadowColor =
                "rgba(244, 114, 182, 0.85)";
        } else {
            ctx.fillStyle =
                "rgba(110, 231, 183, 0.95)";

            ctx.shadowColor =
                "rgba(110, 231, 183, 0.85)";
        }

        ctx.shadowBlur = 12;

        ctx.beginPath();

        ctx.roundRect(
            centerX - noteWidth / 2,
            y - noteHeight / 2,
            noteWidth,
            noteHeight,
            noteHeight / 2,
        );

        ctx.fill();

        ctx.restore();
    }
}