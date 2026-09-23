import { describe, expect, it } from 'vitest';
import {
  BATTLE_SEGS,
  CHALLENGE_SEGS,
  DRAGONS,
  FEAST,
  MAIN_SEGS,
  MAX_DRAGONS,
  NESTS,
  STORM,
  TRAPS,
  createInitialPlayers,
  type DragonId,
} from './constants';

describe('createInitialPlayers', () => {
  it('creates Hiccup and Astrid at Berk Village by default', () => {
    const players = createInitialPlayers();
    expect(players).toHaveLength(2);
    expect(players[0].name).toBe('Hiccup');
    expect(players[1].name).toBe('Astrid');
    for (const p of players) {
      expect(p.pos).toBe(0);
      expect(p.dragons).toEqual([]);
      expect(p.skip).toBe(false);
      expect(p.skipWhy).toBeNull();
    }
  });

  it('adds Stoick as the third rider for 3-player games', () => {
    const players = createInitialPlayers(3);
    expect(players).toHaveLength(3);
    expect(players.map((p) => p.name)).toEqual(['Hiccup', 'Astrid', 'Stoick']);
    expect(players.map((p) => p.id)).toEqual([0, 1, 2]);
    const stoick = players[2];
    expect(stoick.pos).toBe(0);
    expect(stoick.dragons).toEqual([]);
    expect(stoick.avatar.length).toBeGreaterThan(0);
    // Every rider has a distinct color so tokens and cards stay readable.
    expect(new Set(players.map((p) => p.color)).size).toBe(3);
  });

  it('returns fresh state on every call', () => {
    const a = createInitialPlayers();
    a[0].dragons.push('meatlug');
    expect(createInitialPlayers()[0].dragons).toEqual([]);
  });
});

describe('dragons', () => {
  it('every dragon has a positive power', () => {
    for (const d of Object.values(DRAGONS)) {
      expect(d.power).toBeGreaterThan(0);
      expect(d.name.length).toBeGreaterThan(0);
    }
  });

  it('nests reference real dragons', () => {
    for (const id of Object.values(NESTS)) {
      expect(Object.keys(DRAGONS)).toContain(id);
    }
  });
});

describe('board layout config', () => {
  it('special tiles live inside the board and never overlap', () => {
    const nests = Object.keys(NESTS).map(Number);
    const all = [...nests, ...TRAPS, ...FEAST, ...STORM];
    for (const i of all) {
      expect(i).toBeGreaterThan(0);
      expect(i).toBeLessThan(58);
    }
    expect(new Set(all).size).toBe(all.length);
  });

  it('caps flocks at MAX_DRAGONS', () => {
    expect(MAX_DRAGONS).toBe(5);
  });
});

describe('wheel segments', () => {
  it('main wheel holds move values', () => {
    expect(MAIN_SEGS.length).toBeGreaterThan(0);
    for (const s of MAIN_SEGS) {
      expect(s.value).toBeGreaterThanOrEqual(1);
    }
  });

  it('challenge wheel only yields known outcome keys', () => {
    const keys = new Set(['catch', 'catchfeast', 'escape', 'trap']);
    for (const s of CHALLENGE_SEGS) {
      expect(keys.has(s.key as string)).toBe(true);
    }
    // At least one catching, one feast, one escape, one trap outcome exists.
    const present = new Set(CHALLENGE_SEGS.map((s) => s.key));
    expect(present.has('catch')).toBe(true);
    expect(present.has('catchfeast')).toBe(true);
    expect(present.has('escape')).toBe(true);
    expect(present.has('trap')).toBe(true);
  });

  it('battle wheel spans 1..10', () => {
    expect(BATTLE_SEGS.map((s) => s.value)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('DragonId covers every dragon', () => {
    const ids: DragonId[] = ['meatlug', 'grump', 'barf', 'stormfly', 'cloudjumper', 'hookfang', 'toothless'];
    expect(Object.keys(DRAGONS).sort()).toEqual([...ids].sort());
  });
});
