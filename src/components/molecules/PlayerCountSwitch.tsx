import type { PlayerCount } from '../../core/constants';

interface PlayerCountSwitchProps {
  value: PlayerCount;
  onChange: (count: PlayerCount) => void;
  compact?: boolean;
}

/** 2-players / 3-players switcher — restarts the saga with the new count (molecule). */
export function PlayerCountSwitch({ value, onChange, compact }: PlayerCountSwitchProps) {
  return (
    <div className={`pcount${compact ? ' compact' : ''}`} role="group" aria-label="Number of players">
      {([2, 3] as PlayerCount[]).map((n) => (
        <button
          key={n}
          type="button"
          className={`pcount-btn${value === n ? ' active' : ''}`}
          aria-pressed={value === n}
          onClick={() => {
            if (n !== value) onChange(n);
          }}
          title={n === 2 ? 'Hiccup vs Astrid' : 'Hiccup vs Astrid vs Stoick'}
        >
          {n === 2 ? '2 Players' : '3 Players'}
        </button>
      ))}
    </div>
  );
}
