import { useLayoutEffect, useRef } from "react";

interface ChronoProps {
  hasStarted: boolean;
  isPaused: boolean;
  resetKey: number;
  onDurationChange: (duration: string) => void;
}

export function Chrono({
  hasStarted,
  isPaused,
  resetKey,
  onDurationChange,
}: ChronoProps) {
  const elapsedMillisecondsRef = useRef(0);
  const runningSinceRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!hasStarted) {
      elapsedMillisecondsRef.current = 0;
      runningSinceRef.current = null;
      onDurationChange("0:00");
      return;
    }

    if (isPaused) {
      if (runningSinceRef.current !== null) {
        elapsedMillisecondsRef.current +=
          performance.now() - runningSinceRef.current;
        runningSinceRef.current = null;
      }

      const totalSeconds = Math.floor(elapsedMillisecondsRef.current / 1000);
      onDurationChange(
        `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`,
      );
      return;
    }

    if (runningSinceRef.current === null) {
      runningSinceRef.current = performance.now();
    }
  }, [hasStarted, isPaused, onDurationChange, resetKey]);

  return null;
}
