import { describe, expect, it } from 'vitest';
import { randomLossIndex, resolveBattleRound, teamPower } from './battle';

describe('teamPower', () => {
  it('sums dragon powers', () => {
    expect(teamPower([])).toBe(0);
    expect(teamPower(['meatlug', 'toothless'])).toBe(2 + 5);
  });
});

describe('resolveBattleRound', () => {
  it('stronger flock total hits', () => {
    const r = resolveBattleRound({ team: 10, playerSpin: 8, alphaSpin: 1 });
    expect(r.outcome).toBe('hit');
    expect(r.playerTotal).toBe(10 + 8 + 6);
  });

  it('weaker total gets hurt', () => {
    const r = resolveBattleRound({ team: 0, playerSpin: 1, alphaSpin: 10 });
    expect(r.outcome).toBe('hurt');
  });

  it('equal totals clash', () => {
    // team 12 + spin 1 + courage 6 = 19 vs 18 + 1 = 19
    const r = resolveBattleRound({ team: 12, playerSpin: 1, alphaSpin: 1 });
    expect(r.outcome).toBe('clash');
  });

  it('natural 10 adds a plasma-blast crit', () => {
    const r = resolveBattleRound({ team: 0, playerSpin: 10, alphaSpin: 1 });
    expect(r.crit).toBe(6);
    expect(r.playerTotal).toBe(0 + 10 + 6 + 6);
  });
});

describe('randomLossIndex', () => {
  it('stays in range', () => {
    for (let i = 0; i < 20; i++) {
      const idx = randomLossIndex(5);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(5);
    }
  });
});
