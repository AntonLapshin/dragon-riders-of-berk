import { IMG } from '../../core/constants';
import type { Tile } from '../../core/board';

export function LairTile({ tile }: { tile: Tile }) {
  return (
    <div
      className="lair"
      style={{ left: `${tile.x + 1.2}%`, top: `${tile.y}%` }}
      title="Reach here with at least 1 dragon to challenge the Alpha!"
    >
      <img src={IMG.alpha} alt="The Alpha" />
      <span>THE ALPHA&apos;S LAIR</span>
    </div>
  );
}
