type PlayMode = "listen" | "play";

interface MediaPlayerProps {
    playMode: PlayMode;
    tempo: number;
    onPlayModeChange: (mode: PlayMode) => void;
    onTempoChange: (tempo: number) => void;
    onPause: () => void;
}

const TEMPOS = [50, 75, 100, 125, 150];

export function MediaPlayer({
    playMode,
    tempo,
    onPlayModeChange,
    onTempoChange,
    onPause,
}: MediaPlayerProps) {
    const decreaseTempo = () => {
        const currentIndex = TEMPOS.indexOf(tempo);

        if (currentIndex > 0) {
            onTempoChange(TEMPOS[currentIndex - 1]);
        }
    };

    const increaseTempo = () => {
        const currentIndex = TEMPOS.indexOf(tempo);

        if (currentIndex < TEMPOS.length - 1) {
            onTempoChange(TEMPOS[currentIndex + 1]);
        }
    };

    return (
        <div
            className="
        mx-auto flex w-full max-w-[1000px]
        items-center justify-between
        gap-6
        rounded-2xl
        border border-white/20
        bg-slate-950/70
        px-6 py-4
        text-white
        backdrop-blur-xl
      "
        >
            {/* MODE */}
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

            {/* TEMPO */}
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

                <span className="w-14 text-center font-bold">{tempo} %</span>

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

            {/* PAUSE */}
            <button
                type="button"
                onClick={onPause}
                className="
          rounded-xl
          border border-emerald-300/70
          bg-emerald-950/40
          px-6 py-3
          font-bold
          uppercase
          tracking-wide
          text-emerald-100
          transition
          hover:bg-emerald-900/60
        "
            >
                Pause
            </button>
        </div>
    );
}
