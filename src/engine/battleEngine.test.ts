import { describe, expect, it } from 'vitest';
import {
  ALPHA_START_HP,
  PLAYER_START_HP,
  applyBattleRound,
  battleInProgress,
  createBattle,
} from './battleEngine';

describe('createBattle', () => {
  it('starts fresh with full HP and flock power', () => {
    const b = createBattle(['meatlug', 'toothless']);
    expect(b.team).toBe(2 + 5);
    expect(b.playerHp).toBe(PLAYER_START_HP);
    expect(b.alphaHp).toBe(ALPHA_START_HP);
    expect(b.finished).toBeNull();
    expect(b.lastOutcome).toBeNull();
    expect(battleInProgress(b)).toBe(true);
  });

  it('starts scoreless for a dragon-less flock', () => {
    expect(createBattle([]).team).toBe(0);
  });
});

describe('applyBattleRound', () => {
  it('lands a hit on a stronger total', () => {
    // team 10 + spin 8 + courage 6 = 24 vs 18 + 1 = 19
    const strong = { ...createBattle(['toothless', 'hookfang', 'cloudjumper']), team: 10 };
    const hit = applyBattleRound(strong, 8, 1);
    expect(hit.lastOutcome).toBe('hit');
    expect(hit.alphaHp).toBe(ALPHA_START_HP - 1);
    expect(hit.playerHp).toBe(PLAYER_START_HP);
    expect(hit.lastPlayerTotal).toBe(10 + 8 + 6);
    expect(hit.lastAlphaTotal).toBe(18 + 1);
    expect(battleInProgress(hit)).toBe(true);
  });

  it('takes a hurt on a weaker total', () => {
    const hurt = applyBattleRound(createBattle([]), 1, 10);
    expect(hurt.lastOutcome).toBe('hurt');
    expect(hurt.playerHp).toBe(PLAYER_START_HP - 1);
    expect(hurt.alphaHp).toBe(ALPHA_START_HP);
  });

  it('clashes on equal totals with no damage', () => {
    // team 12 + 1 + 6 = 19 vs 18 + 1 = 19
    const clash = applyBattleRound({ ...createBattle([]), team: 12 }, 1, 1);
    expect(clash.lastOutcome).toBe('clash');
    expect(clash.playerHp).toBe(PLAYER_START_HP);
    expect(clash.alphaHp).toBe(ALPHA_START_HP);
  });

  it('records a plasma-blast crit on a natural 10', () => {
    const crit = applyBattleRound(createBattle([]), 10, 1);
    expect(crit.lastCrit).toBe(6);
    expect(crit.lastPlayerTotal).toBe(0 + 10 + 6 + 6);
  });

  it('records no crit otherwise', () => {
    expect(applyBattleRound(createBattle([]), 9, 1).lastCrit).toBe(0);
  });

  it('wins when the Alpha loses its last HP', () => {
    let b = createBattle([]);
    b = { ...b, team: 20, alphaHp: 1 };
    const won = applyBattleRound(b, 5, 1);
    expect(won.finished).toBe('won');
    expect(won.alphaHp).toBe(0);
    expect(battleInProgress(won)).toBe(false);
  });

  it('loses when the rider loses their last HP', () => {
    let b = createBattle([]);
    b = { ...b, playerHp: 1 };
    const lost = applyBattleRound(b, 1, 10);
    expect(lost.finished).toBe('lost');
    expect(lost.playerHp).toBe(0);
    expect(battleInProgress(lost)).toBe(false);
  });

  it('freezes a finished battle', () => {
    let b = createBattle([]);
    b = { ...b, team: 20, alphaHp: 1 };
    const won = applyBattleRound(b, 5, 1);
    expect(applyBattleRound(won, 5, 1)).toBe(won);
    const lostBase = { ...createBattle([]), playerHp: 1, finished: null as null };
    const lost = applyBattleRound(lostBase, 1, 10);
    expect(applyBattleRound(lost, 1, 1)).toBe(lost);
  });

  it('does not mutate the input state', () => {
    const before = createBattle(['meatlug']);
    const snapshot = { ...before };
    applyBattleRound(before, 8, 1);
    expect(before).toEqual(snapshot);
  });
});

describe('battleInProgress', () => {
  it('is false once finished', () => {
    expect(battleInProgress({ ...createBattle([]), finished: 'won' })).toBe(false);
    expect(battleInProgress({ ...createBattle([]), finished: 'lost' })).toBe(false);
  });
});
