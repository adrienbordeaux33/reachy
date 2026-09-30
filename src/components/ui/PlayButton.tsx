type PlayButtonProps = {
    onClick: () => void;
};

function PlayButton({ onClick }: PlayButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
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
            <span className="text-xl font-black uppercase tracking-wide sm:text-2xl">
                Jouer
            </span>

            <span className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </button>
    );
}

export default PlayButton;
