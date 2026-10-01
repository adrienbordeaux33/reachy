import {
    useEffect,
    useRef
} from "react";

import type { VisibleGameNote } from "../../game/timeline/GameTimeline";

import { renderPiano } from "./pianoRenderer";
import { renderFallingNotes } from "./fallingNotesRenderer";

interface PianoCanvasProps {
    pressedNotes?: ReadonlySet<number>;
    getVisibleNotes?: () => VisibleGameNote[];
}

const EMPTY_PRESSED_NOTES =
    new Set<number>();

export default function PianoCanvas({
                                        pressedNotes = EMPTY_PRESSED_NOTES,
                                        getVisibleNotes,
                                    }: PianoCanvasProps) {
    const canvasRef =
        useRef<HTMLCanvasElement>(null);

    /*
     * Le renderer Canvas tourne indépendamment
     * du cycle de rendu React.
     *
     * On garde donc les valeurs courantes dans
     * des refs, mises à jour depuis des effects.
     */
    const pressedNotesRef =
        useRef(pressedNotes);

    const getVisibleNotesRef =
        useRef(getVisibleNotes);

    useEffect(() => {
        pressedNotesRef.current =
            pressedNotes;
    }, [pressedNotes]);

    useEffect(() => {
        getVisibleNotesRef.current =
            getVisibleNotes;
    }, [getVisibleNotes]);

    useEffect(() => {
        const canvas =
            canvasRef.current;

        const ctx =
            canvas?.getContext("2d");

        if (!canvas || !ctx) {
            return;
        }

        let width = 0;
        let height = 0;

        let frame = 0;

        /*
         * Synchronise la résolution interne du Canvas
         * avec sa taille CSS.
         */
        const resize = () => {
            const bounds =
                canvas.getBoundingClientRect();

            const pixelRatio =
                Math.min(
                    window.devicePixelRatio || 1,
                    2,
                );

            width = bounds.width;
            height = bounds.height;

            canvas.width =
                Math.round(
                    width * pixelRatio,
                );

            canvas.height =
                Math.round(
                    height * pixelRatio,
                );

            ctx.setTransform(
                pixelRatio,
                0,
                0,
                pixelRatio,
                0,
                0,
            );
        };

        const resizeObserver =
            new ResizeObserver(resize);

        resizeObserver.observe(canvas);

        resize();

        /*
         * Boucle principale de rendu.
         */
        const draw = () => {
            if (
                width <= 0 ||
                height <= 0
            ) {
                frame =
                    requestAnimationFrame(draw);

                return;
            }

            /*
             * On efface la frame précédente.
             *
             * Le Canvas reste transparent :
             * le background appartient à la page.
             */
            ctx.clearRect(
                0,
                0,
                width,
                height,
            );

            /*
             * 1. Piste + piano
             */
            renderPiano(ctx, {
                width,
                height,
                pressedNotes: pressedNotesRef.current,
            });

            /*
             * 2. Notes de la Beatmap actuellement
             * visibles.
             */
            const visibleNotes =
                getVisibleNotesRef.current?.() ??
                [];

            renderFallingNotes(ctx, {
                width,
                height,
                notes: visibleNotes,
            });

            frame =
                requestAnimationFrame(draw);
        };

        frame =
            requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(frame);

            resizeObserver.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="
        block
        h-full
        w-full
        touch-none
      "
            aria-label="Piano de jeu, de Do4 à Do5"
        />
    );
}