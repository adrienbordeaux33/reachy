
import { useEffect, useRef } from "react";
import { renderPiano } from "./pianoRenderer";

interface PianoCanvasProps {
    pressedNotes?: ReadonlySet<number>;
}

const EMPTY_PRESSED_NOTES = new Set<number>();

export default function PianoCanvas({
                                        pressedNotes = EMPTY_PRESSED_NOTES,
                                    }: PianoCanvasProps) {
    const canvasRef =
        useRef<HTMLCanvasElement>(null);

    const pressedNotesRef =
        useRef(pressedNotes);

    useEffect(() => {
        pressedNotesRef.current = pressedNotes;
    }, [pressedNotes]);

    useEffect(() => {


        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");

        if (!canvas || !ctx) {
            return;
        }

        let width = 0;
        let height = 0;
        let frame = 0;

        const resize = () => {
            const bounds =
                canvas.getBoundingClientRect();

            const pixelRatio = Math.min(
                window.devicePixelRatio || 1,
                2,
            );

            width = bounds.width;
            height = bounds.height;

            canvas.width = Math.round(
                width * pixelRatio,
            );

            canvas.height = Math.round(
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

        const draw = () => {
            if (width > 0 && height > 0) {
                renderPiano(ctx, {
                    width,
                    height,
                    pressedNotes: pressedNotesRef.current
                });
            }

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
            className="block h-full w-full touch-none"
            aria-label="Piano interactif sur une octave, de Do4 à Do5"
        />
    );
}