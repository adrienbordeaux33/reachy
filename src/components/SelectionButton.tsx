
/* -------------------------------------------------------------------------- */
/*                               UI COMPONENTS                                */
/* -------------------------------------------------------------------------- */

interface SelectionButtonProps {
    active: boolean;
    variant: "cyan" | "purple" | "pink";
    icon: React.ReactNode;
    children: React.ReactNode;
    onClick: () => void;
}


export function SelectionButton({
                             active,
                             variant,
                             icon,
                             children,
                             onClick,
                         }: SelectionButtonProps) {
    const variants = {
        cyan: {
            border: "border-cyan-400/80",
            background: "bg-cyan-950/25",
            shadow: "shadow-[0_0_26px_rgba(34,211,238,.30)]",
            active:
                "bg-cyan-900/45 shadow-[0_0_40px_rgba(34,211,238,.50)]",
            icon: "text-cyan-100",
        },

        purple: {
            border: "border-fuchsia-400/80",
            background: "bg-violet-950/25",
            shadow: "shadow-[0_0_26px_rgba(217,70,239,.30)]",
            active:
                "bg-violet-900/45 shadow-[0_0_40px_rgba(217,70,239,.50)]",
            icon: "text-fuchsia-100",
        },

        pink: {
            border: "border-pink-400/80",
            background: "bg-pink-950/25",
            shadow: "shadow-[0_0_26px_rgba(244,63,94,.30)]",
            active:
                "bg-pink-900/45 shadow-[0_0_40px_rgba(244,63,94,.50)]",
            icon: "text-pink-100",
        },
    };

    const style = variants[variant];

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        group relative
        flex min-h-24 items-center justify-center gap-5
        overflow-hidden rounded-3xl
        border-2
        px-6 py-5
        backdrop-blur-xl
        transition-all duration-200
        hover:-translate-y-1
        hover:brightness-125
        active:translate-y-0
        active:scale-[0.985]
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-white
        ${style.border}
        ${style.background}
        ${style.shadow}
        ${active ? style.active : ""}
      `}
        >
    <span
        className={`
          shrink-0
          transition-transform duration-200
          group-hover:scale-110
          ${style.icon}
        `}
    >
    {icon}
    </span>

            <span className="text-left text-base font-black uppercase tracking-wide sm:text-lg">
        {children}
        </span>

            {active && (
                <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_white]" />
            )}
        </button>
    );
}