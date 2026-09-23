import "../../styles/showcase.css";
import { demoShowcaseFiles } from "../showcases";
import { useShowcase } from "../viewModels/useShowcase";

/**
 * The showcase gallery (plan.md §19.2) — a thin, dumb view.
 *
 * Renders the 4-cell layout (sidebar header / breadcrumbs / sidebar nav /
 * canvas) and delegates all decisions to the `useShowcase` view model, which
 * in turn delegates to the pure `src/core` engine. No business logic lives
 * here.
 *
 * All styling lives in `src/styles/showcase.css` (plain CSS, scoped class
 * names) — no Tailwind utilities — so the gallery renders without a Tailwind
 * build step.
 */
export function Showcase() {
  const { registry, state, selectedComponent, select, toggleExpand } =
    useShowcase(demoShowcaseFiles);
  const { selection, expanded } = state;
  const Selected = selectedComponent;

  return (
    <div className="showcase">
      {/* Cell 1 — sidebar header */}
      <header className="showcase__header--sidebar">
        <h1>Showcases</h1>
      </header>

      {/* Cell 2 — breadcrumbs: file / variant path */}
      <header className="showcase__breadcrumbs">
        <h2>
          {selection.file && selection.showcase
            ? `${selection.file} / ${selection.showcase}`
            : "Select a showcase"}
        </h2>
      </header>

      {/* Cell 3 — sidebar nav: expandable file groups */}
      <nav className="showcase__nav">
        {registry.files.map((file) => {
          const isExpanded = expanded === file.name;
          return (
            <div key={file.name}>
              <button
                type="button"
                onClick={() => toggleExpand(file.name)}
                className="showcase__group-button"
              >
                <span>{file.name}</span>
                <span className="showcase__group-caret">
                  {isExpanded ? "▾" : "▸"}
                </span>
              </button>
              {isExpanded && (
                <ul className="showcase__variant-list">
                  {Object.keys(file.showcases).map((variantName) => {
                    const isActive =
                      selection.file === file.name &&
                      selection.showcase === variantName;
                    return (
                      <li key={variantName}>
                        <button
                          type="button"
                          onClick={() => select(file.name, variantName)}
                          className={`showcase__variant-button ${
                            isActive
                              ? "showcase__variant-button--active"
                              : "showcase__variant-button--inactive"
                          }`}
                        >
                          {variantName}
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

      {/* Cell 4 — canvas: renders the selected variant, anchored top-left */}
      <main className="showcase__canvas">
        {Selected ? (
          <Selected />
        ) : (
          <p className="showcase__placeholder">
            Select a showcase from the list to preview it.
          </p>
        )}
      </main>
    </div>
  );
}
