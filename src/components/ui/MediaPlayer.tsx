import type { PlayMode } from "../../game/model/PlayMode.ts";

interface MediaPlayerProps {
    playMode?: PlayMode;
    tempo?: number;
    hasStarted?: boolean;
    isPaused?: boolean;
    onPlayModeChange?: (mode: PlayMode) => void;
    onTempoChange?: (tempo: number) => void;
    onPlay?: () => void;
    onPause: () => void;
}

const TEMPOS = [50, 75, 100, 125, 150];

export function MediaPlayer({
    playMode,
    tempo,
    hasStarted = false,
    isPaused = false,
    onPlayModeChange,
    onTempoChange,
    onPlay,
    onPause,
}: MediaPlayerProps) {
    const isFreeMode = playMode === undefined && tempo === undefined;
    const showPauseButton = isFreeMode || (hasStarted && !isPaused);
    const decreaseTempo = () => {
        if (tempo === undefined || !onTempoChange) return;

        const currentIndex = TEMPOS.indexOf(tempo);

        if (currentIndex > 0) {
            onTempoChange(TEMPOS[currentIndex - 1]);
        }
    };

    const increaseTempo = () => {
        if (tempo === undefined || !onTempoChange) return;

        const currentIndex = TEMPOS.indexOf(tempo);

        if (currentIndex < TEMPOS.length - 1) {
            onTempoChange(TEMPOS[currentIndex + 1]);
        }
    };

    return (
        <div
            className={`
        mx-auto flex w-full max-w-[1000px]
        items-center
        ${isFreeMode ? "justify-center" : "justify-between"}
        gap-6
        rounded-2xl
        border border-white/20
        bg-slate-950/70
        px-6 py-4
        text-white
        backdrop-blur-xl
    `}
        >
            {/* MODE */}
            {playMode !== undefined && onPlayModeChange && (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold uppercase tracking-wide text-white/60">
                            Mode
                        </span>

                        <div className="flex rounded-xl bg-white/10 p-1">
                            <button
                                type="button"
                                onClick={() => onPlayModeChange("listen")}
                                className={`
              rounded-lg px-4 py-2 font-semibold transition
              ${
                  playMode === "listen"
                      ? "bg-cyan-500 text-white"
                      : "text-white/60 hover:text-white"
              }
            `}
                            >
                                Lecture
                            </button>

                            <button
                                type="button"
                                onClick={() => onPlayModeChange("play")}
                                className={`
              rounded-lg px-4 py-2 font-semibold transition
              ${
                  playMode === "play"
                      ? "bg-fuchsia-500 text-white"
                      : "text-white/60 hover:text-white"
              }
            `}
                            >
                                Jeu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TEMPO */}
            {tempo !== undefined && onTempoChange && (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold uppercase tracking-wide text-white/60">
                            Tempo
                        </span>

                        <button
                            type="button"
                            onClick={decreaseTempo}
                            disabled={tempo === TEMPOS[0]}
                            className="
            h-10 w-10 rounded-lg
            bg-white/10
            text-xl font-bold
            transition
            hover:bg-white/20
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
                        >
                            −
                        </button>

                        <span className="w-14 text-center font-bold">
                            {tempo} %
                        </span>

                        <button
                            type="button"
                            onClick={increaseTempo}
                            disabled={tempo === TEMPOS[TEMPOS.length - 1]}
                            className="
            h-10 w-10 rounded-lg
            bg-white/10
            text-xl font-bold
            transition
            hover:bg-white/20
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
                        >
                            +
                        </button>
                    </div>
                </div>
            )}

            {/* PAUSE */}
            <button
                type="button"
                onClick={showPauseButton ? onPause : onPlay}
                className={`
    rounded-xl
    border
    px-6 py-3
    font-bold
    uppercase
    tracking-wide
    transition
    ${
        showPauseButton
            ? `
            border-amber-300/60
            bg-amber-400/10
            text-amber-200
            shadow-[0_0_18px_rgba(251,191,36,.12)]
            hover:border-amber-300/80
            hover:bg-amber-400/15
            hover:shadow-[0_0_22px_rgba(251,191,36,.20)]
          `
            : `
            border-emerald-300/60
            bg-emerald-400/10
            text-emerald-200
            shadow-[0_0_18px_rgba(52,211,153,.12)]
            hover:border-emerald-300/80
            hover:bg-emerald-400/15
            hover:shadow-[0_0_22px_rgba(52,211,153,.20)]
          `
    }
`}
            >
                {showPauseButton ? "Pause" : "Jouer"}
            </button>
        </div>
    );
}
