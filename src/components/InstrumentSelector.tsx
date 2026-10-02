import { SelectionButton } from "./SelectionButton";
import { GuitarIcon, PianoIcon } from "./icons";
import type {Instrument} from "../audio/Instrument.ts";


interface InstrumentSelectorProps {
  value: Instrument;
  onChange: (instrument: Instrument) => void;
}

export function InstrumentSelector({
  value,
  onChange,
}: InstrumentSelectorProps) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <SelectionButton
        active={value === "piano"}
        variant="cyan"
        icon={<PianoIcon />}
        onClick={() => onChange("piano")}
      >
        Piano
      </SelectionButton>
      <SelectionButton
        active={value === "guitar"}
        variant="purple"
        icon={<GuitarIcon />}
        onClick={() => onChange("guitar")}
      >
        Guitare
      </SelectionButton>
      <SelectionButton
        active={value === "bass"}
        variant="pink"
        icon={<GuitarIcon />}
        onClick={() => onChange("bass")}
      >
        Basse
      </SelectionButton>
    </div>
  );
}
