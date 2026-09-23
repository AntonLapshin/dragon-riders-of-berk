import { DRAGONS, MAX_DRAGONS, type PlayerState } from '../../core/constants';
import { teamPower } from '../../core/battle';
import { Avatar } from '../atoms/Avatar';

interface PlayerCardProps {
  player: PlayerState;
  active: boolean;
}

/** Rider flock card with 5 dragon slots (molecule). */
export function PlayerCard({ player, active }: PlayerCardProps) {
  const ready = player.dragons.length >= MAX_DRAGONS;
  const cls = ['pcard', active ? 'active' : '', ready ? 'ready' : '', player.skip ? 'skipping' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls} style={{ ['--pc' as string]: player.color } as React.CSSProperties}>
      <div className="pc-head">
        <Avatar src={player.avatar} alt={player.name} color={player.color} />
        <div className="pc-names">
          <b>{player.name}</b>
          <span className="pc-sub">
            {player.dragons.length}/{MAX_DRAGONS} dragons • power {teamPower(player.dragons)}
          </span>
        </div>
        <span className="pc-badge">ALPHA-READY!</span>
        <span className="pc-skip">SKIPS NEXT</span>
      </div>
      <div className="pc-slots">
        {Array.from({ length: MAX_DRAGONS }, (_, i) => {
          const id = player.dragons[i];
          return id ? (
            <div key={i} className="slot filled" title={`${DRAGONS[id].name} — power ${DRAGONS[id].power}`}>
              <img src={DRAGONS[id].img} alt={DRAGONS[id].name} />
            </div>
          ) : (
            <div key={i} className="slot">
              🥚
            </div>
          );
        })}
      </div>
    </div>
  );
}
