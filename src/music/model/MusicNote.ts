// music/model/MusicNote.ts

export interface MusicNote {
    /**
     * Numéro MIDI de la note.
     * C4 = 60, C#4 = 61, A4 = 69...
     */
    midi: number;

    /**
     * Instant où commence la note, en secondes.
     */
    startTime: number;

    /**
     * Durée pendant laquelle la note est jouée.
     */
    duration: number;

    /**
     * Intensité MIDI entre 0 et 127.
     * Optionnelle car non présente dans TXT
     */
    velocity?: number;
}