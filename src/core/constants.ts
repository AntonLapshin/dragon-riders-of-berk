/** Shared game data: dragons, artwork, board layout config, wheel segments. */

export interface Dragon {
  name: string;
  species: string;
  power: number;
  img: string;
}

export type DragonId =
  | 'meatlug'
  | 'grump'
  | 'barf'
  | 'stormfly'
  | 'cloudjumper'
  | 'hookfang'
  | 'toothless';

export const IMG: Record<string, string> = {
  toothless:
    'https://image.qwenlm.ai/public_source/e75c73c4-95f2-4778-8dee-b1a388d0c0f5/1656d2160-80db-4f74-a019-36f85196bfe7.png',
  meatlug:
    'https://image.qwenlm.ai/public_source/e75c73c4-95f2-4778-8dee-b1a388d0c0f5/18f88ae28-a418-46f5-93c9-2667e736fae2.png',
  grump:
    'https://image.qwenlm.ai/public_source/e75c73c4-95f2-4778-8dee-b1a388d0c0f5/198660dc2-ae83-4aa8-832d-8f0b0cb89221.png',
  stormfly:
    'https://image.qwenlm.ai/public_source/e75c73c4-95f2-4778-8dee-b1a388d0c0f5/1722b0fbd-91c0-4929-80e2-e074ab48964b.png',
  hookfang:
    'https://image.qwenlm.ai/public_source/e75c73c4-95f2-4778-8dee-b1a388d0c0f5/1736c04a1-6549-4bbe-9847-b5c32e6905ff.png',
  barf: 'https://image.qwenlm.ai/public_source/e75c73c4-95f2-4778-8dee-b1a388d0c0f5/1d921e45c-024e-4845-a90b-3f852a82f9ca.png',
  cloudjumper:
    'https://image.qwenlm.ai/public_source/e75c73c4-95f2-4778-8dee-b1a388d0c0f5/1737e8d5d-5013-4b32-9733-908c7c399033.png',
  alpha:
    'https://image.qwenlm.ai/public_source/e75c73c4-95f2-4778-8dee-b1a388d0c0f5/115f9e344-e2af-4e0a-bb2d-012efb79de7b.png',
  hiccup:
    'https://image.qwenlm.ai/public_source/e75c73c4-95f2-4778-8dee-b1a388d0c0f5/15546e715-599d-4ac0-93de-7020d19ca44c.png',
  astrid:
    'https://image.qwenlm.ai/public_source/e75c73c4-95f2-4778-8dee-b1a388d0c0f5/12adf3274-48a1-422b-8745-499e2424e8ca.png',
  board:
    'https://image.qwenlm.ai/public_source/e75c73c4-95f2-4778-8dee-b1a388d0c0f5/188fa123b-e287-4fee-a5df-e8b547c4516c.png',
};

export const DRAGONS: Record<DragonId, Dragon> = {
  meatlug: { name: 'Meatlug', species: 'Gronckle', power: 2, img: IMG.meatlug },
  grump: { name: 'Grump', species: 'Gronckle', power: 2, img: IMG.grump },
  barf: { name: 'Barf & Belch', species: 'Hideous Zippleback', power: 3, img: IMG.barf },
  stormfly: { name: 'Stormfly', species: 'Deadly Nadder', power: 3, img: IMG.stormfly },
  cloudjumper: { name: 'Cloudjumper', species: 'Stormcutter', power: 4, img: IMG.cloudjumper },
  hookfang: { name: 'Hookfang', species: 'Monstrous Nightmare', power: 4, img: IMG.hookfang },
  toothless: { name: 'Toothless', species: 'Night Fury', power: 5, img: IMG.toothless },
};

/** Tile index -> dragon id for Dragon Nest tiles. */
export const NESTS: Record<number, DragonId> = {
  5: 'meatlug',
  9: 'grump',
  15: 'barf',
  19: 'stormfly',
  24: 'cloudjumper',
  28: 'hookfang',
  33: 'toothless',
  38: 'stormfly',
  44: 'meatlug',
  50: 'hookfang',
};

