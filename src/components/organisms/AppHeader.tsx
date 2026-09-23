import type { ReactNode } from 'react';
import { Button } from '../atoms/Button';

interface AppHeaderProps {
  soundOn: boolean;
  onHowTo: () => void;
  onToggleSound: () => void;
  onRestart: () => void;
  onShowcase: () => void;
}

/** Top bar: title + tagline + action buttons (organism). */
export function AppHeader({ soundOn, onHowTo, onToggleSound, onRestart, onShowcase }: AppHeaderProps) {
  return (
    <header className="top">
      <div>
        <h1>🐉 Dragon Riders of Berk</h1>
        <div className="sub">A Game-of-Life style race across the Barbaric Archipelago — tame up to 5 dragons, then defeat the Alpha!</div>
      </div>
      <div className="top-btns">
        <Button variant="ghost" onClick={onShowcase}>
          🧩 Components
        </Button>
        <Button variant="ghost" onClick={onHowTo}>
          📜 How to Play
        </Button>
        <Button variant="ghost" onClick={onToggleSound}>
          {soundOn ? '🔊 Sound' : '🔇 Muted'}
        </Button>
        <Button variant="ghost" onClick={onRestart}>
          ↻ Restart
        </Button>
      </div>
    </header>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
