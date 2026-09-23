import { EventModal } from '../components/organisms/EventModal';
import { MoveChoiceModal } from '../components/organisms/MoveChoiceModal';

export const name = 'EventModal';

const noop = () => {};

export const SafeSkies = () => (
  <EventModal icon="✦" title="Safe Skies" html="<b>Hiccup</b> — Clear skies over Berk. 🕊️" accent="#8fa3c8" onOk={noop} />
);
export const TrapperNet = () => (
  <EventModal
    icon="🪤"
    title="Trapper's Net!"
    html="<b>Astrid</b> is tangled in a dragon trapper's net and <b>loses the next turn</b>!"
    accent="#ff5d5d"
    onOk={noop}
  />
);
export const MoveChoice = () => <MoveChoiceModal val={5} atStart={false} playerName="Hiccup" onPick={noop} />;
