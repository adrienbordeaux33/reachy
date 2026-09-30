import { useEffect, useRef, type PointerEvent } from "react";
import sceneBackground from "../assets/fond.png";
import { PauseIcon } from "./icons.tsx";

interface TrailNote {
    midi: number;
    startedAt: number;
}

const FIRST = 60;
const LAST = 72;
const TRAIL_DURATION = 1.4;
const KEYBOARD_FAR_SCALE = 0.82;
const WHITE_NOTES = [60, 62, 64, 65, 67, 69, 71, 72];
const BLACK_PITCHES = new Set([1, 3, 6, 8, 10]);
const isBlack = (midi: number) => BLACK_PITCHES.has(midi % 12);

interface Point {
    x: number;
    y: number;
}

interface PianoHeroProps {
    isPaused: boolean;
    onPause: () => void;
    onResume: () => void;
}

const KEY_MAP: Record<string, number> = {
    KeyS: 60,
    KeyE: 61,
    KeyD: 62,
    KeyR: 63,
    KeyF: 64,
    KeyG: 65,
    KeyY: 66,
    KeyH: 67,
    KeyU: 68,
    KeyJ: 69,
    KeyI: 70,
    KeyK: 71,
    KeyL: 72,
};

const KEY_LABELS: Record<number, string> = {
    60: "S",
    61: "E",
    62: "D",
    63: "R",
    64: "F",
    65: "G",
    66: "Y",
    67: "H",
    68: "U",
    69: "J",
    70: "I",
    71: "K",
    72: "L",
};

function keyRect(midi: number, width: number) {
    const whiteWidth = width / WHITE_NOTES.length;
    if (!isBlack(midi)) {
        return { x: WHITE_NOTES.indexOf(midi) * whiteWidth, w: whiteWidth };
    }

    const blackWidth = whiteWidth * 0.58;
    return {
        x: (WHITE_NOTES.indexOf(midi - 1) + 1) * whiteWidth - blackWidth / 2,
        w: blackWidth,
    };
}

function projectKeyboardX(x: number, width: number, scale: number) {
    const vanishingX = width / 2;
    return vanishingX + (x - vanishingX) * scale;
}

function traceRoundedPolygon(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    radius: number,
) {
    ctx.beginPath();
    points.forEach((point, index) => {
        const previous = points[(index + points.length - 1) % points.length];
        const next = points[(index + 1) % points.length];
        const previousLength = Math.hypot(
            point.x - previous.x,
            point.y - previous.y,
        );
        const nextLength = Math.hypot(next.x - point.x, next.y - point.y);
        const cornerRadius = Math.min(
            radius,
            previousLength * 0.45,
            nextLength * 0.45,
        );
        const startX =
            point.x + ((previous.x - point.x) / previousLength) * cornerRadius;
        const startY =
            point.y + ((previous.y - point.y) / previousLength) * cornerRadius;
        const endX = point.x + ((next.x - point.x) / nextLength) * cornerRadius;
        const endY = point.y + ((next.y - point.y) / nextLength) * cornerRadius;

        if (index === 0) ctx.moveTo(startX, startY);
        else ctx.lineTo(startX, startY);
        ctx.quadraticCurveTo(point.x, point.y, endX, endY);
    });
    ctx.closePath();
}

function keyboardHeight(height: number) {
    return Math.min(108, height * 0.24);
}

