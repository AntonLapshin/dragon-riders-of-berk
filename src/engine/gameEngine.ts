/**
 * Pure game engine: every rule decision lives here.
 *
 * Layering: UI (`src/components`, `src/hooks`) => Game Engine
 * (`src/engine/*`, `src/core/*`) => Util (`src/engine/utils.ts`).
 *
 * This module is 100% pure: no React, no DOM, no sound, no timers, no
 * `Math.random` (randomness is injected by callers so tests are
 * deterministic). The UI layer (`useGame`, modals) only animates movement,
 * shows dialogs, and feeds the player's choices back into these functions.
 *
 * Fixed bugs (covered by regression tests):
 * 1. `decideTurnAdvance` — an earned extra turn (fish feast / old friend /
 *    catch+feast) is taken FIRST and never consumes a pending skip. The old
 *    UI consumed the skip on the extra turn itself, so "catch a dragon via
 *    fish but don't move again" happened whenever a ±1 forfeit skip was
 *    already pending.
 * 2. `classifyTile` + driver loop — retreat moves (nest escape −2, lair
 *    repel −8) MUST re-resolve the destination tile. The old UI stopped
 *    after the backward walk, so a trap landed on while going backwards
 *    never skipped, and a feast never granted its extra spin.
 */

import { MAX_DRAGONS, type DragonId, type PlayerState } from '../core/constants';
import { nextNest } from '../core/board';
import { decideTurnAdvance, nextPlayerIndex } from './utils';
import type { TurnAdvance } from './utils';

export type { TurnAdvance };
export { decideTurnAdvance, nextPlayerIndex };

export type SkipWhy = 'net' | 'choice';
export type ChallengeKey = 'catch' | 'catchfeast' | 'escape' | 'trap';

/** Maximum storm-ride chain depth before the storm fizzles. */
export const MAX_STORM_DEPTH = 2;
/** Steps the rider drifts back when a wild dragon escapes. */
export const ESCAPE_RETREAT = 2;
/** Steps the Alpha's roar blasts back a dragon-less rider. */
export const LAIR_REPEL_STEPS = 8;

export type TileTaskKind =
  | 'safe'
  | 'trap'
  | 'feast'
  | 'stormRide'
  | 'stormFizzle'
  | 'nestOwned'
  | 'nestFull'
  | 'nestChallenge'
  | 'lairBattle'
  | 'lairRepel'
  | 'start'
  | 'done';

export interface TileTask {
  kind: TileTaskKind;
  /** Storm destination tile (stormRide only). */
  stormTo?: number;
}

export interface NestChallengeResult {
  player: PlayerState;
  /** True when the taming spin grants an extra turn (catch+feast). */
  extraGranted: boolean;
  /** Steps to walk backwards after the outcome (escape only). */
  retreatBy: number;
}

export interface BattleDefeatResult {
  player: PlayerState;
  lostDragon: DragonId | null;
}

export interface TurnAdvanceInput {
  extraGranted: boolean;
  skipPending: boolean;
}

export interface AdvancedTurn {
  /** Player index whose turn is next. */
  nextCurrent: number;
  /** Whether the next turn is an extra turn (stayed on same player). */
  isExtra: boolean;
  /** Whether a pending skip was consumed by this advance. */
  consumedSkip: boolean;
}

/**
 * Classify the tile at `pos`: what the UI must do next. Pure — the UI
 * performs animation/dialogs and calls the matching `apply*` function.
 */
export function classifyTile(
  type: string,
  opts: {
    player: PlayerState;
    pos: number;
    dragonId?: DragonId | null;
    stormDepth?: number;
    stormTo?: number | null;
  },
): TileTask {
  switch (type) {
    case 'safe':
      return { kind: 'safe' };
    case 'trap':
      return { kind: 'trap' };
    case 'feast':
      return { kind: 'feast' };
    case 'storm': {
      const depth = opts.stormDepth ?? 0;
      // `undefined` computes the next nest; an explicit `null` forces the
      // fizzle branch (used by tests and by callers with no target).
      const target = opts.stormTo === undefined ? nextNest(opts.pos) : opts.stormTo;
      if (depth >= MAX_STORM_DEPTH || target == null) return { kind: 'stormFizzle' };
      return { kind: 'stormRide', stormTo: target };
    }
    case 'nest':
      return classifyNest(opts.player, opts.dragonId ?? null);
    case 'lair':
      return opts.player.dragons.length >= 1 ? { kind: 'lairBattle' } : { kind: 'lairRepel' };
    case 'start':
      return { kind: 'start' };
    default:
      return { kind: 'done' };
  }
}

