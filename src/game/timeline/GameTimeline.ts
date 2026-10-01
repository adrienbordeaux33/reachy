import type { Beatmap } from "../model/BeatMap";
import type { GameNote } from "../model/GameNote";


export const NOTE_TRAVEL_TIME = 4;

export interface VisibleGameNote {
    note: GameNote;
    progress: number;
}

export interface GameTimelineConfig {
    travelTime: number;
    postHitTime: number;
}

const DEFAULT_CONFIG: GameTimelineConfig = {
    travelTime: NOTE_TRAVEL_TIME,
    postHitTime: 0.15,
};

export class GameTimeline {
    private readonly beatmap: Beatmap;
    private readonly config: GameTimelineConfig;

    constructor(
        beatmap: Beatmap,
        config: GameTimelineConfig = DEFAULT_CONFIG,
    ) {
        this.beatmap = beatmap;
        this.config = config;
    }

    getVisibleNotes(
        currentTime: number,
    ): VisibleGameNote[] {
        return this.beatmap.notes
            .filter((note) => {
                const spawnTime =
                    note.hitTime -
                    this.config.travelTime;

                const disappearTime =
                    note.hitTime +
                    this.config.postHitTime;

                return (
                    currentTime >= spawnTime &&
                    currentTime <= disappearTime
                );
            })
            .map((note) => {
                const spawnTime =
                    note.hitTime -
                    this.config.travelTime;

                return {
                    note,
                    progress:
                        (currentTime - spawnTime) /
                        this.config.travelTime,
                };
            });
    }
}