import { BoardTile } from '../components/molecules/BoardTile';
import { LairTile } from '../components/molecules/LairTile';
import { PlayerToken } from '../components/molecules/PlayerToken';
import { createInitialPlayers } from '../core/constants';
import type { Tile } from '../core/board';

const wrap: React.CSSProperties = {
  position: 'relative',
  width: 220,
  height: 120,
  containerType: 'inline-size',
};

const nest: Tile = { i: 5, x: 50, y: 50, type: 'nest', dragon: 'toothless' };
const trap: Tile = { i: 3, x: 50, y: 50, type: 'trap' };
const feast: Tile = { i: 7, x: 50, y: 50, type: 'feast' };
const storm: Tile = { i: 13, x: 50, y: 50, type: 'storm' };
const safe: Tile = { i: 4, x: 50, y: 50, type: 'safe', flavor: 'Clear skies over Berk. 🕊️' };
const start: Tile = { i: 0, x: 50, y: 40, type: 'start' };
const lair: Tile = { i: 58, x: 48, y: 50, type: 'lair' };

const [hiccup] = createInitialPlayers();

export const name = 'BoardTile';

export const Nest = () => (
  <div style={wrap}>
    <BoardTile tile={nest} highlighted={false} />
  </div>
);
export const Highlighted = () => (
  <div style={wrap}>
    <BoardTile tile={trap} highlighted />
  </div>
);
export const FeastStormSafe = () => (
  <div style={{ ...wrap, display: 'flex', gap: 40, width: 420 }}>
    <div style={{ ...wrap, width: 120 }}>
      <BoardTile tile={feast} highlighted={false} />
    </div>
    <div style={{ ...wrap, width: 120 }}>
      <BoardTile tile={storm} highlighted={false} />
    </div>
    <div style={{ ...wrap, width: 120 }}>
      <BoardTile tile={safe} highlighted={false} />
    </div>
  </div>
);
export const Start = () => (
  <div style={wrap}>
    <BoardTile tile={start} highlighted={false} />
  </div>
);
export const Lair = () => (
  <div style={wrap}>
    <LairTile tile={lair} />
  </div>
);
export const Token = () => (
  <div style={wrap}>
    <PlayerToken player={hiccup} tile={{ ...trap, x: 50, y: 55 }} />
  </div>
);
