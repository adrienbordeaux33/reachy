import type { MusicNote } from "../model/MusicNote";
import type { MusicSong } from "../model/MusicSong";
import type { MusicParser } from "./MusicParser";

interface RawNote {
  midi: number;
  velocity: number;
  startTick: number;
  endTick: number;
}

interface TempoEvent {
  tick: number;
  microsecondsPerQuarter: number;
  order: number;
}

interface ParsedTrack {
  notes: RawNote[];
  tempos: Omit<TempoEvent, "order">[];
  title?: string;
  endTick: number;
}

class MidiByteReader {
  private offset = 0;
  private readonly bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
  }

  get remaining(): number {
    return this.bytes.length - this.offset;
  }

  readUint8(): number {
    this.ensureAvailable(1);
    return this.bytes[this.offset++];
  }

  readUint16(): number {
    return (this.readUint8() << 8) | this.readUint8();
  }

  readUint32(): number {
    return (
      this.readUint8() * 0x1000000 +
      (this.readUint8() << 16) +
      (this.readUint8() << 8) +
      this.readUint8()
    );
  }

  readBytes(length: number): Uint8Array {
    if (!Number.isSafeInteger(length) || length < 0) {
      throw new Error("Longueur MIDI invalide.");
    }
    this.ensureAvailable(length);
    const result = this.bytes.subarray(this.offset, this.offset + length);
    this.offset += length;
    return result;
  }

  readText(length: number): string {
    return String.fromCharCode(...this.readBytes(length));
  }

  readVariableLength(): number {
    let value = 0;

    for (let index = 0; index < 4; index += 1) {
      const byte = this.readUint8();
      value = (value << 7) | (byte & 0x7f);
      if ((byte & 0x80) === 0) return value;
    }

    throw new Error("Valeur variable MIDI invalide.");
  }

  private ensureAvailable(length: number): void {
    if (length > this.remaining) {
      throw new Error("Fichier MIDI tronqué.");
    }
  }
}

function parseTrack(reader: MidiByteReader): ParsedTrack {
  const notes: RawNote[] = [];
  const tempos: ParsedTrack["tempos"] = [];
  const activeNotes = new Map<string, RawNote[]>();
  let runningStatus: number | undefined;
  let tick = 0;
  let title: string | undefined;

  while (reader.remaining > 0) {
    tick += reader.readVariableLength();
    if (!Number.isSafeInteger(tick)) {
      throw new Error("Position temporelle MIDI trop grande.");
    }

    const firstByte = reader.readUint8();
    let status: number;
    let firstDataByte: number | undefined;

    if (firstByte >= 0x80) {
      status = firstByte;
      runningStatus = status < 0xf0 ? status : undefined;
    } else {
      if (runningStatus === undefined) {
        throw new Error("Statut MIDI manquant avant une donnée.");
      }
      status = runningStatus;
      firstDataByte = firstByte;
    }

    if (status === 0xff) {
      const metaType = reader.readUint8();
      const data = reader.readBytes(reader.readVariableLength());

      if (metaType === 0x03 && data.length > 0 && !title) {
        title = new TextDecoder().decode(data).trim() || undefined;
      } else if (metaType === 0x51) {
        if (data.length !== 3) {
          throw new Error("Événement de tempo MIDI invalide.");
        }
        const microsecondsPerQuarter =
          (data[0] << 16) | (data[1] << 8) | data[2];
        if (microsecondsPerQuarter === 0) {
          throw new Error("Tempo MIDI nul.");
        }
        tempos.push({ tick, microsecondsPerQuarter });
      }

      runningStatus = undefined;
      if (metaType === 0x2f) break;
      continue;
    }

    if (status === 0xf0 || status === 0xf7) {
      reader.readBytes(reader.readVariableLength());
      runningStatus = undefined;
      continue;
    }

    if (status >= 0xf0) {
      const dataLength =
        status === 0xf2 ? 2 : status === 0xf1 || status === 0xf3 ? 1 : 0;
      reader.readBytes(dataLength);
      runningStatus = undefined;
      continue;
    }

    const eventType = status & 0xf0;
    const channel = status & 0x0f;
    const data1 = firstDataByte ?? reader.readUint8();
    const data2 =
      eventType === 0xc0 || eventType === 0xd0 ? 0 : reader.readUint8();

    if (eventType !== 0x80 && eventType !== 0x90) continue;

    const key = `${channel}:${data1}`;
    if (eventType === 0x90 && data2 > 0) {
      const note: RawNote = {
        midi: data1,
        velocity: data2,
        startTick: tick,
        endTick: tick,
      };
      notes.push(note);
      const pending = activeNotes.get(key) ?? [];
      pending.push(note);
      activeNotes.set(key, pending);
      continue;
    }

    const pending = activeNotes.get(key);
    const note = pending?.shift();
    if (note) note.endTick = tick;
    if (pending?.length === 0) activeNotes.delete(key);
  }

  for (const pending of activeNotes.values()) {
    pending.forEach((note) => {
      note.endTick = tick;
    });
  }

  return { notes, tempos, title, endTick: tick };
}

