/** Pure wheel math: weighted picks + spin-target geometry (no DOM). */
import type { WheelSeg } from './constants';

/** Pick a segment index, honoring optional `weight` (default 1). */
export function weightedIndex(segs: WheelSeg[], random = Math.random): number {
  const tot = segs.reduce((a, s) => a + (s.weight || 1), 0);
  let r = random() * tot;
  for (let i = 0; i < segs.length; i++) {
    r -= segs[i].weight || 1;
    if (r < 0) return i;
  }
  return segs.length - 1;
}

export interface SpinTarget {
  index: number;
  target: number;
}

/**
 * Compute the rotor rotation that lands segment `index` under the top pointer,
 * continuing forward from `rot` with at least 4 full turns. Pure — the caller
 * animates `target` with CSS.
 */
export function computeSpinTarget(
  rot: number,
  segs: WheelSeg[],
  index: number,
  random = Math.random,
): number {
  const n = segs.length;
  const segA = 360 / n;
  const c = index * segA + segA / 2;
  const jitter = (random() - 0.5) * segA * 0.55;
  const base = (((360 - c) % 360) + 360) % 360;
  const minRot = rot + 360 * 4 + random() * 160;
  const k = Math.ceil((minRot - base) / 360);
  return base + 360 * k + jitter;
}
