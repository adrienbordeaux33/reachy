import { useEffect, type ReactNode } from "react";
import concertBackground from "../assets/fond.png";
import { NeonDecoration } from "./NeonDecoration";
import { InstrumentSelector, type Instrument } from "./InstrumentSelector";

interface FreeModePauseMenuProps {
    isOpen?: boolean;
    duration?: string;
    instrument: Instrument;
    onResume?: () => void;
    onChangeInstrument?: (instrument: Instrument) => void;
    onRestart?: () => void;
    onListen?: () => void;
    onSave?: () => void;
    saveStatus?: string;
    isSaveDisabled?: boolean;
    onQuit?: () => void;
}

export function FreeModePauseMenu({
    isOpen = false,
    duration = "0:00",
    instrument,
    onResume = () => {},
    onChangeInstrument = () => {},
    onRestart = () => {},
    onListen = () => {},
    onSave = () => {},
    saveStatus = "",
    isSaveDisabled = false,
    onQuit = () => {},
}: FreeModePauseMenuProps) {
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
    if (!isOpen) return null;

    return (
        <main className="relative isolate min-h-screen overflow-hidden text-white">
            {/* Background */}
            <div
                className="absolute inset-0 -z-30 bg-cover bg-center"
                style={{
                    backgroundImage: `
            linear-gradient(
              rgba(2, 6, 23, 0.42),
              rgba(2, 6, 23, 0.68)
            ),
            url(${concertBackground})
          `,
                }}
            />

            {/* Atmosphère */}
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,.25),transparent_28%),radial-gradient(circle_at_82%_15%,rgba(217,70,239,.24),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,.14),transparent_34%)]" />

            {/* Vignette */}
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle,transparent_35%,rgba(0,0,0,.68)_100%)]" />

            <NeonDecoration className="left-5 top-5" />
            <NeonDecoration className="bottom-6 right-5 rotate-180" />

            {/* Popup */}
            <section className="flex min-h-screen items-center justify-center p-5 sm:p-8">
                <div className="relative w-full max-w-5xl">
                    {/* Glow extérieur */}
                    <div className="absolute -inset-3 -z-10 rounded-[2.5rem] bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-rose-500/20 blur-3xl" />

                    <div
                        className="
              relative overflow-hidden
              rounded-[2.5rem]
              border border-cyan-300/30
              bg-slate-950/80
              px-6 py-8
              shadow-[0_30px_90px_rgba(0,0,0,.55),0_0_50px_rgba(34,211,238,.10),inset_0_1px_0_rgba(255,255,255,.1)]
              backdrop-blur-2xl
              sm:px-10
              md:px-14
            "
                    >
                        {/* Bordure néon */}
                        <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] border-2 border-transparent [mask-composite:exclude]" />

                        {/* Accent supérieur */}
                        <div className="mb-3 flex items-center justify-center gap-4">
                            <div className="h-px w-20 bg-gradient-to-r from-transparent via-cyan-400 to-fuchsia-500" />

                            <div className="flex gap-1.5">
                                <span className="h-8 w-2 rounded-full bg-fuchsia-500 shadow-[0_0_14px_rgba(217,70,239,.9)]" />
                                <span className="h-8 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,.9)]" />
                            </div>

                            <div className="h-px w-20 bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-transparent" />
                        </div>

                        {/* Titre */}
                        <header className="mb-8 text-center">
                            <h1
                                className="
                  inline-block
                  bg-gradient-to-r from-white via-cyan-100 to-fuchsia-200
                  bg-clip-text
                  text-5xl font-black italic
                  tracking-[-0.05em]
                  text-transparent
                  drop-shadow-[0_0_18px_rgba(255,255,255,.18)]
                  sm:text-6xl md:text-7xl
                "
                            >
                                PAUSE
                            </h1>

                            <div className="mx-auto mt-1 h-2 max-w-xs -rotate-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 shadow-[0_0_18px_rgba(217,70,239,.35)]" />
                        </header>

                        {/* Actions */}
                        {/* Informations de session */}
                        <div className="mb-6 flex items-center justify-center gap-3 text-white/60">
                            <DurationIcon />
                            <span className="text-sm font-semibold uppercase tracking-wider">
                                Durée
                            </span>
                            <strong className="text-xl text-cyan-300">
                                {duration}
                            </strong>
                        </div>

                        {/* Actions principales */}
                        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
                            <ActionButton
                                variant="green"
                                icon={<PlayIcon />}
                                onClick={onResume}
                            >
                                Reprendre
                            </ActionButton>

                            <ActionButton
                                variant="cyan"
                                icon={<RestartIcon />}
                                onClick={onRestart}
                            >
                                Recommencer
                            </ActionButton>
                        </div>

                        {/* Instrument */}
                        <div className="mx-auto mt-6 max-w-3xl">
                            <p className="mb-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
                                Instrument
                            </p>

                            <InstrumentSelector
                                value={instrument}
                                onChange={onChangeInstrument}
                            />
                        </div>

                        {/* Enregistrement */}
                        <div className="mx-auto mt-6 grid max-w-3xl gap-4 md:grid-cols-2">
                            <ActionButton
                                variant="purple"
                                icon={<MusicIcon />}
                                onClick={onListen}
                            >
                                Réécouter
                            </ActionButton>

                            <ActionButton
                                variant="green"
                                icon={<SaveIcon />}
                                onClick={onSave}
                                disabled={isSaveDisabled}
                            >
                                Enregistrer
                            </ActionButton>
                        </div>

                        {/* Quitter */}
                        {/* Quitter */}
                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                onClick={onQuit}
                                className="flex min-w-48 items-center justify-center gap-3 rounded-2xl border border-rose-400/80 bg-rose-950/25 px-6 py-3 text-base font-semibold text-rose-100 shadow-[0_0_20px_rgba(244,63,94,.22)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-900/30 hover:shadow-[0_0_30px_rgba(244,63,94,.38)] active:translate-y-0 active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                            >
                                <ExitIcon />
                                Quitter
                            </button>
                        </div>

                        {saveStatus && (
                            <p
                                className="mt-5 text-center text-sm text-cyan-100"
                                role="status"
                                aria-live="polite"
                            >
                                {saveStatus}
                            </p>
                        )}

                        <div className="mt-8 flex items-center justify-center gap-4 pt-6">
                            <kbd className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/50">
                                ESC
                            </kbd>

                            <span className="text-sm text-white/50">
                                pour reprendre
                            </span>
                        </div>

                        {/* Décoration intérieure */}
                        <div className="pointer-events-none absolute bottom-8 right-10 hidden rotate-[-32deg] gap-2 lg:flex">
                            <span className="h-1 w-20 rounded-full bg-violet-500" />
                            <span className="h-1 w-16 rounded-full bg-blue-500" />
                            <span className="h-1 w-12 rounded-full bg-cyan-400" />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

