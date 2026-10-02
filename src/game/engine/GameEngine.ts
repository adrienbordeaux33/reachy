import type {Beatmap} from "../model/BeatMap.ts";


export type GameStatus =
    | "idle"
    | "playing"
    | "paused"
    | "finished";

export type GameNoteStatus =
    | "pending"
    | "hit"
    | "missed";


export type HitRating =
    | "perfect"
    | "great"
    | "good";

export interface GameState {
    status: GameStatus;

    currentTime: number;

    score: number;

    combo: number;

    hits: number;

    misses: number;

    wrongHits: number;

    lastHitRating: HitRating | null;
}


export interface GameEngine {
    load(beatmap: Beatmap): void;

    start(): void;
    pause(): void;
    resume(): void;
    restart(): void;
    stop(): void;

    notePressed(
        midi: number,
        currentTime: number,
    ): void;

    noteReleased(
        midi: number,
        currentTime: number,
    ): void;

    update(currentTime: number): void;

    getState(): Readonly<GameState>;

    getNoteStatus(
        noteId: string,
    ): GameNoteStatus;
}
