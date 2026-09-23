import { SagaLog } from '../components/molecules/SagaLog';
import type { LogEntry } from '../hooks/useGame';

const SAMPLE: LogEntry[] = [
  { id: 1, html: '🐉 The saga begins! Tame dragons and be the first to defeat the Alpha.', color: '#f0b429' },
  { id: 2, html: '🎡 <b>Hiccup</b> spun a 5.', color: '#39d98a' },
  { id: 3, html: '🐉 <b>Astrid</b> tamed <b>Stormfly</b> the Deadly Nadder! (1/5)', color: '#59d98c' },
  { id: 4, html: '🪤 <b>Hiccup</b> got caught in a trapper net — next turn lost.', color: '#ff5d5d' },
];

export const name = 'SagaLog';

export const Default = () => <SagaLog entries={SAMPLE} />;
export const Empty = () => <SagaLog entries={[]} />;
