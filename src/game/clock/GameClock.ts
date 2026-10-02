export class GameClock {
    private audioContext: AudioContext | null = null;

    /**
     * Position dans le temps logique/musical au dernier changement
     * de référence.
     */
    private accumulatedTime = 0;

    /**
     * audioContext.currentTime correspondant à accumulatedTime.
     */
    private referenceTime = 0;

    private playbackRate = 1;

    private running = false;

    private paused = false;

    start(
        audioContext: AudioContext,
        startedAt: number,
    ): void {
        this.audioContext = audioContext;

        this.accumulatedTime = 0;
        this.referenceTime = startedAt;

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

        // On mémorise la position musicale exacte
        // atteinte au moment de la pause.
        this.accumulatedTime =
            this.getCurrentTime();

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

        // La position musicale ne change pas.
        // On déplace seulement notre référence temps réel.
        this.referenceTime =
            this.audioContext.currentTime;

        this.paused = false;
    }

    setPlaybackRate(
        playbackRate: number,
    ): void {
        if (playbackRate <= 0) {
            throw new Error(
                "playbackRate must be greater than 0",
            );
        }

        if (
            this.running &&
            !this.paused &&
            this.audioContext !== null
        ) {
            // Très important :
            // sauvegarder la position musicale AVANT
            // de changer le rate.
            this.accumulatedTime =
                this.getCurrentTime();

            this.referenceTime =
                this.audioContext.currentTime;
        }

        this.playbackRate = playbackRate;
    }

    getPlaybackRate(): number {
        return this.playbackRate;
    }

    stop(): void {
        this.audioContext = null;

        this.accumulatedTime = 0;
        this.referenceTime = 0;

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
            return this.accumulatedTime;
        }

        const realElapsedTime =
            this.audioContext.currentTime -
            this.referenceTime;

        return (
            this.accumulatedTime +
            realElapsedTime *
            this.playbackRate
        );
    }
}