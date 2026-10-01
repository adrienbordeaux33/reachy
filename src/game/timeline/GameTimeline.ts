import type { Beatmap } from "../model/BeatMap";
import type { GameNote } from "../model/GameNote";

export interface VisibleGameNote {
    note: GameNote;
    progress: number;
}

export interface GameTimelineConfig {
    travelTime: number;
}

const DEFAULT_CONFIG: GameTimelineConfig = {
    travelTime: 2,
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

                return (
                    currentTime >= spawnTime &&
                    currentTime <= note.hitTime
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