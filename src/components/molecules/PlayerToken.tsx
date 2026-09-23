import type { PlayerState } from '../../core/constants';
import type { Tile } from '../../core/board';

interface PlayerTokenProps {
  player: PlayerState;
  tile: Tile;
  faded?: boolean;
}

/** Rider token riding the board (molecule). */
export function PlayerToken({ player, tile, faded }: PlayerTokenProps) {
  // Spread up to 3 rider tokens around the tile so they never fully overlap.
  const [ox, oy] =
    player.id === 0 ? [-1.7, -1.4] : player.id === 1 ? [1.7, -1.4] : [0, 1.8];
  return (
    <div
      id={`tok${player.id}`}
      className="token"
      style={
        {
          ['--pc' as string]: player.color,
          left: `${tile.x}%`,
          top: `${tile.y}%`,
          transform: `translate(calc(-50% + ${ox}cqw), calc(-50% + ${oy}cqw))`,
          transition: faded ? 'opacity .3s' : undefined,
          opacity: faded ? 0 : 1,
        } as React.CSSProperties
      }
    >
      <span className="tname">{player.name}</span>
      <div className="tin">
        <img src={player.avatar} alt={player.name} />
      </div>
    </div>
  );
}
