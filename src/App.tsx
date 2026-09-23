import { useCallback, useState } from 'react';
import { GamePage } from './components/pages/GamePage';
import { ShowcasePage } from './components/pages/ShowcasePage';

type View = 'game' | 'showcase';

function initialView(): View {
  const v = new URLSearchParams(window.location.search).get('view');
  return v === 'showcase' ? 'showcase' : 'game';
}

/** Root: switches between the game and the component showcase gallery. */
export default function App() {
  const [view, setView] = useState<View>(initialView);

  const go = useCallback((next: View) => {
    setView(next);
    const url = new URL(window.location.href);
    if (next === 'showcase') url.searchParams.set('view', 'showcase');
    else url.searchParams.delete('view');
    window.history.pushState({}, '', `${url.pathname}${url.search}`);
  }, []);

  if (view === 'showcase') return <ShowcasePage onBack={() => go('game')} />;
  return <GamePage onShowcase={() => go('showcase')} />;
}
