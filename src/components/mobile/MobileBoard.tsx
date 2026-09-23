import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { PlayerState } from '../../core/constants';
import type { Tile } from '../../core/board';
import { Board } from '../organisms/Board';

export interface MobileBoardHandle {
  /** Center the viewport on a board tile (percent coords). */
  focusTile: (tile: Tile, animate?: boolean) => void;
  focusCurrent: () => void;
}

interface MobileBoardProps {
  tiles: Tile[];
  players: PlayerState[];
  current: number;
  highlight: number | null;
  fadeToken: number | null;
  /** Board zoom: 1 = whole board visible, >1 = cropped + pannable. */
  zoom?: number;
}

function clamp(v: number, min: number, max: number): number {
  if (min > max) return (min + max) / 2;
  return Math.min(max, Math.max(min, v));
}

export function clampPan(
  x: number,
  y: number,
  viewW: number,
  viewH: number,
  boardW: number,
  boardH: number,
): { x: number; y: number } {
  // Board is larger than the viewport when zoomed: pan keeps it covering.
  const minX = Math.min(0, viewW - boardW);
  const minY = Math.min(0, viewH - boardH);
  return { x: clamp(x, minX, 0), y: clamp(y, minY, 0) };
}

export function panForTile(
  tile: Tile,
  viewW: number,
  viewH: number,
  boardW: number,
  boardH: number,
): { x: number; y: number } {
  const tx = (tile.x / 100) * boardW;
  const ty = (tile.y / 100) * boardH;
  return clampPan(viewW / 2 - tx, viewH / 2 - ty, viewW, viewH, boardW, boardH);
}

/**
 * Pannable mobile board viewport. The board is rendered zoomed-in so only a
 * part is visible; drag vertically (or horizontally) to explore. Automatically
 * follows the current rider unless the user recently dragged the board.
 */
export const MobileBoard = forwardRef<MobileBoardHandle, MobileBoardProps>(function MobileBoard(
  { tiles, players, current, highlight, fadeToken, zoom = 1.9 },
  ref,
) {
  const viewRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [animate, setAnimate] = useState(true);
  const panRef = useRef(pan);
  const lastTouchRef = useRef<number>(0);
  const dragState = useRef<{ sx: number; sy: number; ox: number; oy: number; pid: number } | null>(null);
  panRef.current = pan;

  const measure = useCallback(() => {
    const el = viewRef.current;
    if (!el) return null;
    const viewW = el.clientWidth;
    const viewH = el.clientHeight;
    const boardW = viewW * zoom;
    const boardH = boardW; // square board
    return { viewW, viewH, boardW, boardH };
  }, [zoom]);

  const applyFocus = useCallback(
    (tile: Tile, animated = true) => {
      const m = measure();
      if (!m) return;
      const next = panForTile(tile, m.viewW, m.viewH, m.boardW, m.boardH);
      setAnimate(animated);
      setPan(next);
    },
    [measure],
  );

  const focusCurrent = useCallback(() => {
    const p = players[current];
    const tile = tiles[p?.pos ?? 0];
    if (tile) applyFocus(tile, true);
  }, [players, current, tiles, applyFocus]);

  useImperativeHandle(ref, () => ({ focusTile: applyFocus, focusCurrent }), [applyFocus, focusCurrent]);

  // Initial centering on Berk, then follow the current rider's moves.
  useEffect(() => {
    const t = window.setTimeout(() => focusCurrent(), 60);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const followedPos = players[current]?.pos;
  useEffect(() => {
    // Don't yank the board while the user is exploring; resume follow shortly after.
    if (Date.now() - lastTouchRef.current < 2500) return;
    if (dragging) return;
    const tile = tiles[followedPos ?? 0];
    if (tile) applyFocus(tile, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followedPos, current]);

  // Keep pan valid on rotate/resize.
  useEffect(() => {
    const onResize = () => {
      const m = measure();
      if (!m) return;
      setPan((p) => clampPan(p.x, p.y, m.viewW, m.viewH, m.boardW, m.boardH));
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [measure]);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = viewRef.current;
    if (!el) return;
    el.setPointerCapture?.(e.pointerId);
    dragState.current = { sx: e.clientX, sy: e.clientY, ox: panRef.current.x, oy: panRef.current.y, pid: e.pointerId };
    setDragging(true);
    setAnimate(false);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragState.current;
    const m = measure();
    if (!d || !m || e.pointerId !== d.pid) return;
    const nx = d.ox + (e.clientX - d.sx);
    const ny = d.oy + (e.clientY - d.sy);
    setPan(clampPan(nx, ny, m.viewW, m.viewH, m.boardW, m.boardH));
  };

  const endDrag = (e: React.PointerEvent) => {
    if (dragState.current && e.pointerId === dragState.current.pid) {
      dragState.current = null;
      setDragging(false);
      setAnimate(true);
      lastTouchRef.current = Date.now();
    }
  };

  const m = viewRef.current
    ? { w: viewRef.current.clientWidth * zoom }
    : null;

  return (
    <div
      ref={viewRef}
      className={`m-board-view${dragging ? ' dragging' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className="m-board-inner"
        style={{
          width: `${zoom * 100}%`,
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
          transition: animate ? 'transform .45s ease' : 'none',
          // Keep an accessible size before first measure.
          minWidth: m ? undefined : `${zoom * 100}%`,
        }}
      >
        <Board tiles={tiles} players={players} highlight={highlight} fadeToken={fadeToken} />
      </div>
      <div className="m-drag-hint">⋮⋮ drag to explore ⋮⋮</div>
    </div>
  );
});
