import { describe, expect, it } from 'vitest';
import {
  appendTo,
  clampBoardPos,
  clampValue,
  decideTurnAdvance,
  isForfeitMove,
  moveDestination,
  nextPlayerIndex,
  removeAt,
  stepPath,
} from './utils';

describe('clampValue', () => {
  it('returns the value inside range', () => {
    expect(clampValue(5, 0, 10)).toBe(5);
    expect(clampValue(0, 0, 10)).toBe(0);
    expect(clampValue(10, 0, 10)).toBe(10);
  });

  it('clamps below min', () => {
    expect(clampValue(-3, 0, 58)).toBe(0);
  });

  it('clamps above max', () => {
    expect(clampValue(99, 0, 58)).toBe(58);
  });
});

describe('clampBoardPos', () => {
  it('clamps into [0, last]', () => {
    expect(clampBoardPos(-1, 58)).toBe(0);
    expect(clampBoardPos(59, 58)).toBe(58);
    expect(clampBoardPos(30, 58)).toBe(30);
  });
});

describe('stepPath', () => {
  it('walks forward step by step', () => {
    expect(stepPath(10, 3, 58)).toEqual([11, 12, 13]);
  });

  it('walks backward step by step', () => {
    expect(stepPath(10, -2, 58)).toEqual([9, 8]);
  });

  it('returns no steps for a zero move', () => {
    expect(stepPath(10, 0, 58)).toEqual([]);
  });

  it('stops at the end of the board', () => {
    expect(stepPath(57, 5, 58)).toEqual([58]);
  });

  it('stops at the start of the board', () => {
    expect(stepPath(1, -5, 58)).toEqual([0]);
  });

  it('stays put when already pinned at an edge', () => {
    expect(stepPath(58, 3, 58)).toEqual([]);
    expect(stepPath(0, -3, 58)).toEqual([]);
  });

  it('clamps a starting position outside the board', () => {
    expect(stepPath(-5, 2, 58)).toEqual([1, 2]);
  });
});

describe('moveDestination', () => {
  it('lands on from + steps inside the board', () => {
    expect(moveDestination(10, 4, 58)).toBe(14);
    expect(moveDestination(10, -4, 58)).toBe(6);
  });

  it('clamps overshooting moves', () => {
    expect(moveDestination(56, 9, 58)).toBe(58);
    expect(moveDestination(2, -9, 58)).toBe(0);
  });

  it('stays when no steps move', () => {
    expect(moveDestination(7, 0, 58)).toBe(7);
  });
});

describe('nextPlayerIndex', () => {
  it('rotates to the next player', () => {
    expect(nextPlayerIndex(0, 2)).toBe(1);
  });

  it('wraps around to the first player', () => {
    expect(nextPlayerIndex(1, 2)).toBe(0);
  });

  it('supports more than two players', () => {
    expect(nextPlayerIndex(2, 4)).toBe(3);
    expect(nextPlayerIndex(3, 4)).toBe(0);
  });

  it('stays on the only player', () => {
    expect(nextPlayerIndex(0, 1)).toBe(0);
  });

  it('is safe for a non-positive player count', () => {
    expect(nextPlayerIndex(0, 0)).toBe(0);
    expect(nextPlayerIndex(5, -2)).toBe(0);
  });

  it('normalizes an out-of-range current index', () => {
    expect(nextPlayerIndex(5, 2)).toBe(0);
    expect(nextPlayerIndex(-1, 2)).toBe(0);
  });
});

describe('isForfeitMove', () => {
  it('is false for the full spin value', () => {
    expect(isForfeitMove(4, 4)).toBe(false);
  });

  it('is true for a careful 1-space move', () => {
    expect(isForfeitMove(4, 1)).toBe(true);
  });

  it('is true for a backward 1-space move', () => {
    expect(isForfeitMove(4, -1)).toBe(true);
  });
});

describe('decideTurnAdvance', () => {
  it('extra turn wins and never consumes a pending skip', () => {
    expect(decideTurnAdvance(true, true)).toEqual({ stayCurrent: true, consumeSkip: false });
  });

  it('extra turn alone stays on the same player', () => {
    expect(decideTurnAdvance(true, false)).toEqual({ stayCurrent: true, consumeSkip: false });
  });

  it('pending skip without extra rotates and is consumed', () => {
    expect(decideTurnAdvance(false, true)).toEqual({ stayCurrent: false, consumeSkip: true });
  });

  it('plain turn rotates with nothing consumed', () => {
    expect(decideTurnAdvance(false, false)).toEqual({ stayCurrent: false, consumeSkip: false });
  });
});

describe('removeAt', () => {
  it('removes the indexed element without mutating', () => {
    const src = ['a', 'b', 'c'];
    expect(removeAt(src, 1)).toEqual(['a', 'c']);
    expect(src).toEqual(['a', 'b', 'c']);
  });

  it('removes the first and last elements', () => {
    expect(removeAt([1, 2, 3], 0)).toEqual([2, 3]);
    expect(removeAt([1, 2, 3], 2)).toEqual([1, 2]);
  });
});

describe('appendTo', () => {
  it('appends without mutating', () => {
    const src = [1, 2];
    expect(appendTo(src, 3)).toEqual([1, 2, 3]);
    expect(src).toEqual([1, 2]);
  });
});
