import { DRAGONS, type PlayerState } from '../../core/constants';
import { Button } from '../atoms/Button';
import { Confetti } from '../atoms/Confetti';
import { Modal } from '../atoms/Modal';

interface WinModalProps {
  winner: PlayerState;
  onPlayAgain: () => void;
}

/** Victory celebration (organism). */
export function WinModal({ winner, onPlayAgain }: WinModalProps) {
  return (
    <>
      <Confetti />
      <Modal className="win-modal">
        <div className="wm-crown">👑</div>
        <h2>{winner.name.toUpperCase()} IS THE ALPHA OF BERK!</h2>
        <img className="wm-avatar" src={winner.avatar} alt={winner.name} />
        <div className="wm-dragons">
          {winner.dragons.map((id, i) => (
            <img
              key={`${id}-${i}`}
              style={{ animationDelay: `${0.15 * i}s` }}
              src={DRAGONS[id].img}
              title={DRAGONS[id].name}
              alt={DRAGONS[id].name}
            />
          ))}
        </div>
        <p>With the Glacial Tyrant defeated, peace — and endless fish — return to the Barbaric Archipelago. Skål! 🍻</p>
        <Button variant="gold" big onClick={onPlayAgain}>
          🐉 PLAY AGAIN
        </Button>
      </Modal>
    </>
  );
}
