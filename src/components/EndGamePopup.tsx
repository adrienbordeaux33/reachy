import concertBackground from "../assets/fond.png";
import type {PlayMode} from "../game/model/PlayMode.ts";

interface EndGamePopupProps {
    playMode: PlayMode;
    score?: number;
    successRate?: number;
    onRestart?: () => void;
    onQuit?: () => void;
}

export function EndGamePopup({
    playMode,
    score = 236,
    successRate = 85,
    onRestart = () => {},
    onQuit = () => {},
}: EndGamePopupProps) {
    return (
        <main className="relative isolate min-h-screen overflow-hidden text-white">
            {/* Background */}
            <div
                className="absolute inset-0 -z-20 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${concertBackground})`,
                }}
            />

            {/* Atmosphère néon */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,.28),transparent_28%),radial-gradient(circle_at_82%_15%,rgba(217,70,239,.24),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,.18),transparent_34%)]" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle,transparent_35%,rgba(0,0,0,.68)_100%)]" />

            {/* Décoration haut gauche */}
            <div className="pointer-events-none absolute left-5 top-5 hidden gap-2 md:flex">
                <span className="h-1.5 w-24 rotate-[-32deg] rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,.8)]" />
                <span className="h-1.5 w-20 rotate-[-32deg] rounded-full bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,.8)]" />
                <span className="h-1.5 w-16 rotate-[-32deg] rounded-full bg-fuchsia-500 shadow-[0_0_18px_rgba(217,70,239,.8)]" />
            </div>

            {/* Décoration bas droite */}
            <div className="pointer-events-none absolute bottom-6 right-5 hidden gap-2 md:flex">
                <span className="h-1.5 w-20 rotate-[-32deg] rounded-full bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,.8)]" />
                <span className="h-1.5 w-28 rotate-[-32deg] rounded-full bg-fuchsia-500 shadow-[0_0_18px_rgba(217,70,239,.8)]" />
                <span className="h-1.5 w-12 rotate-[-32deg] rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,.8)]" />
            </div>

            <section className="flex min-h-screen items-center justify-center p-5 sm:p-8">
                <div className="relative w-full max-w-4xl">
                    {/* Glow externe */}
                    <div className="absolute -inset-2 -z-10 rounded-[2rem] bg-[linear-gradient(110deg,rgba(59,130,246,.30),rgba(217,70,239,.18),rgba(244,63,94,.30))] blur-3xl" />

                    <div className="relative overflow-hidden rounded-[2rem] border border-blue-300/20 bg-slate-900/80 px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.1)] backdrop-blur-xl sm:px-10 sm:py-10 md:px-14">
                        {/* Header accent */}
                        <div className="mx-auto mb-4 flex items-center justify-center gap-4">
                            <div className="h-px w-16 bg-gradient-to-r from-transparent via-cyan-400 to-fuchsia-500" />
                            <div className="flex gap-1.5">
                                <span className="h-7 w-2 rounded-full bg-fuchsia-500 shadow-[0_0_14px_rgba(217,70,239,.8)]" />
                                <span className="h-7 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,.8)]" />
                            </div>
                            <div className="h-px w-16 bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-transparent" />
                        </div>

                        {/* Title */}
                        <div className="text-center">
                            <h1 className="inline-block bg-gradient-to-r from-white via-cyan-100 to-fuchsia-200 bg-clip-text text-4xl font-black italic tracking-[-0.045em] text-transparent drop-shadow-[0_0_18px_rgba(255,255,255,.18)] sm:text-6xl md:text-7xl">
                                {playMode === "play"
                                    ? "DÉFI TERMINÉ !"
                                    : "LECTURE TERMINÉE !"}
                            </h1>

                            <div className="mx-auto mt-1 h-2 max-w-xl -rotate-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 opacity-95" />
                        </div>

                        {/* Stats */}
                        {playMode === "play" && (
                            <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-5 text-center sm:flex-row sm:gap-8">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-lg font-extrabold uppercase tracking-wide text-slate-100 sm:text-xl">
                                            Score :
                                        </span>
                                        <span className="text-3xl font-black text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,.45)] sm:text-4xl">
                                            {score}
                                        </span>
                                    </div>

                                    <div className="hidden h-10 w-px bg-gradient-to-b from-transparent via-fuchsia-400/80 to-transparent sm:block" />

                                    <div className="flex items-baseline gap-3">
                                        <span className="text-lg font-extrabold uppercase tracking-wide text-slate-100 sm:text-xl">
                                            Réussite :
                                        </span>
                                        <span className="text-3xl font-black text-fuchsia-300 drop-shadow-[0_0_12px_rgba(217,70,239,.45)] sm:text-4xl">
                                            {successRate} %
                                        </span>
                                    </div>
                                </div>
                            )}

                        {/* Actions */}
                        <div className="mx-auto mt-10 grid max-w-3xl gap-5 md:grid-cols-2">
                            <button
                                type="button"
                                onClick={onRestart}
                                className="group relative flex min-h-24 items-center justify-center gap-4 overflow-hidden rounded-3xl border border-cyan-400/80 bg-slate-950/45 px-7 py-5 shadow-[0_0_28px_rgba(34,211,238,.28)] backdrop-blur-xl transition duration-150 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                            >
                                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-300/40 bg-cyan-400/10 text-cyan-100">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M3 12a9 9 0 1 0 3-6.7" />
                                        <path d="M3 4v6h6" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold sm:text-xl">
                                    Recommencer
                                </span>
                                <span className="ml-1 text-cyan-300 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                                    →
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={onQuit}
                                className="group relative flex min-h-24 items-center justify-center gap-4 overflow-hidden rounded-3xl border border-rose-400/80 bg-rose-950/35 px-7 py-5 shadow-[0_0_28px_rgba(244,63,94,.34)] backdrop-blur-xl transition duration-150 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                            >
                                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-rose-300/40 bg-rose-400/10 text-rose-100">
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
                                <span className="text-lg font-bold sm:text-xl">
                                    Quitter
                                </span>
                                <span className="ml-1 text-rose-300 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                                    →
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
