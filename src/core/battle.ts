/** Pure battle math + flock helpers (no React, no DOM). */
import { ALPHA_BASE, COURAGE, DRAGONS, type DragonId } from './constants';

export function teamPower(dragons: DragonId[]): number {
  return dragons.reduce((a, id) => a + DRAGONS[id].power, 0);
}

export interface BattleRoundInput {
  team: number;
  playerSpin: number; // 1..10
  alphaSpin: number; // 1..10
}

export interface BattleRoundResult {
  playerTotal: number;
  alphaTotal: number;
  crit: number;
  outcome: 'hit' | 'hurt' | 'clash';
}

/** One battle round: your spin + flock + courage (+plasma blast on nat 10) vs Alpha. */
export function resolveBattleRound({ team, playerSpin, alphaSpin }: BattleRoundInput): BattleRoundResult {
  const crit = playerSpin === 10 ? 6 : 0;
  const playerTotal = team + playerSpin + COURAGE + crit;
  const alphaTotal = ALPHA_BASE + alphaSpin;
  const outcome = playerTotal > alphaTotal ? 'hit' : alphaTotal > playerTotal ? 'hurt' : 'clash';
  return { playerTotal, alphaTotal, crit, outcome };
}

/** Pick a random dragon index to lose (pure w/ injected random). */
export function randomLossIndex(length: number, random = Math.random): number {
  return Math.floor(random() * length);
}
