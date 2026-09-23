import { describe, expect, it } from 'vitest';
import { buildPath, clampPos, nextNest, pathPoints } from './board';

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
});
