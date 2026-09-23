interface PipProps {
  icon: string;
  off?: boolean;
}

/** Single HP pip (atom). */
export function Pip({ icon, off }: PipProps) {
  return <span className={off ? 'pip off' : 'pip'}>{icon}</span>;
}
