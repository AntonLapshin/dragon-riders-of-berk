interface ChipProps {
  color: string;
  label: string;
}

/** Legend chip: colored dot + label (atom). */
export function Chip({ color, label }: ChipProps) {
  return (
    <span className="chip">
      <i style={{ ['--tc' as string]: color }} />
      {label}
    </span>
  );
}
