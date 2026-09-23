import { Button } from '../components/atoms/Button';

export const name = 'Button';

export const Gold = () => <Button variant="gold">🎡 SPIN THE WHEEL</Button>;
export const GoldBig = () => (
  <Button variant="gold" big>
    🎡 SPIN THE WHEEL
  </Button>
);
export const Blue = () => <Button variant="blue">🎡 Go 5 forward</Button>;
export const BlueWithSub = () => (
  <Button variant="blue" big sub="FREE — the normal move">
    🎡 Go 5 forward
  </Button>
);
export const Ghost = () => <Button variant="ghost">📜 How to Play</Button>;
export const Disabled = () => (
  <Button variant="gold" big disabled>
    🎡 SPIN THE WHEEL
  </Button>
);