export const TRAPS = [3, 11, 20, 26, 35, 42, 48, 55];
export const FEAST = [7, 17, 29, 37, 46, 53];
export const STORM = [13, 30, 43, 47];

export const SAFE_FLAVORS = [
  'Clear skies over Berk. 🕊️',
  'A fish cart trundles past. 🐟',
  'Seagulls steal your lunch! 🐦',
  'Dragons soar far above the cliffs. 🐉',
  'Warm wind from the hot springs. ♨️',
  'Old Gobber waves hello. ⚒️',
  'Sheep wander across the trail. 🐑',
  'You find a shiny dragon scale. ✨',
];

export const ALPHA_BASE = 18;
export const COURAGE = 6;
export const MAX_DRAGONS = 5;

export interface WheelSeg {
  label?: string;
  icon?: string;
  text?: string;
  /** Segment value (move / battle wheels). */
  value?: number;
  /** Taming-wheel outcome key. */
  key?: 'catch' | 'catchfeast' | 'escape' | 'trap';
  weight?: number;
  color: string;
  desc?: string;
}

export const MAIN_SEGS: WheelSeg[] = [
  { label: '1', value: 1, color: '#e2574c' },
  { label: '2', value: 2, color: '#f6a12f' },
  { label: '3', value: 3, color: '#f2d035' },
  { label: '4', value: 4, color: '#2fbf71' },
  { label: '5', value: 5, color: '#20b8ae' },
  { label: '6', value: 6, color: '#2f6df6' },
  { label: '7', value: 7, color: '#8a63d2' },
  { label: '8', value: 8, color: '#d64f8e' },
  { label: '3', value: 3, color: '#35b08a' },
  { label: '5', value: 5, color: '#f6762f' },
];

export const CHALLENGE_SEGS: WheelSeg[] = [
  { icon: '🐉', text: 'CATCH!', key: 'catch', weight: 4, color: '#2fbf71', desc: 'The dragon joins your flock!' },
  { icon: '💨', text: 'ESCAPES', key: 'escape', weight: 2, color: '#5b6b8c', desc: 'It slips away — drift back 2 spaces.' },
  { icon: '🐉', text: 'CATCH!', key: 'catch', weight: 0, color: '#26a862', desc: 'The dragon joins your flock!' },
  { icon: '🪤', text: 'NET TRAP', key: 'trap', weight: 1, color: '#e2574c', desc: "Trapper net! Lose your next turn." },
  { icon: '🐉', text: 'CATCH!', key: 'catch', weight: 0, color: '#2fbf71', desc: 'The dragon joins your flock!' },
  { icon: '💨', text: 'ESCAPES', key: 'escape', weight: 0, color: '#6b7ba0', desc: 'It slips away — drift back 2 spaces.' },
  { icon: '🐟', text: 'CATCH+FEAST', key: 'catchfeast', weight: 1, color: '#f2d035', desc: 'Caught! And a fish feast grants another spin.' },
  { icon: '🐉', text: 'CATCH!', key: 'catch', weight: 0, color: '#26a862', desc: 'The dragon joins your flock!' },
];

export const BATTLE_SEGS: WheelSeg[] = Array.from({ length: 10 }, (_, i) => ({
  label: String(i + 1),
  value: i + 1,
  color: i % 2 ? '#20b8ae' : '#ff7a3d',
}));

export interface PlayerState {
  id: number;
  name: string;
  avatar: string;
  color: string;
  dragons: DragonId[];
  pos: number;
  skip: boolean;
  skipWhy: 'net' | 'choice' | null;
}

export function createInitialPlayers(): PlayerState[] {
  return [
    { id: 0, name: 'Hiccup', avatar: IMG.hiccup, color: '#39d98a', dragons: [], pos: 0, skip: false, skipWhy: null },
    { id: 1, name: 'Astrid', avatar: IMG.astrid, color: '#ffb020', dragons: [], pos: 0, skip: false, skipWhy: null },
  ];
}
