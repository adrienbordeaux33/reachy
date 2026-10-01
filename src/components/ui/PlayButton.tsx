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
            flex min-h-28 w-full max-w-xl
            items-center justify-center gap-5
            overflow-hidden rounded-3xl
            border border-cyan-300/60
            bg-slate-950/75
            px-10 py-7
            shadow-[0_0_35px_rgba(34,211,238,.28),0_0_60px_rgba(217,70,239,.16)]
            backdrop-blur-xl
            transition-all duration-200
            hover:-translate-y-1
            hover:border-cyan-200/90
            hover:bg-slate-900/80
            hover:shadow-[0_0_45px_rgba(34,211,238,.38),0_0_75px_rgba(217,70,239,.25)]
            active:translate-y-0
            active:scale-[0.985]
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-white
        "
        >
            {/* Lueur colorée */}
            <span
                className="
                pointer-events-none
                absolute inset-0
                bg-gradient-to-r
                from-cyan-500/10
                via-transparent
                to-fuchsia-500/10
            "
            />

            {/* Icône play */}
            <span
                className="
                relative
                grid h-14 w-14 place-items-center
                rounded-2xl
                border border-cyan-300/40
                bg-cyan-400/10
                text-2xl text-cyan-200
                shadow-[0_0_20px_rgba(34,211,238,.25)]
                transition
                group-hover:bg-cyan-400/20
                group-hover:shadow-[0_0_28px_rgba(34,211,238,.4)]
            "
            >
                ▶
            </span>

            {/* Texte */}
            <span
                className="
                relative
                bg-gradient-to-r
                from-white via-cyan-100 to-fuchsia-200
                bg-clip-text
                text-3xl font-black uppercase
                tracking-[0.08em]
                text-transparent
                sm:text-4xl
            "
            >
                Jouer
            </span>

            {/* Reflet supérieur */}
            <span
                className="
                pointer-events-none
                absolute inset-x-16 top-0 h-px
                bg-gradient-to-r
                from-transparent via-white/70 to-transparent
            "
            />
        </button>
    );
}

export default PlayButton;
