import { IMG, type PlayerCount } from '../../core/constants';
import { Button } from '../atoms/Button';
import { Modal, ModalSub, ModalTitle } from '../atoms/Modal';

interface PlayerSetupModalProps {
  onPick: (count: PlayerCount) => void;
}

/** Opening setup: choose 2 riders or 3 (Stoick joins) — organism. */
export function PlayerSetupModal({ onPick }: PlayerSetupModalProps) {
  return (
    <Modal className="setup-modal">
      <ModalTitle>🐉 CHOOSE YOUR SAGA</ModalTitle>
      <ModalSub>Dragon Riders of Berk — hot-seat multiplayer</ModalSub>
      <div className="setup-opts">
        <div className="setup-opt">
          <div className="setup-avatars">
            <img src={IMG.hiccup} alt="Hiccup" />
            <img src={IMG.astrid} alt="Astrid" />
          </div>
          <div className="setup-name">2 Players</div>
          <div className="setup-desc">
            <b>Hiccup</b> vs <b>Astrid</b> — the classic duel for the Alpha.
          </div>
          <Button variant="gold" big onClick={() => onPick(2)}>
            PLAY WITH 2
          </Button>
        </div>
        <div className="setup-opt">
          <div className="setup-avatars">
            <img src={IMG.hiccup} alt="Hiccup" />
            <img src={IMG.astrid} alt="Astrid" />
            <img src={IMG.stoick} alt="Stoick" />
          </div>
          <div className="setup-name">3 Players</div>
          <div className="setup-desc">
            <b>Hiccup</b> vs <b>Astrid</b> vs <b>Stoick</b> — the chief joins the hunt!
          </div>
          <Button variant="blue" big onClick={() => onPick(3)}>
            PLAY WITH 3
          </Button>
        </div>
      </div>
    </Modal>
  );
}
