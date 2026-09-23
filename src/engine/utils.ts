/**
 * Pure generic helpers shared by the game engine.
 *
 * Layering: UI (`src/components`, `src/hooks`) => Game Engine
 * (`src/engine`, `src/core`) => Util (`src/engine/utils`, `src/utils`).
 *
 * Everything in this file is pure (no React, DOM, sound, timers, or
 * randomness unless injected) so it is trivially unit-testable.
 */

/** Clamp `v` into the inclusive range `[min, max]`. */
export function clampValue(v: number, min: number, max: number): number {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

/** Clamp a board position into `[0, last]`. */
export function clampBoardPos(pos: number, last: number): number {
  return clampValue(pos, 0, last);
}

/**
 * Step-by-step positions visited when walking `steps` tiles from `from`,
 * stopping early at the board edges. Used by the UI to animate movement.
 * Pure — the engine decides the destination, the UI animates this path.
 */
export function stepPath(from: number, steps: number, last: number): number[] {
  const dir = steps >= 0 ? 1 : -1;
  const path: number[] = [];
  let pos = clampBoardPos(from, last);
  for (let i = 0; i < Math.abs(steps); i++) {
    const next = clampBoardPos(pos + dir, last);
    if (next === pos) break;
    path.push(next);
    pos = next;
  }
  return path;
}

/** Final destination after walking `steps` from `from` (clamped). */
export function moveDestination(from: number, steps: number, last: number): number {
  const path = stepPath(from, steps, last);
  return path.length > 0 ? path[path.length - 1] : clampBoardPos(from, last);
}

/** Index of the next player in a hot-seat rotation. */
export function nextPlayerIndex(current: number, count: number): number {
  if (count <= 0) return 0;
  const norm = ((current % count) + count) % count;
  return (norm + 1) % count;
}

/** True when the chosen move forfeits the next turn (anything but the full spin). */
export function isForfeitMove(spinVal: number, chosenSteps: number): boolean {
  return chosenSteps !== spinVal;
}

export interface TurnAdvance {
  /** Stay on the current player (extra turn) instead of rotating. */
  stayCurrent: boolean;
  /** Whether a pending skip is consumed by this advance. */
  consumeSkip: boolean;
}

/**
 * Decide how the turn advances when an extra turn and/or a pending skip
 * coexist.
 *
 * Rule (prevents the reported "fish extra never happens" bug): an earned
 * extra turn is always taken first and NEVER consumes a pending skip — the
 * skip stays pending and is served on the following turn. Without an extra
 * turn, a pending skip is consumed and the turn rotates.
 */
export function decideTurnAdvance(extraGranted: boolean, skipPending: boolean): TurnAdvance {
  if (extraGranted) return { stayCurrent: true, consumeSkip: false };
  if (skipPending) return { stayCurrent: false, consumeSkip: true };
  return { stayCurrent: false, consumeSkip: false };
}

/** Remove the element at `index`, returning a new array (no mutation). */
export function removeAt<T>(arr: readonly T[], index: number): T[] {
  return arr.filter((_, j) => j !== index);
}

/** Append an element, returning a new array (no mutation). */
export function appendTo<T>(arr: readonly T[], item: T): T[] {
  return [...arr, item];
}
