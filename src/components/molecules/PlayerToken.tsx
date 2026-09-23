import type { PlayerState } from '../../core/constants';
import type { Tile } from '../../core/board';

interface PlayerTokenProps {
  player: PlayerState;
  tile: Tile;
  faded?: boolean;
}

/** Rider token riding the board (molecule). */
export function PlayerToken({ player, tile, faded }: PlayerTokenProps) {
  const ox = player.id === 0 ? -1.7 : 1.7;
  const oy = player.id === 0 ? -1.4 : 1.4;
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
