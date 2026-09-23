import { describe, expect, it } from 'vitest';
import { clampPan, panForTile } from '../../components/mobile/MobileBoard';

describe('mobile board pan math', () => {
  it('keeps the zoomed board covering the viewport', () => {
    // View 400x600, board 760x760 (zoom 1.9): x in [-360, 0], y in [-160, 0].
    expect(clampPan(50, 50, 400, 600, 760, 760)).toEqual({ x: 0, y: 0 });
    expect(clampPan(-500, -500, 400, 600, 760, 760)).toEqual({ x: -360, y: -160 });
    expect(clampPan(-100, -80, 400, 600, 760, 760)).toEqual({ x: -100, y: -80 });
  });

  it('centers a tile when possible', () => {
    const tile = { i: 0, x: 50, y: 50, type: 'safe' } as never;
    // Tile center at (380, 380); viewport center (200, 300) -> pan (-180, -80), inside bounds.
    expect(panForTile(tile, 400, 600, 760, 760)).toEqual({ x: -180, y: -80 });
  });
});
