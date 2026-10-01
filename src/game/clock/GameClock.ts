export class GameClock {
    private audioContext: AudioContext | null = null;

    private startedAt = 0;

    private pausedAt = 0;

    private running = false;

    private paused = false;

    start(
        audioContext: AudioContext,
        startedAt: number,
    ): void {
        this.audioContext = audioContext;
        this.startedAt = startedAt;
        this.pausedAt = 0;

        this.running = true;
        this.paused = false;
    }

    pause(): void {
        if (
            !this.running ||
            this.paused ||
            this.audioContext === null
        ) {
            return;
        }

        this.pausedAt =
            this.audioContext.currentTime -
            this.startedAt;

        this.paused = true;
    }

    resume(): void {
        if (
            !this.running ||
            !this.paused ||
            this.audioContext === null
        ) {
            return;
        }

        this.startedAt =
            this.audioContext.currentTime -
            this.pausedAt;

        this.paused = false;
    }

    stop(): void {
        this.audioContext = null;

        this.startedAt = 0;
        this.pausedAt = 0;

        this.running = false;
        this.paused = false;
    }

    getCurrentTime(): number {
        if (
            !this.running ||
            this.audioContext === null
        ) {
            return 0;
        }

        if (this.paused) {
            return this.pausedAt;
        }

        return (
            this.audioContext.currentTime -
            this.startedAt
        );
    }
}