/** Classify a nest tile given the visiting player and its dragon. */
export function classifyNest(player: PlayerState, dragonId: DragonId | null): TileTask {
  if (dragonId == null) return { kind: 'done' };
  if (player.dragons.includes(dragonId)) return { kind: 'nestOwned' };
  if (player.dragons.length >= MAX_DRAGONS) return { kind: 'nestFull' };
  return { kind: 'nestChallenge' };
}

/** True when the post-spin move choice forfeits the next turn. */
export function moveChoiceForfeits(spinVal: number, chosenSteps: number): boolean {
  return chosenSteps !== spinVal;
}

/** Return a copy of `player` with a pending skip. */
export function grantSkip(player: PlayerState, why: SkipWhy): PlayerState {
  return { ...player, skip: true, skipWhy: why };
}

/** Return a copy of `player` with any pending skip cleared. */
export function clearSkip(player: PlayerState): PlayerState {
  return { ...player, skip: false, skipWhy: null };
}

/** Return a copy of `player` moved to `dest`. */
export function placeAt(player: PlayerState, dest: number): PlayerState {
  return { ...player, pos: dest };
}

/**
 * Apply a taming-spin outcome. Pure: returns the updated player plus flags
 * the UI driver translates into animation/modals/log.
 */
export function applyNestChallenge(
  player: PlayerState,
  dragonId: DragonId,
  key: ChallengeKey,
): NestChallengeResult {
  if (key === 'catch') {
    return { player: { ...player, dragons: [...player.dragons, dragonId] }, extraGranted: false, retreatBy: 0 };
  }
  if (key === 'catchfeast') {
    return { player: { ...player, dragons: [...player.dragons, dragonId] }, extraGranted: true, retreatBy: 0 };
  }
  if (key === 'escape') {
    return { player, extraGranted: false, retreatBy: ESCAPE_RETREAT };
  }
  return { player: grantSkip(player, 'net'), extraGranted: false, retreatBy: 0 };
}

/**
 * Apply a lost Alpha battle: drop one dragon (by index) from the flock.
 * The caller picks the index (e.g. via `randomLossIndex`) so this stays pure.
 */
export function applyBattleDefeat(player: PlayerState, lossIndex: number | null): BattleDefeatResult {
  if (lossIndex == null || lossIndex < 0 || lossIndex >= player.dragons.length) {
    return { player, lostDragon: null };
  }
  const lostDragon = player.dragons[lossIndex];
  return {
    player: { ...player, dragons: player.dragons.filter((_, j) => j !== lossIndex) },
    lostDragon,
  };
}

/**
 * Advance the turn, arbitrating an earned extra turn against a pending skip.
 * Extra always wins and never consumes the skip (it stays pending for the
 * turn after the extra). See `decideTurnAdvance` in `./utils`.
 */
export function advanceTurn(
  current: number,
  playerCount: number,
  input: TurnAdvanceInput,
): AdvancedTurn {
  const playerCountSafe = playerCount > 0 ? playerCount : 1;
  const skipPending = input.skipPending;
  const decision = decideTurnAdvance(input.extraGranted, skipPending);
  if (decision.stayCurrent) {
    return { nextCurrent: current, isExtra: true, consumedSkip: false };
  }
  return {
    nextCurrent: nextPlayerIndex(current, playerCountSafe),
    isExtra: false,
    consumedSkip: decision.consumeSkip,
  };
}

/**
 * Simulate one full backward/forward chained walk for tests: starting from
 * `from`, walk `steps` (clamped to `[0, last]`), then — when `resolveAfter`
 * returns a follow-up walk (e.g. storm ride, escape retreat, lair repel) —
 * keep chaining. Guards against infinite loops via `maxHops`.
 */
export function chainWalks(
  from: number,
  steps: number,
  last: number,
  resolveAfter: (pos: number) => number | null,
  maxHops = 8,
): number {
  let pos = Math.max(0, Math.min(last, from + steps));
  for (let hop = 0; hop < maxHops; hop++) {
    const follow = resolveAfter(pos);
    if (follow == null) return pos;
    pos = Math.max(0, Math.min(last, follow));
  }
  return pos;
}
