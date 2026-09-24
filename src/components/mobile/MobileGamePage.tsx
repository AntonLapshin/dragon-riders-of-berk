import { useCallback, useEffect, useRef, useState } from 'react';
import { MAIN_SEGS, MAX_DRAGONS, type PlayerState } from '../../core/constants';
import { teamPower } from '../../core/battle';
import { useGame } from '../../hooks/useGame';
import { sleep } from '../../utils/sleep';
import { Button } from '../atoms/Button';
import { BattleModal } from '../organisms/BattleModal';
import { ChallengeModal } from '../organisms/ChallengeModal';
import { EventModal } from '../organisms/EventModal';
import { HowToModal } from '../organisms/HowToModal';
import { PlayerSetupModal } from '../organisms/PlayerSetupModal';
import { WinModal } from '../organisms/WinModal';
import { PlayerCountSwitch } from '../molecules/PlayerCountSwitch';
import { SagaLog } from '../molecules/SagaLog';
import { Wheel } from '../molecules/Wheel';
import { MobileBoard, type MobileBoardHandle } from './MobileBoard';

function ConfirmDialog({
  title,
  bodyHtml,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  bodyHtml: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="overlay show m-confirm-wrap">
      <div className="modal event-modal m-confirm">
        <div className="m-title">{title}</div>
        <div className="ev-text" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        <div className="m-confirm-btns">
          <Button variant="ghost" big onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="gold" big onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CompactAvatar({ player }: { player: PlayerState }) {
  return <img className="m-avatar" src={player.avatar} alt={player.name} style={{ borderColor: player.color }} />;
}

/** Mobile-first game view: pannable board + floating Spin/Menu controls. */
export function MobileGamePage({ onShowcase }: { onShowcase: () => void }) {
  const game = useGame();
  const player = game.players[game.current];
  const winner = game.modal?.kind === 'win' ? game.players[game.modal.winnerId] : null;
  const moveModal = game.modal?.kind === 'move' ? game.modal : null;

  const boardRef = useRef<MobileBoardHandle>(null);
  const [spinOverlay, setSpinOverlay] = useState(false);
  const [pendingSteps, setPendingSteps] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const spinTapRef = useRef(false);

  // The wheel finishes spinning the moment the move picker appears.
  useEffect(() => {
    if (game.modal?.kind === 'move') {
      setSpinOverlay(false);
      spinTapRef.current = false;
    }
  }, [game.modal]);

  // Safety net: never trap the player behind the wheel overlay.
  useEffect(() => {
    if (!spinOverlay) return;
    const t = window.setTimeout(() => {
      spinTapRef.current = false;
      setSpinOverlay(false);
    }, 12000);
    return () => window.clearTimeout(t);
  }, [spinOverlay]);

  const handleSpinTap = useCallback(async () => {
    if (game.spinDisabled || spinTapRef.current || game.modal) return;
    spinTapRef.current = true;
    setPendingSteps(null);
    setMenuOpen(false);
    setSpinOverlay(true);
    // Let the overlay (and its Wheel) mount so mainWheelRef is live.
    await sleep(80);
    void game.handleSpin();
  }, [game, spinTapRef]);

  const confirmMove = useCallback(
    (steps: number) => {
      if (!moveModal) return;
      setPendingSteps(null);
      game.closeModalResolve(steps);
      // Follow the rider once the move animation starts.
      window.setTimeout(() => boardRef.current?.focusCurrent(), 350);
    },
    [game, moveModal],
  );

  const moveLabel = (steps: number, val: number) =>
    steps === val ? `Go ${val} forward` : steps > 0 ? 'Go 1 forward' : 'Go 1 backward';

  const moveCost = (steps: number, val: number) =>
    steps === val ? 'FREE — normal move' : 'COSTS your next turn';

  const spinFabDisabled = game.spinDisabled || spinOverlay || !!game.modal;

  return (
    <div className="m-game">
      {/* Compact turn bar */}
      <header className="m-top">
        <CompactAvatar player={player} />
        <div className="m-top-txt">
          <div className="m-top-name" style={{ color: player.color }}>
            {player.name}&apos;s turn
            <span className="m-top-flock">
              {' '}
              🐉 {player.dragons.length}/{MAX_DRAGONS} · ⚡{teamPower(player.dragons)}
            </span>
          </div>
          <div className="m-top-msg" dangerouslySetInnerHTML={{ __html: game.turnMsg || '…'}} />
        </div>
        <button className="m-locate" onClick={() => boardRef.current?.focusCurrent()} aria-label="Center on my rider">
          ◎
        </button>
      </header>

      {/* Pannable board: only a part visible, drag vertically to explore */}
      <div className="m-board-wrap">
        <MobileBoard
          ref={boardRef}
          tiles={game.tiles}
          players={game.players}
          current={game.current}
          highlight={game.highlight}
          fadeToken={game.fadeToken}
        />
      </div>

      {/* Floating minimal controls */}
      <div className="m-fabs">
        <button className="m-fab m-fab-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          ☰
        </button>
        <button
          className={`m-fab m-fab-spin${spinFabDisabled ? ' disabled' : ''}`}
          onClick={() => void handleSpinTap()}
          disabled={spinFabDisabled}
          aria-label="Spin the wheel"
        >
          <span>{spinOverlay ? 'Spinning…' : 'Spin'}</span>
        </button>
      </div>

      {/* Spin wheel overlay: shows up on spin, disappears at the result */}
      {spinOverlay && (
        <div className="m-spin-overlay">
          <div className="m-spin-card">
            <div className="m-spin-title">{player.name} spins…</div>
            <Wheel ref={game.mainWheelRef} segs={MAIN_SEGS} label="Move wheel" />
            <div className="m-spin-sub">Good luck, rider! 🐉</div>
          </div>
        </div>
      )}

      {/* Floating spin result + move options */}
      {moveModal && pendingSteps === null && (
        <div className="m-move-sheet">
          <div className="m-move-result">
            🎡 You spun <b>{moveModal.val}</b>!
          </div>
          <div className="m-move-sub">
            Choose your move, <b>{moveModal.playerName}</b>
          </div>
          <div className="m-move-opts">
            <button className="m-move-opt primary" onClick={() => setPendingSteps(moveModal.val)}>
              <b>+{moveModal.val}</b>
              <span>forward · free</span>
            </button>
            <button className="m-move-opt" onClick={() => setPendingSteps(1)}>
              <b>+1</b>
              <span>forward · skip next</span>
            </button>
            <button
              className="m-move-opt"
              disabled={moveModal.atStart}
              onClick={() => setPendingSteps(-1)}
              title={moveModal.atStart ? 'Already at Berk Village' : 'Go 1 backward'}
            >
              <b>−1</b>
              <span>{moveModal.atStart ? 'at Berk' : 'back · skip next'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirm every move action */}
      {moveModal && pendingSteps !== null && (
        <ConfirmDialog
          title={`Move ${pendingSteps > 0 ? `+${pendingSteps}` : pendingSteps}?`}
          bodyHtml={`<b>${moveModal.playerName}</b> — ${moveLabel(pendingSteps, moveModal.val)} (<b>${moveCost(pendingSteps, moveModal.val)}</b>). Are you sure?`}
          confirmLabel={`Yes, move ${pendingSteps > 0 ? `+${pendingSteps}` : pendingSteps}`}
          onConfirm={() => confirmMove(pendingSteps)}
          onCancel={() => setPendingSteps(null)}
        />
      )}

      {/* Menu sheet */}
      {menuOpen && (
        <div className="m-sheet-wrap" onClick={() => setMenuOpen(false)}>
          <div className="m-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="m-sheet-title">Menu</div>
            <button className="m-sheet-row" onClick={() => { setMenuOpen(false); setLogsOpen(true); }}>
              📜 <span>Saga Log</span><em>›</em>
            </button>
            <button className="m-sheet-row" onClick={() => { setMenuOpen(false); game.showHowto(); }}>
              ❓ <span>How to Play</span><em>›</em>
            </button>
            <div className="m-sheet-riders">
              <span>🐉 Riders</span>
              <PlayerCountSwitch compact value={game.playerCount} onChange={(n) => game.switchCount(n)} />
            </div>
            <button
              className="m-sheet-row"
              onClick={() => { game.toggleSound(); }}
            >
              {game.soundOn ? '🔊' : '🔇'} <span>Sound: {game.soundOn ? 'On' : 'Muted'}</span><em>{game.soundOn ? 'tap to mute' : 'tap to unmute'}</em>
            </button>
            <button className="m-sheet-row" onClick={() => { setMenuOpen(false); boardRef.current?.focusCurrent(); }}>
              ◎ <span>Find my rider</span><em>›</em>
            </button>
            <button className="m-sheet-row danger" onClick={() => { setMenuOpen(false); setConfirmRestart(true); }}>
              ↻ <span>Restart game</span><em>›</em>
            </button>
            <button className="m-sheet-row ghost" onClick={() => { setMenuOpen(false); onShowcase(); }}>
              🧩 <span>Components</span><em>›</em>
            </button>
            <button className="m-sheet-close" onClick={() => setMenuOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Logs sheet */}
      {logsOpen && (
        <div className="m-sheet-wrap" onClick={() => setLogsOpen(false)}>
          <div className="m-sheet m-logs" onClick={(e) => e.stopPropagation()}>
            <div className="m-sheet-title">Saga Log</div>
            <SagaLog entries={game.logs} />
            <button className="m-sheet-close" onClick={() => setLogsOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Restart confirmation */}
      {confirmRestart && (
        <ConfirmDialog
          title="Restart game?"
          bodyHtml="The current saga will be lost and all riders return to <b>Berk Village</b>. Are you sure?"
          confirmLabel="Yes, restart"
          onConfirm={() => game.restart()}
          onCancel={() => setConfirmRestart(false)}
        />
      )}

      {/* All other game modals keep their OK-confirmation UX */}
      {game.modal && game.modal.kind !== 'move' && (
        <div className="overlay show">
          {game.modal.kind === 'event' && (
            <EventModal
              icon={game.modal.icon}
              title={game.modal.title}
              html={game.modal.html}
              accent={game.modal.accent}
              okLabel={game.modal.okLabel}
              onOk={() => game.closeModalResolve(undefined)}
            />
          )}
          {game.modal.kind === 'challenge' && (
            <ChallengeModal
              dragonId={game.modal.dragonId}
              playerName={game.modal.playerName}
              onDone={(key) => game.closeModalResolve(key)}
            />
          )}
          {game.modal.kind === 'battle' && (
            <BattleModal
              player={game.players[game.modal.playerId]}
              onLog={game.pushLog}
              onEnd={(won) => game.closeModalResolve(won)}
            />
          )}
          {game.modal.kind === 'howto' && (
            <HowToModal playerCount={game.playerCount} onClose={() => game.closeModalResolve(undefined)} />
          )}
          {game.modal.kind === 'setup' && <PlayerSetupModal onPick={(n) => game.chooseCount(n)} />}
          {winner && <WinModal winner={winner} onPlayAgain={game.restart} />}
        </div>
      )}
    </div>
  );
}
