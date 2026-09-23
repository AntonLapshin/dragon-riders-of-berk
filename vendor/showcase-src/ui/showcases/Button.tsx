/**
 * Sample showcase file — Button variants.
 *
 * Pure presentational demo: no business logic, just a few styled render
 * variants so the gallery sidebar/canvas interaction is visible in the Pages
 * demo. The `name` constant (a constant export) drives sidebar grouping and
 * URL deep-linking.
 *
 * Styling lives in `src/styles/showcases.css` (plain CSS, scoped `sample-`
 * class names) — no Tailwind utilities — so these showcase files render
 * without a Tailwind build step.
 */

import "../../styles/showcases.css";

export const name = "Button";

export const Primary = () => (
  <button className="sample-button sample-button--primary">Primary</button>
);

export const Secondary = () => (
  <button className="sample-button sample-button--secondary">Secondary</button>
);

export const Disabled = () => (
  <button disabled className="sample-button sample-button--disabled">
    Disabled
  </button>
);
