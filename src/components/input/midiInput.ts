// components/song-piano/input/midiInput.ts

import type { PianoInputHandlers } from "./keyboardInput";

export async function attachMidiInput(
    handlers: PianoInputHandlers,
): Promise<() => void> {
    if (!navigator.requestMIDIAccess) {
        return () => {};
    }

    const access =
        await navigator.requestMIDIAccess();

    const inputs = Array.from(
        access.inputs.values(),
    );

    for (const input of inputs) {
        input.onmidimessage = (event) => {
            if (!event.data) {
                return;
            }

            const [status, midi, velocity] =
                event.data;

            const command = status & 0xf0;

            if (
                command === 0x90 &&
                velocity > 0
            ) {
                handlers.onPress(midi);
                return;
            }

            if (
                command === 0x80 ||
                command === 0x90
            ) {
                handlers.onRelease(midi);
            }
        };
    }

    return () => {
        for (const input of inputs) {
            input.onmidimessage = null;
        }
    };
}