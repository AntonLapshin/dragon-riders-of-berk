/**
 * Pure Alpha-battle state machine (final-boss fight).
 *
 * The UI (`BattleModal`) only renders HP pips, spins wheels and plays
 * sounds; every rules decision (round math, HP updates, win/loss) is
 * computed here so it is fully unit-testable.
 */

import { resolveBattleRound, teamPower } from '../core/battle';
import type { DragonId } from '../core/constants';

export const PLAYER_START_HP = 3;
export const ALPHA_START_HP = 3;

export type BattleOutcome = 'hit' | 'hurt' | 'clash';
export type BattleResult = 'won' | 'lost' | null;

export interface BattleState {
  team: number;
  playerHp: number;
  alphaHp: number;
  finished: BattleResult;
  lastPlayerTotal: number | null;
  lastAlphaTotal: number | null;
  lastCrit: number;
  lastOutcome: BattleOutcome | null;
}

/** Start a battle for a flock. Pure. */
export function createBattle(dragons: DragonId[]): BattleState {
  return {
    team: teamPower(dragons),
    playerHp: PLAYER_START_HP,
    alphaHp: ALPHA_START_HP,
    finished: null,
    lastPlayerTotal: null,
    lastAlphaTotal: null,
    lastCrit: 0,
    lastOutcome: null,
  };
}

/**
 * Apply one battle round. Pure — spins are supplied by the caller (the UI
 * reads them off the wheels), so tests are deterministic.
 */
export function applyBattleRound(
  battle: BattleState,
  playerSpin: number,
  alphaSpin: number,
): BattleState {
  if (battle.finished) return battle;
  const { playerTotal, alphaTotal, crit, outcome } = resolveBattleRound({
    team: battle.team,
    playerSpin,
    alphaSpin,
  });
  const base = {
    ...battle,
    lastPlayerTotal: playerTotal,
    lastAlphaTotal: alphaTotal,
    lastCrit: crit,
    lastOutcome: outcome,
  };
  if (outcome === 'hit') {
    const alphaHp = battle.alphaHp - 1;
    return { ...base, alphaHp, finished: alphaHp <= 0 ? 'won' : null };
  }
  if (outcome === 'hurt') {
    const playerHp = battle.playerHp - 1;
    return { ...base, playerHp, finished: playerHp <= 0 ? 'lost' : null };
  }
  return base;
}

/** True while further attack spins are allowed. */
export function battleInProgress(battle: BattleState): boolean {
  return battle.finished == null;
}
