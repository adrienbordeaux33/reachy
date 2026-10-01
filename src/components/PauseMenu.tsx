import { useEffect } from "react";

interface PauseMenuProps {
    onResume: () => void;
    onRestart: () => void;
    onChangeInstrument: () => void;
    onQuit: () => void;
}

export function PauseMenu({
    onResume,
    onRestart,
    onChangeInstrument,
    onQuit,
}: PauseMenuProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onResume();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onResume]);

    return (
        <main className="fixed inset-0 z-50 isolate overflow-auto bg-black/60 text-white backdrop-blur-sm">
            {" "}
            {/* Atmosphère */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,.28),transparent_28%),radial-gradient(circle_at_82%_15%,rgba(217,70,239,.24),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,.18),transparent_34%)]" />
            {/* Vignette */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle,transparent_35%,rgba(0,0,0,.68)_100%)]" />
            {/* Décor haut gauche */}
            <div className="pointer-events-none absolute left-5 top-5 hidden gap-2 md:flex">
                <span className="h-1.5 w-24 rotate-[-32deg] rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,.8)]" />
                <span className="h-1.5 w-20 rotate-[-32deg] rounded-full bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,.8)]" />
                <span className="h-1.5 w-16 rotate-[-32deg] rounded-full bg-fuchsia-500 shadow-[0_0_18px_rgba(217,70,239,.8)]" />
            </div>
            {/* Décor bas droite */}
            <div className="pointer-events-none absolute bottom-6 right-5 hidden gap-2 md:flex">
                <span className="h-1.5 w-20 rotate-[-32deg] rounded-full bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,.8)]" />
                <span className="h-1.5 w-28 rotate-[-32deg] rounded-full bg-fuchsia-500 shadow-[0_0_18px_rgba(217,70,239,.8)]" />
                <span className="h-1.5 w-12 rotate-[-32deg] rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,.8)]" />
            </div>
            {/* Modal */}
            <section className="flex min-h-screen items-center justify-center p-5 sm:p-8">
                <div className="relative w-full max-w-4xl">
                    {/* Glow externe */}
                    <div className="absolute -inset-2 -z-10 rounded-[2rem] bg-[linear-gradient(110deg,rgba(59,130,246,.30),rgba(217,70,239,.18),rgba(244,63,94,.30))] blur-3xl" />

                    <div className="relative overflow-hidden rounded-[2rem] border border-blue-300/20 bg-slate-900/80 px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.1)] backdrop-blur-xl sm:px-10 sm:py-10 md:px-14">
                        {/* Header décor */}
                        <div className="mx-auto mb-5 flex items-center justify-center gap-4">
                            <div className="h-px w-16 bg-gradient-to-r from-transparent via-cyan-400 to-fuchsia-500" />

                            <div className="flex gap-1.5">
                                <span className="h-7 w-2 rounded-full bg-fuchsia-500 shadow-[0_0_14px_rgba(217,70,239,.8)]" />
                                <span className="h-7 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,.8)]" />
                            </div>

                            <div className="h-px w-16 bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-transparent" />
                        </div>

                        {/* Title */}
                        <div className="text-center">
                            <h1 className="inline-block bg-gradient-to-r from-white via-cyan-100 to-fuchsia-200 bg-clip-text text-5xl font-black italic tracking-[-0.04em] text-transparent drop-shadow-[0_0_18px_rgba(255,255,255,.16)] sm:text-6xl md:text-7xl">
                                PAUSE
                            </h1>

                            <div className="mx-auto mt-1 h-2 max-w-xs -rotate-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 opacity-90" />

                            <p className="mt-5 text-sm font-medium uppercase tracking-[0.28em] text-slate-300/70">
                                La musique est en pause
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mx-auto mt-10 grid max-w-3xl gap-5 md:grid-cols-2">
                            {/* Recommencer */}
                            <button
                                type="button"
                                onClick={onRestart}
                                className="
                  group relative flex min-h-28 items-center gap-5
                  overflow-hidden rounded-3xl
                  border border-blue-400/70
                  bg-slate-950/45 px-7 py-5 text-left
                  shadow-[0_0_28px_rgba(59,130,246,.30)]
                  backdrop-blur-xl
                  transition duration-150
                  hover:-translate-y-0.5
                  hover:brightness-110
                  active:scale-[0.985]
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white
                  cursor-pointer
                "
                            >
                                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-blue-300/40 bg-blue-500/15 text-blue-200">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-7 w-7"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M3 12a9 9 0 1 0 3-6.7" />
                                        <path d="M3 4v6h6" />
                                    </svg>
                                </div>

                                <div>
                                    <span className="block text-lg font-bold sm:text-xl">
                                        Recommencer
                                    </span>
                                    <span className="mt-1 block text-sm text-slate-300/65">
                                        Repartir depuis le début
                                    </span>
                                </div>

                                <div className="ml-auto opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                                    →
                                </div>
                            </button>

                            {/* Instrument */}
                            <button
                                type="button"
                                onClick={onChangeInstrument}
                                className="
                  group relative flex min-h-28 items-center gap-5
                  overflow-hidden rounded-3xl
                  border border-amber-300/70
                  bg-slate-950/45 px-7 py-5 text-left
                  shadow-[0_0_28px_rgba(245,158,11,.30)]
                  backdrop-blur-xl
                  transition duration-150
                  hover:-translate-y-0.5
                  hover:brightness-110
                  active:scale-[0.985]
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white
                  cursor-pointer
                "
                            >
                                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-amber-300/40 bg-amber-400/10 text-amber-200">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-7 w-7"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M4 6h16M4 12h16M4 18h16" />
                                        <circle cx="8" cy="6" r="2" />
                                        <circle cx="15" cy="12" r="2" />
                                        <circle cx="10" cy="18" r="2" />
                                    </svg>
                                </div>

                                <div>
                                    <span className="block text-lg font-bold sm:text-xl">
                                        Changer d'instrument
                                    </span>
                                    <span className="mt-1 block text-sm text-slate-300/65">
                                        Modifier le contrôleur
                                    </span>
                                </div>

                                <div className="ml-auto opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                                    →
                                </div>
                            </button>

                            {/* Quitter */}
                            <button
                                type="button"
                                onClick={onQuit}
                                className="
                  group relative mx-auto flex min-h-24 w-full max-w-xl
                  items-center justify-center gap-4
                  overflow-hidden rounded-3xl
                  border border-rose-400/80
                  bg-rose-950/35 px-8 py-5
                  shadow-[0_0_28px_rgba(244,63,94,.34)]
                  backdrop-blur-xl
                  transition duration-150
                  hover:-translate-y-0.5
                  hover:brightness-110
                  active:scale-[0.985]
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white
                  md:col-span-2
                  cursor-pointer
                "
                            >
                                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-rose-300/40 bg-rose-400/10 text-rose-100">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M10 17l5-5-5-5" />
                                        <path d="M15 12H3" />
                                        <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
                                    </svg>
                                </div>

                                <div className="text-left">
                                    <span className="block text-lg font-bold sm:text-xl">
                                        {" "}
                                        Quitter{" "}
                                    </span>
                                    <span className="mt-1 block text-sm text-rose-100/60">
                                        Retourner au menu principal
                                    </span>
                                </div>
                            </button>
                        </div>

                        {/* Hint */}
                        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-slate-300/50">
                            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
                                {" "}
                                ESC{" "}
                            </span>
                            <span>pour reprendre</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
