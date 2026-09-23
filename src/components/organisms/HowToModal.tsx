import { ALPHA_BASE, COURAGE, DRAGONS, type PlayerCount } from '../../core/constants';
import { Button } from '../atoms/Button';
import { Modal, ModalSub, ModalTitle } from '../atoms/Modal';

export function HowToModal({ onClose, playerCount }: { onClose: () => void; playerCount?: PlayerCount }) {
  return (
    <Modal className="htp">
      <ModalTitle>📜 HOW TO PLAY</ModalTitle>
      <ModalSub>Dragon Riders of Berk — {playerCount ? `${playerCount} players` : '2–3 players'}, hot-seat</ModalSub>
      <h4>🎯 Goal</h4>
      <ul>
        <li>
          Race from <b>Berk Village</b> to <b>The Alpha&apos;s Lair</b> along the winding path.
        </li>
        <li>
          Collect up to <b>5 dragons</b>, then defeat <b>The Alpha</b> in battle to win.
        </li>
      </ul>
      <h4>🎡 Your Turn — 3 Move Options</h4>
      <ul>
        <li>
          Press <b>SPIN THE WHEEL</b>, then choose one of <b>three options</b>:
        </li>
        <li>🎡 <b>Go the wheel number</b> forward — free, the normal move.</li>
        <li>🐾 <b>Go 1 forward</b> — a careful nudge, but it <b>costs your next turn</b>.</li>
        <li>🐾 <b>Go 1 backward</b> — a daring retreat, but it <b>costs your next turn</b>.</li>
        <li>
          Then resolve the space you land on — every event asks you to confirm with <b>OK</b>.
        </li>
      </ul>
      <h4>🗺️ Spaces</h4>
      <ul>
        <li>🥚 <b>Dragon Nest</b> — a <b>Taming Spin Challenge</b>! CATCH segments win that dragon; ESCAPES drifts you back 2; NET TRAP costs a turn.</li>
        <li>🐟 <b>Fish Feast</b> — spin again!</li>
        <li>🪤 <b>Trapper Net</b> — lose your next turn.</li>
        <li>🌀 <b>Storm Vortex</b> — ride the wind straight to the next dragon nest.</li>
        <li>✦ <b>Safe Skies</b> — nothing happens, enjoy the view.</li>
        <li>🧊 <b>Alpha&apos;s Lair</b> — arrive with <b>at least 1 dragon</b> and the battle begins. Arrive with none and the icy roar blasts you back 8!</li>
      </ul>
      <h4>⚔️ The Final Battle</h4>
      <ul>
        <li>
          Each round: <b>your spin + flock power + Rider&apos;s Courage (+{COURAGE})</b> vs <b>Alpha&apos;s spin + {ALPHA_BASE}</b>.
          Higher total lands a hit; ties do nothing. A natural <b>10</b> is a ⚡ Plasma Blast (+6) — so even a lone dragon has a slim chance!
        </li>
        <li>
          First to <b>3 hits</b> wins the game. A tiny flock has a slim chance — but <b>every dragon you collect makes victory far more likely</b>.
        </li>
        <li>
          If the Alpha wins, your flock scatters: you <b>lose a dragon</b> and are sent <b>all the way back to Berk Village</b>!
        </li>
      </ul>
      <h4>🐉 Dragon Codex</h4>
      <div className="codex">
        {Object.values(DRAGONS).map((d) => (
          <div key={d.name} className="cx">
            <img src={d.img} alt={d.name} />
            <b>{d.name}</b>
            <span>
              {d.species} • ⚡{d.power}
            </span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <Button variant="gold" big className="htp-close" onClick={onClose}>
          LET&apos;S FLY! 🐉
        </Button>
      </div>
    </Modal>
  );
}
