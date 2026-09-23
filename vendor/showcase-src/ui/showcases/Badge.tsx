/**
 * Sample showcase file — Badge variants.
 *
 * Pure presentational demo: a small pill badge in a few tones. No business
 * logic lives here.
 *
 * Styling lives in `src/styles/showcases.css` (plain CSS, scoped `sample-`
 * class names) — no Tailwind utilities — so these showcase files render
 * without a Tailwind build step.
 */

import "../../styles/showcases.css";

interface BadgeProps {
  label: string;
  tone?: "slate" | "emerald" | "amber" | "indigo";
}

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  slate: "sample-badge--slate",
  emerald: "sample-badge--emerald",
  amber: "sample-badge--amber",
  indigo: "sample-badge--indigo",
};

function Badge({ label, tone = "indigo" }: BadgeProps) {
  return (
    <span className={`sample-badge ${toneClasses[tone]}`}>{label}</span>
  );
}

export const name = "Badge";

export const Neutral = () => <Badge label="Neutral" tone="slate" />;

export const Success = () => <Badge label="Success" tone="emerald" />;

export const Warning = () => <Badge label="Warning" tone="amber" />;

export const Accent = () => <Badge label="Accent" tone="indigo" />;
