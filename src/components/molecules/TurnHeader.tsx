import type { PlayerState } from '../../core/constants';
import { Avatar } from '../atoms/Avatar';

interface TurnHeaderProps {
  player: PlayerState;
  messageHtml: string;
}

/** Current-turn banner: avatar + name + hint (molecule). */
export function TurnHeader({ player, messageHtml }: TurnHeaderProps) {
  return (
    <div className="turn-head">
      <Avatar src={player.avatar} alt={player.name} color={player.color} size={52} className="turn-avatar" />
      <div>
        <div className="turn-name" style={{ ['--pc' as string]: player.color } as React.CSSProperties}>
          {player.name}&apos;s Turn
        </div>
        <div className="turn-msg" dangerouslySetInnerHTML={{ __html: messageHtml }} />
      </div>
    </div>
  );
}
