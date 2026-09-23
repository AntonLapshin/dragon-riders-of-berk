import { DRAGONS } from '../../core/constants';
import { TYPE_COLOR, TYPE_ICON, type Tile } from '../../core/board';

interface BoardTileProps {
  tile: Tile;
  highlighted: boolean;
}

/** Single board space (molecule). Connector tiles render without a number badge. */
export function BoardTile({ tile, highlighted }: BoardTileProps) {
  const t = tile;
  if (t.type === 'lair') return null; // rendered by LairTile
  const style = { left: `${t.x}%`, top: `${t.y}%`, ['--tc' as string]: TYPE_COLOR[t.type] } as React.CSSProperties;
  const numHtml = t.conn ? null : <span className="tnum">{t.i}</span>;

  if (t.type === 'nest' && t.dragon) {
    const d = DRAGONS[t.dragon];
    return (
      <div id={`tile${t.i}`} className={`tile nest${highlighted ? ' hit' : ''}`} style={style} title={`Dragon Nest: ${d.name} (${d.species}) — Taming Spin Challenge`}>
        <img src={d.img} alt={d.name} />
        <span className="negg">🥚</span>
        {numHtml}
      </div>
    );
  }
  if (t.type === 'start') {
    return (
      <div id="tile0" className={`tile start${highlighted ? ' hit' : ''}`} style={style} title="Berk Village — start">
        <span className="ticon">🛖</span>
        <span className="tlabel">BERK</span>
      </div>
    );
  }
  const tips: Record<string, string> = {
    trap: "Trapper Net — lose a turn",
    feast: 'Fish Feast — spin again',
    storm: 'Storm Vortex — ride the wind to the next nest',
    safe: 'Safe skies — ' + (t.flavor || ''),
  };
  return (
    <div id={`tile${t.i}`} className={`tile ${t.type}${highlighted ? ' hit' : ''}`} style={style} title={tips[t.type]}>
      <span className="ticon">{TYPE_ICON[t.type as keyof typeof TYPE_ICON]}</span>
      {numHtml}
    </div>
  );
}
