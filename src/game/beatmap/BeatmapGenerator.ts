// src/game/beatmap/BeatmapGenerator.ts

import type { MusicSong } from "../../music/model/MusicSong";
import type { Beatmap } from "../model/BeatMap";

import {
    PIANO_PLAYABLE_RANGE,
    type PlayableRange,
} from "./PlayableRange";

import { fitNoteToRange } from "./fitNoteToRange";

export class BeatmapGenerator {
    generate(
        song: MusicSong,
        range: PlayableRange = PIANO_PLAYABLE_RANGE,
    ): Beatmap {
        let previousMidi: number | undefined;

        const notes = song.notes.map((note, index) => {
            const playableMidi = fitNoteToRange(
                note.midi,
                range,
                previousMidi,
            );

            previousMidi = playableMidi;

            return {
                id: `note-${index}`,
                originalMidi: note.midi,
                midi: playableMidi,
                hitTime: note.startTime,
                duration: note.duration,
            };
        });

        return {
            duration: song.duration,

            playableRange: {
                ...range,
            },

            notes,
        };
    }
}