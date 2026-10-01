import { useRef, useState } from "react";

import type { MusicSong } from "../music/model/MusicSong";
import type { Beatmap } from "../game/model/BeatMap";

import { TxtMusicParser } from "../music/parsers/TxtMusicParser";
import { MusicPlayer } from "../music/player/MusicPlayer";
import { BeatmapGenerator } from "../game/beatmap/BeatmapGenerator";

/**
 * Convertit temporairement une Beatmap en MusicSong
 * afin de pouvoir l'écouter avec MusicPlayer.
 *
 * MusicPlayer reste ainsi indépendant de la couche "game".
 */
function beatmapToMusicSong(
    beatmap: Beatmap,
): MusicSong {
    return {
        duration: beatmap.duration,

        notes: beatmap.notes.map((note) => ({
            midi: note.midi,
            startTime: note.hitTime,
            duration: note.duration,
        })),
    };
}

export default function MusicDebugPage() {
    const playerRef = useRef(new MusicPlayer());

    const [fileName, setFileName] = useState("");
    const [song, setSong] = useState<MusicSong | null>(null);
    const [beatmap, setBeatmap] = useState<Beatmap | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Lecture et parsing du fichier TXT.
     */
    const handleFile = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            setError(null);

            // Arrête le morceau précédent si nécessaire.
            playerRef.current.stop();

            const content = await file.text();

            const parser = new TxtMusicParser();
            const generator = new BeatmapGenerator();

            // TXT -> MusicSong
            const parsedSong = parser.parse(content);

            // MusicSong -> Beatmap
            const generatedBeatmap =
                generator.generate(parsedSong);

            setFileName(file.name);
            setSong(parsedSong);
            setBeatmap(generatedBeatmap);

            console.log("MusicSong");
            console.table(parsedSong.notes);

            console.log("Beatmap");
            console.table(generatedBeatmap.notes);
        } catch (caughtError) {
            setSong(null);
            setBeatmap(null);

            if (caughtError instanceof Error) {
                setError(caughtError.message);
            } else {
                setError(
                    "Une erreur inconnue est survenue.",
                );
            }
        }
    };

    /**
     * Joue les notes originales du fichier.
     */
    const handlePlayOriginal = async () => {
        if (!song) {
            return;
        }

        await playerRef.current.play(song);
    };

    /**
     * Joue les notes transformées par le BeatmapGenerator.
     */
    const handlePlayBeatmap = async () => {
        if (!beatmap) {
            return;
        }

        const playableSong =
            beatmapToMusicSong(beatmap);

        await playerRef.current.play(playableSong);
    };

    /**
     * Stoppe toute lecture.
     */
    const handleStop = () => {
        playerRef.current.stop();
    };

    return (
        <main className="p-8 text-white">
            <h1 className="mb-2 text-3xl font-bold">
                Music Debug
            </h1>

            <p className="mb-8 text-gray-400">
                Test du parser et du BeatmapGenerator
            </p>

            {/* Sélection du fichier */}
            <section className="mb-8">
                <input
                    type="file"
                    accept=".txt"
                    onChange={handleFile}
                />
            </section>

            {/* Erreur de parsing */}
            {error && (
                <div className="mb-8 rounded bg-red-900/50 p-4 text-red-200">
                    <strong>Erreur :</strong> {error}
                </div>
            )}

            {/* Informations sur le morceau */}
            {song && beatmap && (
                <>
                    <section className="mb-8 space-y-2">
                        <h2 className="text-xl font-semibold">
                            Informations
                        </h2>

                        <p>
                            Fichier :{" "}
                            <strong>{fileName}</strong>
                        </p>

                        <p>
                            Durée :{" "}
                            <strong>
                                {song.duration.toFixed(2)} s
                            </strong>
                        </p>

                        <p>
                            Notes originales :{" "}
                            <strong>
                                {song.notes.length}
                            </strong>
                        </p>

                        <p>
                            Notes dans la Beatmap :{" "}
                            <strong>
                                {beatmap.notes.length}
                            </strong>
                        </p>

                        <p>
                            Plage jouable :{" "}
                            <strong>
                                MIDI {beatmap.playableRange.min}
                                {" → "}
                                {beatmap.playableRange.max}
                            </strong>
                        </p>
                    </section>

                    {/* Contrôles audio */}
                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">
                            Écoute
                        </h2>

                        <div className="flex flex-wrap gap-4">
                            <button
                                type="button"
                                onClick={handlePlayOriginal}
                                className="
                  rounded
                  bg-green-600
                  px-6
                  py-3
                  font-semibold
                  hover:bg-green-500
                "
                            >
                                ▶ Original
                            </button>

                            <button
                                type="button"
                                onClick={handlePlayBeatmap}
                                className="
                  rounded
                  bg-blue-600
                  px-6
                  py-3
                  font-semibold
                  hover:bg-blue-500
                "
                            >
                                ▶ Beatmap C4-C5
                            </button>

                            <button
                                type="button"
                                onClick={handleStop}
                                className="
                  rounded
                  bg-red-600
                  px-6
                  py-3
                  font-semibold
                  hover:bg-red-500
                "
                            >
                                ■ Stop
                            </button>
                        </div>
                    </section>

                    {/* Aperçu de la Beatmap */}
                    <section>
                        <h2 className="mb-4 text-xl font-semibold">
                            Aperçu Beatmap
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="border-collapse text-left">
                                <thead>
                                <tr>
                                    <th className="border border-gray-700 px-4 py-2">
                                        ID
                                    </th>

                                    <th className="border border-gray-700 px-4 py-2">
                                        Original
                                    </th>

                                    <th className="border border-gray-700 px-4 py-2">
                                        Jouable
                                    </th>

                                    <th className="border border-gray-700 px-4 py-2">
                                        Hit time
                                    </th>

                                    <th className="border border-gray-700 px-4 py-2">
                                        Durée
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {beatmap.notes
                                    .slice(0, 20)
                                    .map((note) => (
                                        <tr key={note.id}>
                                            <td className="border border-gray-700 px-4 py-2">
                                                {note.id}
                                            </td>

                                            <td className="border border-gray-700 px-4 py-2">
                                                {note.originalMidi}
                                            </td>

                                            <td className="border border-gray-700 px-4 py-2">
                                                {note.midi}
                                            </td>

                                            <td className="border border-gray-700 px-4 py-2">
                                                {note.hitTime.toFixed(3)} s
                                            </td>

                                            <td className="border border-gray-700 px-4 py-2">
                                                {note.duration.toFixed(3)} s
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {beatmap.notes.length > 20 && (
                            <p className="mt-3 text-sm text-gray-400">
                                Affichage des 20 premières notes sur{" "}
                                {beatmap.notes.length}.
                            </p>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}