export default function PianoHero({
    isPaused,
    onPause,
    onResume,
}: PianoHeroProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const pressedRef = useRef(new Set<number>());
    const trailNotesRef = useRef<TrailNote[]>([]);
    const pointerNoteRef = useRef<number | null>(null);
    const pausedRef = useRef(false);
    pausedRef.current = isPaused;

    const playSound = (midi: number) => {
        const AudioContextConstructor = window.AudioContext;
        if (!AudioContextConstructor) return;

        const audioContext =
            audioContextRef.current ?? new AudioContextConstructor();
        audioContextRef.current = audioContext;
        if (audioContext.state === "suspended") void audioContext.resume();

        const now = audioContext.currentTime;
        const frequency = 440 * 2 ** ((midi - 69) / 12);
        const partials = [
            { multiplier: 1, volume: 0.2, type: "triangle" as OscillatorType },
            { multiplier: 2, volume: 0.045, type: "sine" as OscillatorType },
        ];

        for (const partial of partials) {
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.type = partial.type;
            oscillator.frequency.setValueAtTime(
                frequency * partial.multiplier,
                now,
            );
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(partial.volume, now + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.start(now);
            oscillator.stop(now + 1.3);
        }
    };

    const pressNote = (midi: number) => {
        if (
            pausedRef.current ||
            midi < FIRST ||
            midi > LAST ||
            pressedRef.current.has(midi)
        ) {
            return;
        }

        pressedRef.current.add(midi);
        trailNotesRef.current.push({ midi, startedAt: performance.now() });
        playSound(midi);
    };

    const releaseNote = (midi: number) => {
        pressedRef.current.delete(midi);
    };

    const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
        if (pausedRef.current) return;

        const canvas = event.currentTarget;
        const bounds = canvas.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        const width = bounds.width;
        const height = bounds.height;
        const keyTop = height - keyboardHeight(height);
        const whiteHeight = height - keyTop;

        if (y < keyTop || x < 0 || x > width) return;
        const depth = Math.max(0, Math.min(1, (y - keyTop) / whiteHeight));
        const perspectiveScale =
            KEYBOARD_FAR_SCALE + depth * (1 - KEYBOARD_FAR_SCALE);
        const keyboardX = width / 2 + (x - width / 2) / perspectiveScale;

        let midi: number | undefined;
        for (let candidate = FIRST; candidate <= LAST; candidate += 1) {
            if (
                !isBlack(candidate) ||
                y > keyTop + keyboardHeight(height) * 0.64
            )
                continue;
            const rect = keyRect(candidate, width);
            if (keyboardX >= rect.x && keyboardX <= rect.x + rect.w) {
                midi = candidate;
                break;
            }
        }

        if (midi === undefined) {
            const whiteIndex = Math.max(
                0,
                Math.min(
                    WHITE_NOTES.length - 1,
                    Math.floor((keyboardX / width) * WHITE_NOTES.length),
                ),
            );
            midi = WHITE_NOTES[whiteIndex];
        }

        pointerNoteRef.current = midi;
        canvas.setPointerCapture(event.pointerId);
        pressNote(midi);
    };

    const handlePointerUp = () => {
        if (pointerNoteRef.current !== null)
            releaseNote(pointerNoteRef.current);
        pointerNoteRef.current = null;
    };

    useEffect(() => {
        if (isPaused) {
            pressedRef.current.clear();
            trailNotesRef.current = [];
            pointerNoteRef.current = null;
            void audioContextRef.current?.suspend();
        } else {
            void audioContextRef.current?.resume();
        }
    }, [isPaused]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        let width = 0;
        let height = 0;
        let frame = 0;
        let disposed = false;
        const backgroundImage = new Image();
        backgroundImage.src = sceneBackground;

        const resize = () => {
            const bounds = canvas.getBoundingClientRect();
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            width = bounds.width;
            height = bounds.height;
            canvas.width = Math.round(width * pixelRatio);
            canvas.height = Math.round(height * pixelRatio);
            ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        resize();

        const draw = () => {
            if (!width || !height) {
                frame = requestAnimationFrame(draw);
                return;
            }

            const keyTop = height - keyboardHeight(height);
            const horizonY = height * 0.11;
            const horizonX = width / 2;
            const horizonScale = Math.max(
                0,
                1 -
                    ((1 - KEYBOARD_FAR_SCALE) * (height - horizonY)) /
                        (height - keyTop),
            );
            const horizonLeft = projectKeyboardX(0, width, horizonScale);
            const horizonRight = projectKeyboardX(width, width, horizonScale);
            const keyboardFarLeft = projectKeyboardX(
                0,
                width,
                KEYBOARD_FAR_SCALE,
            );
            const keyboardFarRight = projectKeyboardX(
                width,
                width,
                KEYBOARD_FAR_SCALE,
            );
            const now = performance.now();

            if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
                const scale = Math.max(
                    width / backgroundImage.naturalWidth,
                    height / backgroundImage.naturalHeight,
                );
                const imageWidth = backgroundImage.naturalWidth * scale;
                const imageHeight = backgroundImage.naturalHeight * scale;
                ctx.drawImage(
                    backgroundImage,
                    (width - imageWidth) / 2,
                    (height - imageHeight) / 2,
                    imageWidth,
                    imageHeight,
                );
            }

            ctx.beginPath();
            ctx.moveTo(horizonLeft, horizonY);
            ctx.lineTo(horizonRight, horizonY);
            ctx.lineTo(keyboardFarRight, keyTop);
            ctx.lineTo(keyboardFarLeft, keyTop);
            ctx.closePath();
            const horizonWash = ctx.createLinearGradient(
                0,
                horizonY,
                0,
                keyTop,
            );
            horizonWash.addColorStop(0, "rgba(255, 255, 255, 0.42)");
            horizonWash.addColorStop(1, "rgba(255, 255, 255, 0.16)");
            ctx.fillStyle = horizonWash;
            ctx.fill();

            ctx.lineWidth = 1;
            for (
                let boundary = 0;
                boundary <= WHITE_NOTES.length;
                boundary += 1
            ) {
                const flatX = (boundary / WHITE_NOTES.length) * width;
                const topX = projectKeyboardX(flatX, width, horizonScale);
                const bottomX = projectKeyboardX(
                    flatX,
                    width,
                    KEYBOARD_FAR_SCALE,
                );
                ctx.beginPath();
                ctx.moveTo(topX, horizonY);
                ctx.lineTo(bottomX, keyTop);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                ctx.stroke();
            }

            for (const depth of [0.2, 0.38, 0.59, 0.82]) {
                const y = horizonY + (keyTop - horizonY) * depth;
                const perspectiveScale =
                    horizonScale + depth * (KEYBOARD_FAR_SCALE - horizonScale);
                const halfWidth = (width * perspectiveScale) / 2;
                ctx.beginPath();
                ctx.moveTo(horizonX - halfWidth, y);
                ctx.lineTo(horizonX + halfWidth, y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 + depth * 0.12})`;
                ctx.stroke();
            }

            trailNotesRef.current = trailNotesRef.current.filter(
                (note) => now - note.startedAt < TRAIL_DURATION * 1000,
            );

            for (const note of trailNotesRef.current) {
                const progress = Math.min(
                    1,
                    (now - note.startedAt) / (TRAIL_DURATION * 1000),
                );
                const { x, w } = keyRect(note.midi, width);
                const perspectiveScale =
                    KEYBOARD_FAR_SCALE +
                    progress * (horizonScale - KEYBOARD_FAR_SCALE);
                const noteScale = perspectiveScale / KEYBOARD_FAR_SCALE;
                const noteX = projectKeyboardX(
                    x + w / 2,
                    width,
                    perspectiveScale,
                );
                const noteY = keyTop - progress * (keyTop - horizonY);
                const noteWidth = Math.max(2, w * 0.64 * perspectiveScale);
                const noteHeight = Math.max(3, 22 * noteScale);
                const alpha = 1 - progress * 0.76;
                const hue = isBlack(note.midi)
                    ? "245, 174, 91"
                    : "124, 208, 164";

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.shadowColor = `rgba(${hue}, 1)`;
                ctx.shadowBlur = 24 * noteScale + 6;
                ctx.fillStyle = `rgba(${hue}, 0.3)`;
                const haloX = noteX - (noteWidth * 1.25) / 2;
                const haloY = noteY - noteHeight * 2.3;
                const haloWidth = noteWidth * 1.25;
                const haloHeight = noteHeight * 3.4;
                ctx.beginPath();
                ctx.roundRect(
                    haloX,
                    haloY,
                    haloWidth,
                    haloHeight,
                    Math.min(haloWidth, haloHeight) / 2,
                );
                ctx.fill();

                ctx.shadowBlur = 12 * noteScale + 3;
                ctx.fillStyle = `rgba(${hue}, 1)`;
                const coreX = noteX - noteWidth / 2;
                const coreY = noteY - noteHeight / 2;
                ctx.beginPath();
                ctx.roundRect(
                    coreX,
                    coreY,
                    noteWidth,
                    noteHeight,
                    Math.min(noteWidth, noteHeight) / 2,
                );
                ctx.fill();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
                ctx.lineWidth = Math.max(1, noteScale);
                ctx.stroke();
                ctx.restore();
            }

            const whiteHeight = height - keyTop;
            const whiteWidth = width / WHITE_NOTES.length;
            for (let index = 0; index < WHITE_NOTES.length; index += 1) {
                const midi = WHITE_NOTES[index];
                const flatLeft = index * whiteWidth;
                const flatRight = flatLeft + whiteWidth;
                const farLeft = projectKeyboardX(
                    flatLeft,
                    width,
                    KEYBOARD_FAR_SCALE,
                );
                const farRight = projectKeyboardX(
                    flatRight,
                    width,
                    KEYBOARD_FAR_SCALE,
                );
                const nearLeft = flatLeft;
                const nearRight = flatRight;
                const isPressed = pressedRef.current.has(midi);
                const keyPoints = [
                    { x: farLeft, y: keyTop },
                    { x: farRight, y: keyTop },
                    { x: nearRight, y: height },
                    { x: nearLeft, y: height },
                ];
                ctx.save();
                traceRoundedPolygon(ctx, keyPoints, isPressed ? 3 : 2.5);
                const keyGradient = ctx.createLinearGradient(
                    0,
                    keyTop,
                    0,
                    height,
                );
                keyGradient.addColorStop(0, isPressed ? "#b5b3b3" : "#f7f4de");
                keyGradient.addColorStop(
                    0.22,
                    isPressed ? "#a1a0a0" : "#f7f4de",
                );
                keyGradient.addColorStop(1, isPressed ? "#787777" : "#f7f4de");
                ctx.fillStyle = keyGradient;
                ctx.fill();
                ctx.strokeStyle = "rgba(6, 6, 6, 0.72)";
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(farLeft + 2, keyTop + 3);
                ctx.lineTo(nearLeft + 2, height - 4);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.62)";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.restore();
                ctx.fillStyle = "#26352d";
                ctx.font = `600 ${Math.max(11, Math.min(15, whiteWidth * 0.34))}px sans-serif`;
                ctx.textAlign = "center";
                ctx.fillText(
                    KEY_LABELS[midi],
                    projectKeyboardX(flatLeft + whiteWidth / 2, width, 0.96),
                    height - 13,
                );
            }

            for (let midi = FIRST; midi <= LAST; midi += 1) {
                if (!isBlack(midi)) continue;
                const { x, w } = keyRect(midi, width);
                const blackDepth = 0.62;
                const blackHeight = whiteHeight * blackDepth;
                const nearScale =
                    KEYBOARD_FAR_SCALE + blackDepth * (1 - KEYBOARD_FAR_SCALE);
                const farLeft = projectKeyboardX(x, width, KEYBOARD_FAR_SCALE);
                const farRight = projectKeyboardX(
                    x + w,
                    width,
                    KEYBOARD_FAR_SCALE,
                );
                const nearLeft = projectKeyboardX(x, width, nearScale);
                const nearRight = projectKeyboardX(x + w, width, nearScale);
                const nearY = keyTop + blackHeight;
                const isPressed = pressedRef.current.has(midi);

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(nearLeft, nearY - 2);
                ctx.lineTo(nearRight, nearY - 2);
                ctx.lineTo(nearRight, nearY + 4);
                ctx.lineTo(nearLeft, nearY + 4);
                ctx.closePath();
                ctx.fillStyle = "#080b09";
                ctx.fill();

                const keyPoints = [
                    { x: farLeft, y: keyTop },
                    { x: farRight, y: keyTop },
                    { x: nearRight, y: nearY },
                    { x: nearLeft, y: nearY },
                ];
                traceRoundedPolygon(ctx, keyPoints, Math.min(3, w * 0.06));
                const keyGradient = ctx.createLinearGradient(
                    0,
                    keyTop,
                    0,
                    nearY,
                );
                keyGradient.addColorStop(0, isPressed ? "#717070" : "#191919");
                keyGradient.addColorStop(1, isPressed ? "#94918f" : "#606260");
                ctx.fillStyle = keyGradient;
                ctx.fill();
                ctx.strokeStyle = "rgba(0, 0, 0, 0.82)";
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(farLeft + 2, keyTop + 2);
                ctx.lineTo(farRight - 2, keyTop + 2);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();

                ctx.beginPath();
                ctx.fillStyle = "rgba(255, 255, 255, 0.76)";
                ctx.font = `600 ${Math.max(9, Math.min(12, w * 0.34))}px sans-serif`;
                ctx.textAlign = "center";
                ctx.fillText(
                    KEY_LABELS[midi],
                    projectKeyboardX(x + w / 2, width, nearScale),
                    nearY - 10,
                );
            }

            frame = requestAnimationFrame(draw);
        };

        frame = requestAnimationFrame(draw);

        const onKeyDown = (event: KeyboardEvent) => {
            if (pausedRef.current) return;
            const midi = KEY_MAP[event.code];
            if (midi === undefined) return;
            event.preventDefault();
            if (!event.repeat) pressNote(midi);
        };
        const onKeyUp = (event: KeyboardEvent) => {
            const midi = KEY_MAP[event.code];
            if (midi !== undefined) releaseNote(midi);
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        navigator
            .requestMIDIAccess?.()
            .then((access) => {
                if (disposed) return;
                access.inputs.forEach((input) => {
                    input.onmidimessage = (event) => {
                        if (!event.data) return;
                        const [status, midi, velocity] = event.data;
                        const command = status & 0xf0;
                        if (command === 0x90 && velocity > 0) pressNote(midi);
                        else if (command === 0x80 || command === 0x90)
                            releaseNote(midi);
                    };
                });
            })
            .catch(() => {});

        return () => {
            disposed = true;
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            void audioContextRef.current?.close();
            audioContextRef.current = null;
        };
    }, []);

    return (
        <section
            className="mx-auto box-border w-full max-w-[1000px] rounded-lg border border-[rgba(193,218,197,0.16)] bg-[radial-gradient(ellipse_at_50%_0%,rgba(78,117,91,0.2),transparent_62%),#101713] p-[22px] text-[#edf2e9] shadow-[0_24px_80px_rgba(0,0,0,0.28)] max-[600px]:my-3 max-[600px]:p-[13px]"
            aria-label="Piano Hero"
        >
            <div className="aspect-[16/10] w-full overflow-hidden rounded-[5px] border border-[rgba(193,218,197,0.15)] bg-[#101713]">
                <canvas
                    ref={canvasRef}
                    className="block h-full w-full touch-none"
                    aria-label="Piano interactif sur une octave, de Do4 à Do5"
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                />
            </div>
            <div className="mt-3 flex justify-center border-t border-[rgba(193,218,197,0.16)] pt-4">
                <button
                    type="button"
                    aria-pressed={isPaused}
                    onClick={isPaused ? onResume : onPause}
                    className="group relative flex min-h-24 w-full max-w-xl items-center justify-center gap-5 overflow-hidden rounded-3xl border-2 border-emerald-300/90 bg-emerald-950/40 px-10 py-6 text-emerald-100 shadow-[0_0_28px_rgba(52,211,153,.36)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:bg-emerald-900/45 hover:shadow-[0_0_45px_rgba(52,211,153,.48)] active:translate-y-0 active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                    <PauseIcon />
                    <span className="text-xl font-black uppercase tracking-wide sm:text-2xl">
                        {isPaused ? "Reprendre" : "Pause"}
                    </span>
                    <span className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </button>
            </div>
        </section>
    );
}
