import { HealthPips } from '../components/molecules/HealthPips';

export const name = 'HealthPips';

export const AlphaFull = () => <HealthPips label="THE ALPHA" hp={3} icon="🧊" />;
export const AlphaHurt = () => <HealthPips label="THE ALPHA" hp={1} icon="🧊" />;
export const RiderFull = () => <HealthPips label="HICCUP + FLOCK" hp={3} icon="🔥" />;
export const RiderDown = () => <HealthPips label="HICCUP + FLOCK" hp={0} icon="🔥" />;
