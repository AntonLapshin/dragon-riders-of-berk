import { describe, expect, it } from 'vitest';
import { DRAGONS, FEAST, NESTS, STORM, TRAPS, type DragonId } from './constants';
import { buildPath, clampPos, nextNest, pathPoints, TYPE_COLOR, TYPE_ICON } from './board';

describe('buildPath', () => {
  it('builds 59 tiles indexed 0..58', () => {
    const tiles = buildPath();
    expect(tiles).toHaveLength(59);
    expect(tiles.map((t) => t.i)).toEqual(Array.from({ length: 59 }, (_, i) => i));
  });

  it('starts at Berk Village and ends at the Alpha lair', () => {
    const tiles = buildPath();
    expect(tiles[0].type).toBe('start');
    expect(tiles[tiles.length - 1].type).toBe('lair');
  });

  it('assigns every tile exactly one type', () => {
    const tiles = buildPath();
    for (const t of tiles) {
      expect(['start', 'nest', 'trap', 'feast', 'storm', 'safe', 'lair']).toContain(t.type);
    }
  });

  it('is deterministic', () => {
    expect(buildPath()).toEqual(buildPath());
  });
});

describe('nextNest', () => {
  it('finds the next nest after a position', () => {
    expect(nextNest(0)).toBe(5);
    expect(nextNest(5)).toBe(9);
  });

  it('returns null past the last nest', () => {
    expect(nextNest(50)).toBeNull();
    expect(nextNest(58)).toBeNull();
  });
});

describe('clampPos', () => {
  it('clamps into range', () => {
    expect(clampPos(-3, 58)).toBe(0);
    expect(clampPos(99, 58)).toBe(58);
    expect(clampPos(12, 58)).toBe(12);
  });
});

describe('pathPoints', () => {
  it('emits one point per tile', () => {
    const tiles = buildPath();
    expect(pathPoints(tiles).split(' ')).toHaveLength(tiles.length);
  });

  it('emits x,y pairs', () => {
    for (const pt of pathPoints(buildPath()).split(' ')) {
      expect(pt.split(',')).toHaveLength(2);
    }
  });
});

describe('tile placement', () => {
  it('places every configured nest / trap / feast / storm tile', () => {
    const tiles = buildPath();
    for (const [key, id] of Object.entries(NESTS)) {
      const t = tiles[Number(key)];
      expect(t.type).toBe('nest');
      expect(t.dragon).toBe(id as DragonId);
      expect(DRAGONS[id as DragonId]).toBeDefined();
    }
    for (const i of TRAPS) expect(tiles[i].type).toBe('trap');
    for (const i of FEAST) expect(tiles[i].type).toBe('feast');
    for (const i of STORM) expect(tiles[i].type).toBe('storm');
  });

  it('links rows with 5 turn-connector tiles', () => {
    // Connectors only mark the winding position (no number badge); the
    // tile-type overlay may still turn one into a nest/trap/etc.
    const conns = buildPath().filter((t) => t.conn);
    expect(conns).toHaveLength(5);
    expect(conns.map((t) => t.i)).toEqual([9, 19, 29, 39, 49]);
  });

  it('cycles safe flavors deterministically', () => {
    const a = buildPath().filter((t) => t.type === 'safe');
    const b = buildPath().filter((t) => t.type === 'safe');
    expect(a.length).toBeGreaterThan(0);
    expect(a.map((t) => t.flavor)).toEqual(b.map((t) => t.flavor));
  });
});

describe('nextNest chain', () => {
  it('walks the whole nest chain in order', () => {
    const chain: number[] = [];
    let pos = 0;
    for (;;) {
      const n = nextNest(pos);
      if (n == null) break;
      chain.push(n);
      pos = n;
    }
    expect(chain).toEqual([5, 9, 15, 19, 24, 28, 33, 38, 44, 50]);
  });
});

describe('tile meta', () => {
  it('colors every tile type', () => {
    for (const t of buildPath()) {
      expect(TYPE_COLOR[t.type]).toMatch(/^#/);
    }
  });

  it('icons every non-nest special tile', () => {
    expect(Object.keys(TYPE_ICON).sort()).toEqual(['feast', 'safe', 'storm', 'trap']);
  });
});
