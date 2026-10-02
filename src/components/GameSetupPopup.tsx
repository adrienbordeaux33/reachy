import { useEffect, useState } from "react";

import { InstrumentSelector } from "./InstrumentSelector.tsx";
import { SelectionButton } from "./SelectionButton.tsx";
import { NeonDecoration } from "./NeonDecoration";
import { MusicIcon, PlayIcon, SlidersIcon } from "./icons.tsx";

import { TxtMusicParser } from "../music/parsers/TxtMusicParser";
import type { MusicSong } from "../music/model/MusicSong";
import { SONG_LIBRARY, type SongId } from "../music/library/SongLibrary.ts";

type MusicMode = "upload" | "library" | "free";
type Instrument = "piano" | "guitar" | "bass";

interface GameSetupPopupProps {
    onStart: (
        musicMode: MusicMode,
        instrument: Instrument,
        songId?: SongId,
        uploadedSong?: MusicSong,
    ) => void;
    onClose: () => void;
}

export function GameSetupPopup({ onStart, onClose }: GameSetupPopupProps) {
    const [musicMode, setMusicMode] = useState<MusicMode>("upload");
    const [songId, setSongId] = useState<SongId>("mario");
    const [instrument, setInstrument] = useState<Instrument>("piano");
    const [uploadedSong, setUploadedSong] = useState<MusicSong | null>(null);

    const handleUploadedFile = async (file: File | null) => {
        setUploadedSong(null);

        if (!file) return;

        try {
            const content = await file.text();

            const parser = new TxtMusicParser();
            const song = parser.parse(content);

            setUploadedSong({
                ...song,
                title: file.name.replace(/\.txt$/i, ""),
            });

            console.log("Morceau chargé :", song);
        } catch (error) {
            console.error("Impossible de charger le morceau :", error);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/60 text-white backdrop-blur-sm">
            {/* Atmosphère néon */}
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,.22),transparent_28%),radial-gradient(circle_at_82%_15%,rgba(217,70,239,.22),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,.14),transparent_34%)]" />

            {/* Vignette */}
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle,transparent_38%,rgba(0,0,0,.62)_100%)]" />

            {/* Décoration haut gauche */}
            <NeonDecoration className="left-5 top-5" />

            {/* Décoration bas droite */}
            <NeonDecoration className="bottom-6 right-5 rotate-180" />

            {/* Popup */}
            <section className="flex min-h-screen items-center justify-center p-5 sm:p-8">
                <div className="relative w-full max-w-6xl">
                    {/* Glow extérieur */}
                    <div className="absolute -inset-3 -z-10 rounded-[2.5rem] blur-3xl" />

                    <div
                        className="
              relative overflow-hidden
              rounded-[2.5rem]
              border border-cyan-300/30
              bg-slate-950/75
              px-6 py-8
              shadow-[0_30px_90px_rgba(0,0,0,.55),0_0_50px_rgba(34,211,238,.10),inset_0_1px_0_rgba(255,255,255,.1)]
              backdrop-blur-2xl
              sm:px-10
              md:px-14
            "
                    >
                        {/* Bordure colorée */}
                        <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] border-2 border-transparent [mask-composite:exclude]" />

                        {/* Accent haut */}
                        <div className="mb-8 flex items-center justify-center gap-4">
                            <div className="h-px w-20 bg-gradient-to-r from-transparent via-cyan-400 to-fuchsia-500" />

                            <div className="flex gap-1.5">
                                <span className="h-8 w-2 rounded-full bg-fuchsia-500 shadow-[0_0_14px_rgba(217,70,239,.9)]" />
                                <span className="h-8 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,.9)]" />
                            </div>

                            <div className="h-px w-20 bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-transparent" />
                        </div>

                        {/* Choix musique */}
                        <div className="grid items-start gap-5 md:grid-cols-3">
                            <SelectionButton
                                active={musicMode === "upload"}
                                variant="cyan"
                                icon={<MusicIcon />}
                                onClick={() => setMusicMode("upload")}
                            >
                                Charger
                                <br />
                                ma musique
                            </SelectionButton>

                            <SelectionButton
                                active={musicMode === "library"}
                                variant="purple"
                                icon={<MusicIcon />}
                                onClick={() => setMusicMode("library")}
                            >
                                Choisir
                                <br />
                                un morceau
                            </SelectionButton>

                            <SelectionButton
                                active={musicMode === "free"}
                                variant="pink"
                                icon={<SlidersIcon />}
                                onClick={() => setMusicMode("free")}
                            >
                                Mode libre
                            </SelectionButton>
                        </div>

                        {/* Options du mode sélectionné */}
                        <div className="mt-3 min-h-[58px]">
                            {musicMode === "upload" && (
                                <div className="grid gap-5 md:grid-cols-3">
                                    <input
                                        type="file"
                                        accept=".txt,text/plain"
                                        onChange={(event) => {
                                            const file =
                                                event.target.files?.[0] ?? null;
                                            void handleUploadedFile(file);
                                        }}
                                        className="
                      w-full rounded-xl
                      border border-cyan-400/40
                      bg-slate-950/80
                      px-4 py-3
                      text-sm text-white
                      outline-none
                      file:mr-4
                      file:rounded-lg
                      file:border-0
                      file:bg-cyan-400/15
                      file:px-3
                      file:py-2
                      file:font-semibold
                      file:text-cyan-200
                      hover:file:bg-cyan-400/25
                    "
                                    />
                                </div>
                            )}

                            {musicMode === "library" && (
                                <div className="grid gap-5 md:grid-cols-3">
                                    <div />

                                    <select
                                        value={songId}
                                        onChange={(event) =>
                                            setSongId(
                                                event.target.value as SongId,
                                            )
                                        }
                                        className="
                      w-full rounded-xl
                      border border-purple-400/40
                      bg-slate-950/80
                      px-4 py-3
                      text-white
                      outline-none
                      focus:border-purple-300
                    "
                                    >
                                        {Object.values(SONG_LIBRARY).map(
                                            (song) => (
                                                <option
                                                    key={song.id}
                                                    value={song.id}
                                                >
                                                    {song.title}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Séparateur Instrument */}
                        <div className="my-9 flex items-center justify-center gap-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/80 to-fuchsia-500/60" />

                            <h2 className="text-xl font-black uppercase tracking-[0.12em] text-white sm:text-2xl">
                                Instrument
                            </h2>

                            <div className="h-px flex-1 bg-gradient-to-r from-fuchsia-500/60 via-cyan-400/80 to-transparent" />
                        </div>

                        {/* Instruments */}
                        <InstrumentSelector
                            value={instrument}
                            onChange={setInstrument}
                        />

                        {/* CTA */}
                        <div className="mt-10 flex justify-center">
                            <button
                                type="button"
                                onClick={() =>
                                    onStart(
                                        musicMode,
                                        instrument,
                                        musicMode === "library"
                                            ? songId
                                            : undefined,
                                        musicMode === "upload"
                                            ? (uploadedSong ?? undefined)
                                            : undefined,
                                    )
                                }
                                className="
                  group relative
                  flex min-h-24 w-full max-w-xl
                  items-center justify-center gap-5
                  overflow-hidden rounded-3xl
                  border-2 border-emerald-300/90
                  bg-emerald-950/40
                  px-10 py-6
                  shadow-[0_0_28px_rgba(52,211,153,.36)]
                  backdrop-blur-xl
                  transition-all duration-200
                  hover:-translate-y-1
                  hover:bg-emerald-900/45
                  hover:shadow-[0_0_45px_rgba(52,211,153,.48)]
                  active:translate-y-0
                  active:scale-[0.985]
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white
                "
                            >
                                <PlayIcon />

                                <span className="text-xl font-black uppercase tracking-wide sm:text-2xl">
                                    Commencer
                                </span>

                                {/* Reflet */}
                                <span className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                            </button>
                        </div>

                        {/* Raccourci Escape */}
                        <div className="mt-8 flex items-center justify-center gap-4 pt-6">
                            <kbd className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/50">
                                ESC
                            </kbd>

                            <span className="text-sm text-white/50">
                                pour fermer
                            </span>
                        </div>

                        {/* Décoration interne */}
                        <div className="pointer-events-none absolute bottom-8 right-10 hidden rotate-[-32deg] gap-2 lg:flex">
                            <span className="h-1 w-20 rounded-full bg-violet-500" />
                            <span className="h-1 w-16 rounded-full bg-blue-500" />
                            <span className="h-1 w-12 rounded-full bg-cyan-400" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