/* -------------------------------------------------------------------------- */
/*                                  BUTTON                                    */
/* -------------------------------------------------------------------------- */

type ButtonVariant = "cyan" | "orange" | "purple" | "green" | "pink";

interface ActionButtonProps {
    children: ReactNode;
    icon: ReactNode;
    variant: ButtonVariant;
    onClick?: () => void;
    disabled?: boolean;
}

function ActionButton({
    children,
    icon,
    variant,
    onClick,
    disabled = false,
}: ActionButtonProps) {
    const variants: Record<ButtonVariant, string> = {
        cyan: `
      border-cyan-400/90
      bg-cyan-950/25
      text-cyan-100
      shadow-[0_0_28px_rgba(34,211,238,.30)]
      hover:shadow-[0_0_42px_rgba(34,211,238,.48)]
    `,

        orange: `
      border-amber-400/90
      bg-amber-950/25
      text-amber-100
      shadow-[0_0_28px_rgba(245,158,11,.30)]
      hover:shadow-[0_0_42px_rgba(245,158,11,.48)]
    `,

        purple: `
      border-fuchsia-400/90
      bg-fuchsia-950/25
      text-fuchsia-100
      shadow-[0_0_28px_rgba(217,70,239,.30)]
      hover:shadow-[0_0_42px_rgba(217,70,239,.48)]
    `,

        green: `
      border-emerald-400/90
      bg-emerald-950/25
      text-emerald-100
      shadow-[0_0_28px_rgba(52,211,153,.30)]
      hover:shadow-[0_0_42px_rgba(52,211,153,.48)]
    `,

        pink: `
      border-rose-400/90
      bg-rose-950/25
      text-rose-100
      shadow-[0_0_28px_rgba(244,63,94,.30)]
      hover:shadow-[0_0_42px_rgba(244,63,94,.48)]
    `,
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`
        group
        flex min-h-20
        items-center
        gap-5
        rounded-3xl
        border-2
        px-7 py-5
        text-left
        backdrop-blur-xl
        transition-all
        duration-200

        hover:-translate-y-1
        hover:brightness-110

        active:translate-y-0
        active:scale-[0.985]

        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-white
        disabled:cursor-not-allowed
        disabled:opacity-50

        ${variants[variant]}
      `}
        >
            <span
                className="
          grid h-10 w-10
          shrink-0
          place-items-center
          transition-transform
          duration-200
          group-hover:scale-110
        "
            >
                {icon}
            </span>

            <span className="text-lg font-bold sm:text-xl">{children}</span>
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/*                                   ICONS                                    */
/* -------------------------------------------------------------------------- */

function DurationIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v5l3 2" />
            <path d="M9 2h6" />
            <path d="M12 2v3" />
            <path d="M18 6l2-2" />
        </svg>
    );
}

function RestartIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M20 11a8 8 0 1 0-2 5.5" />
            <path d="M20 4v7h-7" />
            <path d="M10 9l5 3-5 3V9z" />
        </svg>
    );
}

function MusicIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M9 18V5l11-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="17" cy="16" r="3" />
        </svg>
    );
}

function SaveIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M5 3h12l3 3v15H5z" />
            <path d="M8 3v6h8V3" />
            <path d="M8 21v-7h8v7" />
        </svg>
    );
}

function ExitIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
        </svg>
    );
}

function PlayIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M6 4l14 8-14 8V4z" />
        </svg>
    );
}