export class MidiMusicParser implements MusicParser<ArrayBuffer> {
  parse(input: ArrayBuffer): MusicSong {
    const reader = new MidiByteReader(new Uint8Array(input));
    if (reader.readText(4) !== "MThd") {
      throw new Error("En-tête MIDI introuvable.");
    }

    const headerLength = reader.readUint32();
    if (headerLength < 6) {
      throw new Error("En-tête MIDI invalide.");
    }

    const format = reader.readUint16();
    const trackCount = reader.readUint16();
    const division = reader.readUint16();
    reader.readBytes(headerLength - 6);

    if (format > 1 || trackCount === 0) {
      throw new Error("Format MIDI non pris en charge.");
    }
    if ((division & 0x8000) !== 0 || division === 0) {
      throw new Error("Division temporelle MIDI non prise en charge.");
    }
    if (format === 0 && trackCount !== 1) {
      throw new Error("Un fichier MIDI de type 0 doit avoir une piste.");
    }

    const tracks: ParsedTrack[] = [];
    while (tracks.length < trackCount) {
      const chunkType = reader.readText(4);
      const chunk = new MidiByteReader(reader.readBytes(reader.readUint32()));
      if (chunkType === "MTrk") tracks.push(parseTrack(chunk));
    }

    const tempoEvents: TempoEvent[] = [
      { tick: 0, microsecondsPerQuarter: 500_000, order: -1 },
    ];
    let tempoOrder = 0;
    tracks.forEach((track) => {
      track.tempos.forEach((tempo) => {
        tempoEvents.push({ ...tempo, order: tempoOrder++ });
      });
    });
    tempoEvents.sort(
      (first, second) => first.tick - second.tick || first.order - second.order,
    );

    const secondsAtTick = (targetTick: number): number => {
      let currentTick = 0;
      let currentTempo = 500_000;
      let seconds = 0;

      for (const tempo of tempoEvents) {
        if (tempo.tick > targetTick) break;
        seconds +=
          ((tempo.tick - currentTick) * currentTempo) / (division * 1_000_000);
        currentTick = tempo.tick;
        currentTempo = tempo.microsecondsPerQuarter;
      }

      return (
        seconds +
        ((targetTick - currentTick) * currentTempo) / (division * 1_000_000)
      );
    };

    const rawNotes = tracks.flatMap((track) => track.notes);
    const notes: MusicNote[] = rawNotes
      .map((note) => {
        const startTime = secondsAtTick(note.startTick);
        const endTime = secondsAtTick(note.endTick);
        return {
          midi: note.midi,
          velocity: note.velocity,
          startTime,
          duration: endTime - startTime,
        };
      })
      .sort(
        (first, second) =>
          first.startTime - second.startTime || first.midi - second.midi,
      );

    const endTick = Math.max(0, ...tracks.map((track) => track.endTick));
    const initialTempo =
      tempoEvents.filter((tempo) => tempo.tick === 0).at(-1)
        ?.microsecondsPerQuarter ?? 500_000;
    const title = tracks.find((track) => track.title)?.title;

    return {
      ...(title ? { title } : {}),
      duration: Math.max(
        secondsAtTick(endTick),
        ...notes.map((note) => note.startTime + note.duration),
      ),
      bpm: 60_000_000 / initialTempo,
      notes,
    };
  }
}
