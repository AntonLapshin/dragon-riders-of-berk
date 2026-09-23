import { createInitialPlayers } from '../core/constants';
import { TurnHeader } from '../components/molecules/TurnHeader';

const [hiccup] = createInitialPlayers();

export const name = 'TurnHeader';

export const Default = () => <TurnHeader player={hiccup} messageHtml="🎡 Spin the wheel! Find nests to build your flock" />;
export const FlockComplete = () => (
  <TurnHeader player={{ ...hiccup, dragons: ['meatlug', 'grump', 'barf', 'stormfly', 'toothless'] }} messageHtml="⚔️ Flock complete! Reach the <b>Alpha's Lair</b>!" />
);
