import type { Beatmap } from "../model/BeatMap.ts";
import type { GameNote } from "../model/GameNote.ts";

import {calculateHitScore} from "../scoring/scoreCalculator";

import type {
    GameEngine,
    GameState,
    GameNoteStatus
} from "./GameEngine.ts";

export type HitRating =
    | "perfect"
    | "great"
    | "good";

export interface HitResult {
    note: GameNote;
    rating: HitRating;
    timingError: number;
}

export interface GameEngineConfig {
    perfectWindow: number;
    greatWindow: number;
    goodWindow: number;
}

const DEFAULT_CONFIG: GameEngineConfig = {
    perfectWindow: 0.05,
    greatWindow: 0.1,
    goodWindow: 0.15,
};

const INITIAL_STATE: GameState = {
    status: "idle",
    currentTime: 0,
    score: 0,
    combo: 0,
    hits: 0,
    misses: 0,
};

export class DefaultGameEngine
    implements GameEngine
{
    private beatmap: Beatmap | null = null;

    private state: GameState = {
        ...INITIAL_STATE,
    };

    private readonly config: GameEngineConfig;

    private hitNoteIds = new Set<string>();

    private missedNoteIds = new Set<string>();

    constructor(
        config: GameEngineConfig = DEFAULT_CONFIG,
    ) {
        this.config = config;
    }

    load(beatmap: Beatmap): void {
        this.beatmap = beatmap;

        this.resetState();
    }

    start(): void {
        if (this.beatmap === null) {
            return;
        }

        this.state.status = "playing";
        this.state.currentTime = 0;
    }

    pause(): void {
        if (this.state.status !== "playing") {
            return;
        }

        this.state.status = "paused";
    }

    resume(): void {
        if (this.state.status !== "paused") {
            return;
        }

        this.state.status = "playing";
    }

    restart(): void {
        if (this.beatmap === null) {
            return;
        }

        this.resetState();
        this.state.status = "playing";
    }

    stop(): void {
        this.resetState();
    }

    notePressed(
        midi: number,
        currentTime: number,
    ): void {
        if (
            this.state.status !== "playing" ||
            this.beatmap === null
        ) {
            return;
        }

        const result =
            this.findHit(
                midi,
                currentTime,
            );

        if (result === null) {
            return;
        }

        const earnedScore =
            calculateHitScore(
                result.rating,
                this.state.combo,
            );

        this.hitNoteIds.add(
            result.note.id,
        );

        this.state.score +=
            earnedScore;

        this.state.hits += 1;
        this.state.combo += 1;

        console.log(
            result.rating,
            `+${earnedScore}`,
            `score: ${this.state.score}`,
            `combo: ${this.state.combo}`,
        );
    }

    noteReleased(
        _midi: number,
        _currentTime: number,
    ): void {
        // Rien pour l'instant.
        //
        // On pourra exploiter le release
        // plus tard pour les notes longues.
    }

    update(currentTime: number): void {
        if (
            this.state.status !== "playing" ||
            this.beatmap === null
        ) {
            return;
        }

        this.state.currentTime = currentTime;

        this.detectMisses(currentTime);

        const finishTime = this.beatmap.duration + this.config.goodWindow;

        if (currentTime >= finishTime) {
            this.state.status = "finished";
        }
    }

    getState(): Readonly<GameState> {
        return this.state;
    }

    private findHit(
        midi: number,
        currentTime: number,
    ): HitResult | null {
        if (this.beatmap === null) {
            return null;
        }

        let bestNote: GameNote | null =
            null;

        let bestTimingError = Infinity;

        for (
            const note
            of this.beatmap.notes
            ) {
            if (note.midi !== midi) {
                continue;
            }

            if (this.isResolved(note.id)) {
                continue;
            }

            const timingError =
                currentTime - note.hitTime;

            const absoluteError =
                Math.abs(timingError);

            if (
                absoluteError >
                this.config.goodWindow
            ) {
                continue;
            }

            if (
                absoluteError <
                Math.abs(bestTimingError)
            ) {
                bestNote = note;
                bestTimingError =
                    timingError;
            }
        }

        if (bestNote === null) {
            return null;
        }

        return {
            note: bestNote,
            rating: this.getRating(
                Math.abs(bestTimingError),
            ),
            timingError:
            bestTimingError,
        };
    }

    private detectMisses(
        currentTime: number,
    ): void {
        if (this.beatmap === null) {
            return;
        }

        for (
            const note
            of this.beatmap.notes
            ) {
            if (this.isResolved(note.id)) {
                continue;
            }

            const missTime =
                note.hitTime +
                this.config.goodWindow;

            if (currentTime <= missTime) {
                continue;
            }

            this.missedNoteIds.add(note.id);

            this.state.misses += 1;
            this.state.combo = 0;

            console.log(
                "miss",
                "midi:",
                note.midi,
            );
        }
    }

    private isResolved(
        noteId: string,
    ): boolean {
        return (
            this.hitNoteIds.has(noteId) ||
            this.missedNoteIds.has(noteId)
        );
    }

    private getRating(
        absoluteError: number,
    ): HitRating {
        if (
            absoluteError <=
            this.config.perfectWindow
        ) {
            return "perfect";
        }

        if (
            absoluteError <=
            this.config.greatWindow
        ) {
            return "great";
        }

        return "good";
    }

    private resetState(): void {
        this.hitNoteIds.clear();
        this.missedNoteIds.clear();

        this.state = {
            ...INITIAL_STATE,
        };
    }

    getNoteStatus(
        noteId: string,
    ): GameNoteStatus {
        if (this.hitNoteIds.has(noteId)) {
            return "hit";
        }

        if (this.missedNoteIds.has(noteId)) {
            return "missed";
        }

        return "pending";
    }
}