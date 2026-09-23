import { describe, expect, it } from 'vitest';
import { MAIN_SEGS, BATTLE_SEGS } from './constants';
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
});
