import { describe, expect, it } from 'vitest';
import { CHALLENGE_SEGS, MAIN_SEGS, BATTLE_SEGS } from './constants';
import { computeSpinTarget, weightedIndex } from './wheels';

describe('weightedIndex', () => {
  it('always lands inside the segments', () => {
    for (let i = 0; i < 50; i++) {
      const idx = weightedIndex(MAIN_SEGS);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(MAIN_SEGS.length);
    }
  });

  it('respects weights deterministically with injected random', () => {
    // total weight of MAIN_SEGS is 10 (all default 1) — r=0 lands on first seg
    expect(weightedIndex(MAIN_SEGS, () => 0)).toBe(0);
    // r just below 1 lands on the last seg
    expect(weightedIndex(MAIN_SEGS, () => 0.9999)).toBe(MAIN_SEGS.length - 1);
  });
});

describe('computeSpinTarget', () => {
  it('advances at least 4 full turns', () => {
    const target = computeSpinTarget(0, MAIN_SEGS, 3, () => 0.5);
    expect(target).toBeGreaterThan(360 * 4);
  });

  it('keeps moving forward from a large rotation', () => {
    const target = computeSpinTarget(5000, BATTLE_SEGS, 0, () => 0.5);
    expect(target).toBeGreaterThan(5000);
  });

  it('lands different segments at different angles', () => {
    const a = computeSpinTarget(0, MAIN_SEGS, 0, () => 0.5);
    const b = computeSpinTarget(0, MAIN_SEGS, 5, () => 0.5);
    expect(a % 360).not.toBeCloseTo(b % 360, 0);
  });

  it('is deterministic for the same inputs', () => {
    expect(computeSpinTarget(10, MAIN_SEGS, 2, () => 0.5)).toBe(
      computeSpinTarget(10, MAIN_SEGS, 2, () => 0.5),
    );
  });
});

describe('weightedIndex edge cases', () => {
  it('falls back for an empty wheel', () => {
    expect(weightedIndex([], () => 0.5)).toBe(-1);
  });

  it('always picks the only segment', () => {
    expect(weightedIndex([MAIN_SEGS[0]], () => 0.99)).toBe(0);
  });

  it('never lands on zero-weight taming outcomes', () => {
    // CHALLENGE_SEGS carries zero-weight filler wedges; only indices
    // 0 (catch), 1 (escape), 3 (trap), 6 (catch+feast) may win.
    const allowed = new Set([0, 1, 3, 6]);
    for (let k = 0; k < 40; k++) {
      expect(allowed.has(weightedIndex(CHALLENGE_SEGS, () => k / 40))).toBe(true);
    }
  });

  it('honors custom weights', () => {
    const segs = [
      { ...MAIN_SEGS[0], weight: 1 },
      { ...MAIN_SEGS[1], weight: 3 },
    ];
    expect(weightedIndex(segs, () => 0)).toBe(0);
    expect(weightedIndex(segs, () => 0.249)).toBe(0);
    expect(weightedIndex(segs, () => 0.26)).toBe(1);
  });
});
