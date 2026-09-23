import { useEffect, useRef, useState } from 'react';
import { ALPHA_BASE, BATTLE_SEGS, COURAGE, IMG, type PlayerState } from '../../core/constants';
import { applyBattleRound, battleInProgress, createBattle } from '../../engine/battleEngine';
import { sound } from '../../lib/sound';
import { sleep } from '../../utils/sleep';
import { Button } from '../atoms/Button';
import { Modal, ModalSub, ModalTitle } from '../atoms/Modal';
import { HealthPips } from '../molecules/HealthPips';
import { Wheel, type WheelHandle } from '../molecules/Wheel';

interface BattleModalProps {
  player: PlayerState;
  onLog: (html: string, color: string) => void;
  onEnd: (won: boolean) => void;
}

/** Final-boss battle dialog: spin vs the Alpha, first to 3 hits (organism).
 *
 * Rendering only — every rule (round math, HP, win/loss) is computed by
 * `src/engine/battleEngine.ts`.
 */
export function BattleModal({ player, onLog, onEnd }: BattleModalProps) {
  const [battle, setBattle] = useState(() => createBattle(player.dragons));
  const team = battle.team;
  const wheelRef = useRef<WheelHandle>(null);
  const [spinning, setSpinning] = useState(false);
  const [alphaRoll, setAlphaRoll] = useState('?');
  const [hurt, setHurt] = useState(0);
  const [readout, setReadout] = useState<string>('Ties clash with no damage. Good luck, rider!');
  const finished = battle.finished;
  const pHp = battle.playerHp;
  const aHp = battle.alphaHp;

  useEffect(() => {
    sound.roar();
  }, []);

  const animateRoll = async (finalVal: number) => {
    for (let n = 0; n < 12; n++) {
      setAlphaRoll(String(1 + Math.floor(Math.random() * 10)));
      sound.tick();
      await sleep(65);
    }
    setAlphaRoll(String(finalVal));
  };

  const attack = async () => {
    if (spinning || !battleInProgress(battle)) return;
    setSpinning(true);
    const idx = await wheelRef.current?.spin(2.8);
    if (idx == null) {
      setSpinning(false);
      return;
    }
    const pv = BATTLE_SEGS[idx].value as number;
    const av = 1 + Math.floor(Math.random() * 10);
    await animateRoll(av);
    const next = applyBattleRound(battle, pv, av);
    const { lastPlayerTotal: playerTotal, lastAlphaTotal: alphaTotal, lastCrit: crit, lastOutcome: outcome } = next;
    setBattle(next);

    if (outcome === 'hit') {
      sound.good();
      setHurt((h) => h + 1);
      onLog(`💥 <b>${player.name}</b>'s flock hit the Alpha (${playerTotal} vs ${alphaTotal})!`, player.color);
      if (next.finished === 'won') {
        setReadout(`👑 <b>THE ALPHA FALLS!</b> ${player.name}'s dragons reign supreme!`);
        setSpinning(false);
        return;
      }
      setReadout(
        `💥 <b>HIT!</b> ${team}+${pv}+${COURAGE}${crit ? `+${crit} ⚡plasma blast` : ''} = <b>${playerTotal}</b> vs ${alphaTotal}!`,
      );
    } else if (outcome === 'hurt') {
      sound.bad();
      onLog(`🧊 The Alpha blasted <b>${player.name}</b> (${alphaTotal} vs ${playerTotal}).`, '#9fdcff');
      if (next.finished === 'lost') {
        setReadout(`😱 <b>The flock is scattered!</b>`);
        setSpinning(false);
        return;
      }
      setReadout(`🧊 <b>ICE BLAST!</b> ${playerTotal} vs ${ALPHA_BASE}+${av} = <b>${alphaTotal}</b>!`);
    } else {
      sound.clash();
      setReadout(`⚡ <b>CLASH!</b> ${playerTotal} apiece — sparks fly, no damage.`);
    }
    setSpinning(false);
  };

  return (
    <Modal>
      <ModalTitle>⚔️ THE ALPHA AWAKENS ⚔️</ModalTitle>
      <ModalSub>The Glacial Tyrant, Lord of Ice, blocks the sky!</ModalSub>
      <div className="bm-stage">
        <img key={hurt} className={`bm-alpha${hurt ? ' hurt' : ''}`} src={IMG.alpha} alt="The Alpha" />
        <div className="bm-hp">
          <HealthPips label="THE ALPHA" hp={aHp} icon="🧊" />
          <div className="bm-vs">VS</div>
          <HealthPips label={`${player.name.toUpperCase()} + FLOCK`} hp={pHp} icon="🔥" />
        </div>
        <div className="bm-team">
          Each round: your spin + flock power <b>+{team}</b> + Rider&apos;s Courage <b>+{COURAGE}</b> vs Alpha spin +{' '}
          <b>{ALPHA_BASE}</b>. Natural <b>10</b> = ⚡ Plasma Blast (+6)! First to 3 hits wins — even a small flock{' '}
          <i>can</i> win, and every dragon raises your odds.
        </div>
        <div className="bm-wheel">
          <Wheel ref={wheelRef} segs={BATTLE_SEGS} maxWidth={195} label="Battle wheel" />
        </div>
        <div className="bm-roll">
          <span>ALPHA ROLL</span>
          <span className="bm-roll-num">{alphaRoll}</span>
        </div>
        {!finished && (
          <Button variant="gold" big className="bm-spin" disabled={spinning} onClick={attack}>
            🔥 SPIN TO ATTACK
          </Button>
        )}
        <div className="bm-readout">
          <span dangerouslySetInnerHTML={{ __html: readout }} />
          {finished === 'won' && (
            <Button variant="gold" big onClick={() => onEnd(true)}>
              CLAIM VICTORY 👑
            </Button>
          )}
          {finished === 'lost' && (
            <Button variant="gold" big onClick={() => onEnd(false)}>
              OK ➤
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
