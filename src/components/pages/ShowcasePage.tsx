import { useShowcase } from 'showcase';
import { showcaseFiles } from '../../showcases';
import { Button } from '../atoms/Button';

interface ShowcasePageProps {
  onBack: () => void;
}

/**
 * Component gallery page (page) — sidebar + canvas UI driven by the
 * [`showcase`](https://github.com/AntonLapshin/showcase) library's
 * `useShowcase` view model, with URL deep-linking (`?file=..&showcase=..`).
 */
export function ShowcasePage({ onBack }: ShowcasePageProps) {
  const { registry, state, selectedComponent, select, toggleExpand } = useShowcase(showcaseFiles);
  const { selection, expanded } = state;
  const Selected = selectedComponent;

  return (
    <div className="gallery">
      <div className="gallery-top">
        <div>
          <h1>🧩 Component Showcase</h1>
          <div className="sub">Every atom, molecule and organism in the game — powered by the showcase library.</div>
        </div>
        <div className="top-btns">
          <Button variant="ghost" onClick={onBack}>
            ← Back to Game
          </Button>
        </div>
      </div>
      <div className="gallery-crumbs">
        {selection.file && selection.showcase ? `${selection.file} / ${selection.showcase}` : 'Select a showcase'}
      </div>
      <div className="gallery-grid">
        <nav className="gallery-nav" aria-label="Showcases">
          {registry.files.map((file) => {
            const isExpanded = expanded === file.name;
            return (
              <div key={file.name}>
                <button type="button" className="gallery-group-btn" onClick={() => toggleExpand(file.name)}>
                  <span>{file.name}</span>
                  <span>{isExpanded ? '▾' : '▸'}</span>
                </button>
                {isExpanded && (
                  <ul className="gallery-variants">
                    {Object.keys(file.showcases).map((variant) => {
                      const active = selection.file === file.name && selection.showcase === variant;
                      return (
                        <li key={variant}>
                          <button
                            type="button"
                            className={`gallery-variant-btn${active ? ' active' : ''}`}
                            onClick={() => select(file.name, variant)}
                          >
                            {variant}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
        <main className="gallery-canvas">
          <div className="gallery-canvas-inner">
            {Selected ? <Selected /> : <p className="gallery-placeholder">Select a showcase from the list to preview it.</p>}
          </div>
        </main>
      </div>
    </div>
  );
}
