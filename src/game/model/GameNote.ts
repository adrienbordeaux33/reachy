// src/game/model/GameNote.ts

export interface GameNote {
    /**
     * Identifiant unique dans la beatmap.
     */
    id: string;

    /**
     * Note MIDI présente dans le fichier original.
     */
    originalMidi: number;

    /**
     * Note MIDI que le joueur doit réellement jouer.
     */
    midi: number;

    /**
     * Instant exact où la note doit être frappée,
     * en secondes depuis le début du morceau.
     */
    hitTime: number;

    /**
     * Durée de la note.
     */
    duration: number;
}