// components/song-piano/input/keyboardInput.ts

import { KEY_MAP } from "../config/pianoConfig";

export interface PianoInputHandlers {
    onPress: (midi: number) => void;
    onRelease: (midi: number) => void;
}

export function attachKeyboardInput(
    handlers: PianoInputHandlers,
): () => void {
    const handleKeyDown = (
        event: KeyboardEvent,
    ) => {
        const midi = KEY_MAP[event.code];

        if (midi === undefined) {
            return;
        }

        event.preventDefault();

        if (!event.repeat) {
            handlers.onPress(midi);
        }
    };

    const handleKeyUp = (
        event: KeyboardEvent,
    ) => {
        const midi = KEY_MAP[event.code];

        if (midi !== undefined) {
            handlers.onRelease(midi);
        }
    };

    window.addEventListener(
        "keydown",
        handleKeyDown,
    );

    window.addEventListener(
        "keyup",
        handleKeyUp,
    );

    return () => {
        window.removeEventListener(
            "keydown",
            handleKeyDown,
        );

        window.removeEventListener(
            "keyup",
            handleKeyUp,
        );
    };
}