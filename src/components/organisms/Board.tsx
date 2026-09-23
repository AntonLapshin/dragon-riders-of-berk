import { IMG, type PlayerState } from '../../core/constants';
import { pathPoints, type Tile } from '../../core/board';
import { BoardTile } from '../molecules/BoardTile';
import { LairTile } from '../molecules/LairTile';
import { PlayerToken } from '../molecules/PlayerToken';

interface BoardProps {
  tiles: Tile[];
  players: PlayerState[];
  highlight: number | null;
  fadeToken: number | null;
}

/** Game board: map art + winding path + tiles + rider tokens (organism). */
export function Board({ tiles, players, highlight, fadeToken }: BoardProps) {
  return (
    <div className="board" id="board">
      <img className="board-bg" alt="Barbaric Archipelago map" src={IMG.board} />
      <svg className="path-svg" viewBox="0 0 1550 1000" preserveAspectRatio="none">
        <polyline points={pathPoints(tiles)} />
      </svg>
      {tiles.map((t) => (t.type === 'lair' ? <LairTile key={t.i} tile={t} /> : <BoardTile key={t.i} tile={t} highlighted={highlight === t.i} />))}
      {players.map((p) => (
        <PlayerToken key={p.id} player={p} tile={tiles[p.pos]} faded={fadeToken === p.id} />
      ))}
    </div>
  );
}
