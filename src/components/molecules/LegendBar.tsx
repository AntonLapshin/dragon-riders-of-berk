import { Chip } from '../atoms/Chip';

const ITEMS = [
  { color: '#f0b429', label: 'Berk Village (start)' },
  { color: '#59d98c', label: 'Dragon Nest — Taming Spin Challenge' },
  { color: '#ffc93c', label: 'Fish Feast — spin again' },
  { color: '#ff5d5d', label: 'Trapper Net — lose a turn' },
  { color: '#4dd7fe', label: 'Storm Vortex — ride to a nest' },
  { color: '#9fdcff', label: "The Alpha's Lair" },
];

/** Board legend row (molecule). */
export function LegendBar() {
  return (
    <div className="legend">
      {ITEMS.map((c) => (
        <Chip key={c.label} color={c.color} label={c.label} />
      ))}
    </div>
  );
}
