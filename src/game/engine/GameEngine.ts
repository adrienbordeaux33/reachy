import type {Beatmap} from "../model/BeatMap.ts";

export type GameStatus =
    | "idle"
    | "playing"
    | "paused"
    | "finished";

export interface GameState {
    status: GameStatus;

    currentTime: number;

    score: number;

    combo: number;

    hits: number;

    misses: number;
}


export interface GameEngine {
    load(beatmap: Beatmap): void;

    start(): void;

    pause(): void;

    resume(): void;

    restart(): void;

    stop(): void;

    /**
     * Note jouée par l'utilisateur.
     */
    notePressed(midi: number): void;

    noteReleased(midi: number): void;

    /**
     * Mise à jour du moteur.
     */
    update(currentTime: number): void;

    getState(): Readonly<GameState>;
}

