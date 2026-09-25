import { useRef, useState } from 'react';
import { CHALLENGE_SEGS, DRAGONS, MAX_DRAGONS, type DragonId } from '../../core/constants';
import { sound } from '../../lib/sound';
import { Button } from '../atoms/Button';
import { Modal, ModalSub, ModalTitle } from '../atoms/Modal';
import { Wheel, type WheelHandle } from '../molecules/Wheel';
import type { ChallengeKey } from '../../hooks/useGame';

interface ChallengeModalProps {
  dragonId: DragonId;
  playerName: string;
  onDone: (key: ChallengeKey) => void;
}

/** Taming Spin Challenge dialog with its own wheel (organism). */
export function ChallengeModal({ dragonId, playerName, onDone }: ChallengeModalProps) {
  const dragon = DRAGONS[dragonId];
  const wheelRef = useRef<WheelHandle>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ key: ChallengeKey; icon: string; text: string; desc: string } | null>(null);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    const idx = await wheelRef.current?.spin(3.4);
    if (idx == null) {
      setSpinning(false);
      return;
    }
    const seg = CHALLENGE_SEGS[idx];
    const key = seg.key as ChallengeKey;
    if (key === 'catch' || key === 'catchfeast') sound.good();
    else sound.bad();
    setResult({ key, icon: seg.icon ?? '🐉', text: seg.text ?? '', desc: seg.desc ?? '' });
  };

  return (
    <Modal className="challenge-modal">
      <ModalTitle>🥚 WILD DRAGON SIGHTED!</ModalTitle>
      <ModalSub>
        <>A Taming Spin Challenge awaits, {playerName}!</>
      </ModalSub>
      <div className="cm-body">
        <img className="cm-dragon" src={dragon.img} alt={dragon.name} />
        <div className="cm-info">
          <h3>{dragon.name}</h3>
          <div className="cm-species">
            {dragon.species} • Power {dragon.power}
          </div>
          <p>
            Spin the <b>Taming Wheel</b>. Land on CATCH to befriend {dragon.name} (flock max: {MAX_DRAGONS})!
          </p>
          <div className="cm-wheel">
            <Wheel ref={wheelRef} segs={CHALLENGE_SEGS} maxWidth={190} label="Taming wheel" />
          </div>
          <div className="cm-action">
            {!result && (
              <Button variant="gold" big disabled={spinning} onClick={spin}>
                🎡 SPIN THE TAMING WHEEL
              </Button>
            )}
            {result && (
              <div className="cm-result">
                <div className={`cm-res ${result.key}`}>
                  {result.icon} {result.text}
                  <span>{result.desc}</span>
                </div>
                <Button variant="gold" onClick={() => onDone(result.key)}>
                  OK ➤
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
