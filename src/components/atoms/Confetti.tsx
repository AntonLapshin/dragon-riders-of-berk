import { useMemo } from 'react';

const COLORS = ['#f0b429', '#39d98a', '#4dd7fe', '#ff5d5d', '#8a63d2', '#ffd766'];

/** Victory confetti burst (atom). Renders 90 falling pieces, self-cleaned by parent. */
export function Confetti({ count = 90 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${Math.random() * 100}vw`,
        background: COLORS[i % COLORS.length],
        duration: `${(2.4 + Math.random() * 2.4).toFixed(2)}s`,
        delay: `${(Math.random() * 1.2).toFixed(2)}s`,
        rotate: Math.random() * 360,
      })),
    [count],
  );
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <i
          key={i}
          style={{
            left: p.left,
            background: p.background,
            animationDuration: p.duration,
            animationDelay: p.delay,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
