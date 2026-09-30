export function NeonDecoration({
                            className = "",
                        }: {
    className?: string;
}) {
    return (
        <div
            className={`
        pointer-events-none absolute
        hidden gap-2 sm:flex
        ${className}
      `}
        >
            <span className="h-1.5 w-24 rotate-[-32deg] rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,.9)]" />
            <span className="h-1.5 w-20 rotate-[-32deg] rounded-full bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,.9)]" />
            <span className="h-1.5 w-16 rotate-[-32deg] rounded-full bg-fuchsia-500 shadow-[0_0_18px_rgba(217,70,239,.9)]" />
        </div>
    );
}
