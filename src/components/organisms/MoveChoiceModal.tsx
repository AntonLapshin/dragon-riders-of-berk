import { Button } from '../atoms/Button';
import { Modal, ModalTitle } from '../atoms/Modal';

interface MoveChoiceModalProps {
  val: number;
  atStart: boolean;
  playerName: string;
  onPick: (steps: number) => void;
}

/** Post-spin move picker: full wheel value (free) or ±1 (costs next turn). */
export function MoveChoiceModal({ val, atStart, playerName, onPick }: MoveChoiceModalProps) {
  return (
    <Modal className="event-modal move-modal" style={{ ['--ac' as string]: '#f0b429' } as React.CSSProperties}>
      <div className="ev-icon">🎡</div>
      <ModalTitle>
        <span className="ev-title">You spun {val}!</span>
      </ModalTitle>
      <div className="ev-text">
        Choose your move, <b>{playerName}</b>:
      </div>
      <div className="move-opts">
        <Button variant="blue" big sub="FREE — the normal move" onClick={() => onPick(val)}>
          🎡 Go {val} forward
        </Button>
        <Button variant="gold" big sub="COSTS your next turn" onClick={() => onPick(1)}>
          🐾 Go 1 forward
        </Button>
        <Button
          variant="gold"
          big
          sub={atStart ? '— already at Berk Village' : 'COSTS your next turn'}
          disabled={atStart}
          onClick={() => onPick(-1)}
        >
          🐾 Go 1 backward
        </Button>
      </div>
    </Modal>
  );
}
