import type { RefObject } from 'react';
import { MAIN_SEGS, type PlayerState } from '../../core/constants';
import { Button } from '../atoms/Button';
import { TurnHeader } from '../molecules/TurnHeader';
import { Wheel, type WheelHandle } from '../molecules/Wheel';

interface TurnPanelProps {
  player: PlayerState;
  messageHtml: string;
  wheelRef: RefObject<WheelHandle | null>;
  spinDisabled: boolean;
  onSpin: () => void;
}

/** Turn card: header + main wheel + spin button (organism). */
export function TurnPanel({ player, messageHtml, wheelRef, spinDisabled, onSpin }: TurnPanelProps) {
  return (
    <div className="card">
      <TurnHeader player={player} messageHtml={messageHtml} />
      <div className="wheel-mount">
        <Wheel ref={wheelRef} segs={MAIN_SEGS} label="Move wheel" />
      </div>
      <Button variant="gold" big disabled={spinDisabled} onClick={onSpin}>
        🎡 SPIN THE WHEEL
      </Button>
    </div>
  );
}
