import { createInitialPlayers } from '../core/constants';
import { PlayerCard } from '../components/molecules/PlayerCard';

const [hiccup, astrid] = createInitialPlayers();

export const name = 'PlayerCard';

export const Empty = () => <PlayerCard player={hiccup} active={false} />;
export const Active = () => <PlayerCard player={hiccup} active />;
export const WithDragons = () => (
  <PlayerCard player={{ ...astrid, dragons: ['toothless', 'stormfly', 'hookfang'] }} active={false} />
);
export const ReadyAndSkipping = () => (
  <PlayerCard
    player={{ ...hiccup, dragons: ['meatlug', 'grump', 'barf', 'stormfly', 'toothless'], skip: true, skipWhy: 'net' }}
    active={false}
  />
);
