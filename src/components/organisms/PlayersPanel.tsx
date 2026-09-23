import type { PlayerState } from '../../core/constants';
import { PlayerCard } from '../molecules/PlayerCard';

interface PlayersPanelProps {
  players: PlayerState[];
  current: number;
  phase: 'play' | 'over';
}

/** Rider flock cards (organism). */
export function PlayersPanel({ players, current, phase }: PlayersPanelProps) {
  return (
    <div className="players">
      {players.map((p) => (
        <PlayerCard key={p.id} player={p} active={p.id === current && phase === 'play'} />
      ))}
    </div>
  );
}
