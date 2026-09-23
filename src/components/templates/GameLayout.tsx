import type { ReactNode } from 'react';

interface GameLayoutProps {
  board: ReactNode;
  legend: ReactNode;
  side: ReactNode;
}

/** Two-column game layout: board zone + side panel (template). */
export function GameLayout({ board, legend, side }: GameLayoutProps) {
  return (
    <main className="layout">
      <section className="board-zone">
        {board}
        {legend}
      </section>
      <aside className="side">{side}</aside>
    </main>
  );
}
