export class GameClock {
    private audioContext: AudioContext | null =
        null;

    private startedAt = 0;

    private running = false;

    start(
        audioContext: AudioContext,
        startedAt: number,
    ): void {
        this.audioContext = audioContext;
        this.startedAt = startedAt;
        this.running = true;
    }

    stop(): void {
        this.audioContext = null;
        this.startedAt = 0;
        this.running = false;
    }

    getCurrentTime(): number {
        if (
            !this.running ||
            this.audioContext === null
        ) {
            return 0;
        }

        return (
            this.audioContext.currentTime -
            this.startedAt
        );
    }
}