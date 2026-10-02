import concertBackground from "../assets/fond.png";
import type { PlayMode } from "../game/model/PlayMode.ts";

interface EndGamePopupProps {
    playMode: PlayMode;
    score?: number;
    successRate?: number;
    hits?: number;
    misses?: number;
    wrongHits?: number;
    onRestart?: () => void;
    onQuit?: () => void;
}

export function EndGamePopup({
    playMode,
    score = 0,
    successRate = 0,
    hits = 0,
    misses = 0,
    wrongHits = 0,
    onRestart = () => {},
    onQuit = () => {},
}: EndGamePopupProps) {
    const performance =
        successRate === 100
            ? "PERFECT !"
            : successRate >= 90
              ? "EXCELLENT !"
              : successRate >= 75
                ? "SUPER !"
                : successRate >= 50
                  ? "BIEN JOUÉ !"
                  : "CONTINUE !";

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
                        {/* Résultats */}
                        {playMode === "play" && (
                            <div className="mx-auto mt-7 max-w-3xl">
                                {/* SCORE + PRÉCISION */}
                                <div className="flex items-center justify-center gap-10">
                                    {/* SCORE */}
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200/50">
                                            Score final
                                        </div>

                                        <div className="result-pop mt-1 text-5xl font-black text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,.65)]">
                                            {score.toLocaleString()}
                                        </div>

                                        <div className="mt-2 text-lg font-black italic tracking-wide text-fuchsia-300 drop-shadow-[0_0_10px_rgba(217,70,239,.45)]">
                                            {performance}
                                        </div>
                                    </div>

                                    {/* ANNEAU RÉUSSITE */}
                                    <div
                                        className="result-pop relative grid h-32 w-32 shrink-0 place-items-center rounded-full p-[7px]
                           shadow-[0_0_30px_rgba(217,70,239,.22)]"
                                        style={{
                                            background: `conic-gradient(
                        rgb(34 211 238) 0%,
                        rgb(217 70 239) ${successRate}%,
                        rgba(255,255,255,.08) ${successRate}%,
                        rgba(255,255,255,.08) 100%
                    )`,
                                        }}
                                    >
                                        <div className="grid h-full w-full place-items-center rounded-full border border-white/10 bg-slate-950/95">
                                            <div className="text-center">
                                                <div className="text-3xl font-black text-white">
                                                    {successRate}%
                                                </div>

                                                <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40">
                                                    Réussite
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* DÉTAIL DES PERFORMANCES */}
                                <div className="mx-auto mt-7 grid max-w-xl grid-cols-3 gap-3">
                                    {/* HITS */}
                                    <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/5 px-4 py-3 text-center backdrop-blur-md">
                                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-200/50">
                                            Hits
                                        </div>

                                        <div className="mt-1 text-2xl font-black text-emerald-300 drop-shadow-[0_0_10px_rgba(110,231,183,.35)]">
                                            {hits}
                                        </div>
                                    </div>

                                    {/* MISS */}
                                    <div className="rounded-2xl border border-rose-400/25 bg-rose-400/5 px-4 py-3 text-center backdrop-blur-md">
                                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-rose-200/50">
                                            Miss
                                        </div>

                                        <div className="mt-1 text-2xl font-black text-rose-300 drop-shadow-[0_0_10px_rgba(251,113,133,.35)]">
                                            {misses}
                                        </div>
                                    </div>

                                    {/* WRONG */}
                                    <div className="rounded-2xl border border-amber-400/25 bg-amber-400/5 px-4 py-3 text-center backdrop-blur-md">
                                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-200/50">
                                            Fausses notes
                                        </div>

                                        <div className="mt-1 text-2xl font-black text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,.35)]">
                                            {wrongHits}
                                        </div>
                                    </div>
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
