import { Chip } from '../components/atoms/Chip';
import { LegendBar } from '../components/molecules/LegendBar';

export const name = 'Chip';

export const Start = () => <Chip color="#f0b429" label="Berk Village (start)" />;
export const Nest = () => <Chip color="#59d98c" label="Dragon Nest — Taming Spin Challenge" />;
export const Trap = () => <Chip color="#ff5d5d" label="Trapper Net — lose a turn" />;
export const FullLegend = () => <LegendBar />;
