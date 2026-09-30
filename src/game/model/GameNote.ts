// game/model/GameNote.ts

export interface GameNote {
    id: string;

    /**
     * Note physique attendue.
     */
    midi: number;

    /**
     * Moment où le joueur doit la jouer.
     */
    hitTime: number;

    /**
     * Durée de maintien éventuelle.
     */
    duration: number;
}