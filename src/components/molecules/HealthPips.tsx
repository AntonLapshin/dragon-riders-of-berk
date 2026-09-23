import { Pip } from '../atoms/Pip';

interface HealthPipsProps {
  label: string;
  hp: number;
  max?: number;
  icon: string;
}

/** Labeled HP pip row for the battle modal (molecule). */
export function HealthPips({ label, hp, max = 3, icon }: HealthPipsProps) {
  return (
    <div className="hp-block">
      <span className="hp-label">{label}</span>
      <div className="pips">
        {Array.from({ length: max }, (_, i) => (
          <Pip key={i} icon={icon} off={i >= hp} />
        ))}
      </div>
    </div>
  );
}
