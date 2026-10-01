declare module "soundfont-player" {
  export interface Player {
    play(
      note: number,
      time?: number,
      options?: { gain?: number },
    ): PlayerVoice | undefined;
  }

  export interface PlayerVoice {
    stop(when?: number): void;
  }

  interface InstrumentOptions {
    soundfont?: string;
    format?: string;
    notes?: string[];
    gain?: number;
    destination?: AudioNode;
  }

  const SoundfontPlayer: {
    instrument(
      context: AudioContext,
      name: string,
      options?: InstrumentOptions,
    ): Promise<Player>;
  };

  export default SoundfontPlayer;
}
