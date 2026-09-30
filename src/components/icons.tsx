/* -------------------------------------------------------------------------- */
/*                                   ICONS                                    */
/* -------------------------------------------------------------------------- */

export function MusicIcon() {
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

export function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 3h5v5" />
      <path d="M4 20L21 3" />
      <path d="M21 16v5h-5" />
      <path d="M15 15l6 6" />
      <path d="M4 4l5 5" />
    </svg>
  );
}

export function SlidersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />

      <circle cx="9" cy="6" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="11" cy="18" r="2" />
    </svg>
  );
}

export function PianoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M7 4v11" />
      <path d="M11 4v11" />
      <path d="M15 4v11" />
      <path d="M19 4v11" />
      <path d="M7 15v5" />
      <path d="M11 15v5" />
      <path d="M15 15v5" />
      <path d="M19 15v5" />
    </svg>
  );
}

export function GuitarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 6l4-4 4 4-4 4" />
      <path d="M16 8l-5 5" />
      <path d="M11 11c-2-1-5-.5-7 1.5-2.7 2.7-2.7 7 0 9.5 2.5 2.5 6.8 2.5 9.5 0 2-2 2.5-5 1.5-7" />
      <circle cx="9" cy="17" r="2" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-11 w-11 text-emerald-100 transition-transform duration-200 group-hover:scale-110"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 4l14 8-14 8V4z" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-11 w-11 text-emerald-100 transition-transform duration-200 group-hover:scale-110"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 5v14M16 5v14" />
    </svg>
  );
}
