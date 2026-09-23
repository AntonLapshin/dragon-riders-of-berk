import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { WheelSeg } from '../../core/constants';
import { computeSpinTarget, weightedIndex } from '../../core/wheels';
import { sound } from '../../lib/sound';
import { sleep } from '../../utils/sleep';

export interface WheelHandle {
  /** Spin the wheel; resolves with the winning segment index. */
  spin: (dur?: number) => Promise<number | null>;
}

interface WheelProps {
  segs: WheelSeg[];
  hub?: string;
  maxWidth?: number;
  label?: string;
}

/**
 * Spinning prize wheel (molecule). The whole rotor — wedges + labels —
 * rotates as one element so labels always stay glued to their wedge.
 */
export const Wheel = forwardRef<WheelHandle, WheelProps>(function Wheel(
  { segs, hub = '🐉', maxWidth = 252, label },
  ref,
) {
  const [rotation, setRotation] = useState(0);
  const [transition, setTransition] = useState('none');
  const rotRef = useRef(0);
  const spinningRef = useRef(false);
  const tickTimer = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    async spin(dur = 4.2): Promise<number | null> {
      if (spinningRef.current) return null;
      spinningRef.current = true;
      const idx = weightedIndex(segs);
      const target = computeSpinTarget(rotRef.current, segs, idx);
      rotRef.current = target;

      let delay = 70;
      const tickLoop = () => {
        sound.tick();
        delay *= 1.13;
        if (delay < 430) tickTimer.current = window.setTimeout(tickLoop, delay);
      };
      tickLoop();
      setTransition(`transform ${dur}s cubic-bezier(.12,.72,.16,1)`);
      setRotation(target);
      await sleep(dur * 1000 + 120);
      if (tickTimer.current) window.clearTimeout(tickTimer.current);
      spinningRef.current = false;
      return idx;
    },
  }));

  const n = segs.length;
  const segA = 360 / n;

  return (
    <div className="wheel" style={{ maxWidth }} aria-label={label ?? 'Spinning wheel'}>
      <div
        className="wheel-rotor"
        style={{ transform: `rotate(${rotation}deg)`, transition }}
      >
        <svg viewBox="0 0 200 200">
          {segs.map((s, i) => {
            const a0 = ((i * segA - 90) * Math.PI) / 180;
            const a1 = (((i + 1) * segA - 90) * Math.PI) / 180;
            const cx = 100;
            const cy = 100;
            const r = 98;
            const x0 = cx + r * Math.cos(a0);
            const y0 = cy + r * Math.sin(a0);
            const x1 = cx + r * Math.cos(a1);
            const y1 = cy + r * Math.sin(a1);
            return (
              <path
                key={i}
                d={`M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`}
                fill={s.color}
                stroke="rgba(8,12,22,.6)"
                strokeWidth="1.6"
              />
            );
          })}
          <circle cx="100" cy="100" r="99" fill="none" stroke="#f0b429" strokeWidth="3" />
        </svg>
        {segs.map((s, i) => (
          <div key={i} className="wl" style={{ transform: `rotate(${i * segA + segA / 2}deg)` }}>
            {s.icon ? (
              <span>
                <i className="wl-ico">{s.icon}</i>
                <em className="wl-txt">{s.text}</em>
              </span>
            ) : (
              <span className="wl-num">{s.label}</span>
            )}
          </div>
        ))}
      </div>
      <div className="wheel-pointer" />
      <div className="wheel-hub">{hub}</div>
    </div>
  );
});
