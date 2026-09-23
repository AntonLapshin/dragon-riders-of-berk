import { useGame } from '../../hooks/useGame';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileGamePage } from '../mobile/MobileGamePage';
import { DRAGONS } from '../../core/constants';
import { CardTitle } from '../atoms/CardTitle';
import { AppHeader } from '../organisms/AppHeader';
import { BattleModal } from '../organisms/BattleModal';
import { Board } from '../organisms/Board';
import { ChallengeModal } from '../organisms/ChallengeModal';
import { EventModal } from '../organisms/EventModal';
import { HowToModal } from '../organisms/HowToModal';
import { MoveChoiceModal } from '../organisms/MoveChoiceModal';
import { PlayerSetupModal } from '../organisms/PlayerSetupModal';
import { PlayersPanel } from '../organisms/PlayersPanel';
import { TurnPanel } from '../organisms/TurnPanel';
import { WinModal } from '../organisms/WinModal';
import { LegendBar } from '../molecules/LegendBar';
import { PlayerCountSwitch } from '../molecules/PlayerCountSwitch';
import { SagaLog } from '../molecules/SagaLog';
import { GameLayout } from '../templates/GameLayout';

interface GamePageProps {
  onShowcase: () => void;
}

/** Full game page: header + board + side panel + modal overlay (page). */
export function GamePage({ onShowcase }: GamePageProps) {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileGamePage onShowcase={onShowcase} />;
  return <DesktopGamePage onShowcase={onShowcase} />;
}

/** Desktop two-column game view (page). */
function DesktopGamePage({ onShowcase }: GamePageProps) {
  const game = useGame();
  const player = game.players[game.current];
  const winner = game.modal?.kind === 'win' ? game.players[game.modal.winnerId] : null;

  return (
    <>
      <AppHeader
        soundOn={game.soundOn}
        onHowTo={game.showHowto}
        onToggleSound={game.toggleSound}
        onRestart={game.restart}
        onShowcase={onShowcase}
      />
      <GameLayout
        board={<Board tiles={game.tiles} players={game.players} highlight={game.highlight} fadeToken={game.fadeToken} />}
        legend={<LegendBar />}
        side={
          <>
            <div className="card pcount-card">
              <CardTitle>Riders</CardTitle>
              <PlayerCountSwitch value={game.playerCount} onChange={(n) => game.switchCount(n)} />
            </div>
            <TurnPanel
              player={player}
              messageHtml={game.turnMsg}
              wheelRef={game.mainWheelRef}
              spinDisabled={game.spinDisabled}
              onSpin={() => void game.handleSpin()}
            />
            <PlayersPanel players={game.players} current={game.current} phase={game.phase} />
            <div className="card">
              <CardTitle>Saga Log</CardTitle>
              <SagaLog entries={game.logs} />
            </div>
          </>
        }
      />
      {game.modal && (
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
          {game.modal.kind === 'move' && (
            <MoveChoiceModal
              val={game.modal.val}
              atStart={game.modal.atStart}
              playerName={game.modal.playerName}
              onPick={(steps) => game.closeModalResolve(steps)}
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
      {/* preload dragon art so modals never flash */}
      <div style={{ display: 'none' }} aria-hidden>
        {Object.values(DRAGONS).map((d) => (
          <img key={d.name} src={d.img} alt="" />
        ))}
      </div>
    </>
  );
}
