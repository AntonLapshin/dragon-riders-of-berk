/** Pure board-path logic: serpentine 59-tile layout, tile typing, nest lookup. */
import { FEAST, NESTS, SAFE_FLAVORS, STORM, TRAPS, type DragonId } from './constants';

export type TileType = 'start' | 'nest' | 'trap' | 'feast' | 'storm' | 'safe' | 'lair';

export interface Tile {
  i: number;
  x: number; // percent coords on the board
  y: number;
  conn?: boolean; // turn-connector tile (no number badge)
  type: TileType;
  dragon?: DragonId;
  flavor?: string;
}

export const TYPE_COLOR: Record<TileType, string> = {
  start: '#f0b429',
  nest: '#59d98c',
  trap: '#ff5d5d',
  feast: '#ffc93c',
  storm: '#4dd7fe',
  safe: '#8fa3c8',
  lair: '#9fdcff',
};

export const TYPE_ICON: Record<Exclude<TileType, 'start' | 'nest' | 'lair'>, string> = {
  trap: '🪤',
  feast: '🐟',
  storm: '🌀',
  safe: '✦',
};

/**
 * Build the serpentine path: 6 rows x 9 columns + 5 turn connectors = 59 tiles.
 * Pure function — same output on every call.
 */
export function buildPath(): Tile[] {
  const COLS = 9;
  const ROWS = 6;
  const xs = (i: number) => 7 + i * 10.75;
  const ys = (r: number) => 91 - r * 16.4;
  const tiles: Tile[] = [];
  for (let r = 0; r < ROWS; r++) {
    const order = [...Array(COLS).keys()];
    if (r % 2 === 1) order.reverse();
    for (const i of order) tiles.push({ i: -1, x: xs(i), y: ys(r), type: 'safe' });
    if (r < ROWS - 1) {
      const turnX = r % 2 === 0 ? xs(COLS - 1) : xs(0);
      tiles.push({ i: -1, x: turnX, y: (ys(r) + ys(r + 1)) / 2, conn: true, type: 'safe' });
    }
  }
  const LASTI = tiles.length - 1;
  let safeIdx = 0;
  tiles.forEach((t, i) => {
    t.i = i;
    if (i === 0) {
      t.type = 'start';
    } else if (i === LASTI) {
      t.type = 'lair';
    } else if (NESTS[i]) {
      t.type = 'nest';
      t.dragon = NESTS[i];
    } else if (TRAPS.includes(i)) {
      t.type = 'trap';
    } else if (FEAST.includes(i)) {
      t.type = 'feast';
    } else if (STORM.includes(i)) {
      t.type = 'storm';
    } else {
      t.type = 'safe';
      t.flavor = SAFE_FLAVORS[safeIdx++ % SAFE_FLAVORS.length];
    }
  });
  return tiles;
}

/** Next dragon-nest tile index after `pos`, or null when past the last nest. */
export function nextNest(pos: number): number | null {
  const list = Object.keys(NESTS)
    .map(Number)
    .sort((a, b) => a - b);
  return list.find((n) => n > pos) ?? null;
}

/** Clamp a board position into [0, last]. */
export function clampPos(pos: number, last: number): number {
  return Math.max(0, Math.min(last, pos));
}

/** SVG polyline points for the winding path (1550x1000 viewBox). */
export function pathPoints(tiles: Tile[]): string {
  return tiles.map((t) => `${((t.x / 100) * 1550).toFixed(1)},${((t.y / 100) * 1000).toFixed(1)}`).join(' ');
}
