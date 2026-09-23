import type { LogEntry } from '../../hooks/useGame';

export function SagaLog({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="log">
      {entries.map((e) => (
        <div key={e.id} style={{ ['--lc' as string]: e.color } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: e.html }} />
      ))}
    </div>
  );
}
