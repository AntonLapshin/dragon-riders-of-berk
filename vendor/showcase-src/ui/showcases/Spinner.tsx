/**
 * Sample showcase file — Spinner variants.
 *
 * Pure presentational demo: a tiny animated spinner in a few sizes/colors so
 * the gallery canvas has visible content. No business logic lives here.
 *
 * Styling lives in `src/styles/showcases.css` (plain CSS, scoped `sample-`
 * class names) — no Tailwind utilities — so these showcase files render
 * without a Tailwind build step.
 */

import "../../styles/showcases.css";

interface SpinnerProps {
  size?: number;
  variant?: "default" | "emerald";
}

function Spinner({ size = 16, variant = "default" }: SpinnerProps) {
  const variantClass =
    variant === "emerald" ? "sample-spinner--emerald" : "";
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`sample-spinner ${variantClass}`.trim()}
      style={{ width: size, height: size }}
    />
  );
}

export const name = "Spinner";

export const Small = () => <Spinner size={12} />;

export const Default = () => <Spinner size={20} />;

export const Large = () => <Spinner size={28} variant="emerald" />;
