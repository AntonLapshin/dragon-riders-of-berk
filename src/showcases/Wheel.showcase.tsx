import { BATTLE_SEGS, CHALLENGE_SEGS, MAIN_SEGS } from '../core/constants';
import { Wheel } from '../components/molecules/Wheel';

export const name = 'Wheel';

export const MoveWheel = () => <Wheel segs={MAIN_SEGS} label="Move wheel" />;
export const TamingWheel = () => <Wheel segs={CHALLENGE_SEGS} maxWidth={190} label="Taming wheel" />;
export const BattleWheel = () => <Wheel segs={BATTLE_SEGS} maxWidth={195} label="Battle wheel" />;
