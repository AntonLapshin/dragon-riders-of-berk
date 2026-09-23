import type { ShowcaseFile } from 'showcase';
import * as BoardTile from './BoardTile.showcase';
import * as Button from './Button.showcase';
import * as Chip from './Chip.showcase';
import * as EventModal from './EventModal.showcase';
import * as HealthPips from './HealthPips.showcase';
import * as PlayerCard from './PlayerCard.showcase';
import * as SagaLog from './SagaLog.showcase';
import * as TurnHeader from './TurnHeader.showcase';
import * as Wheel from './Wheel.showcase';

/**
 * Registry of showcase files for the component gallery, built on the
 * [`showcase`](https://github.com/AntonLapshin/showcase) library's
 * `useShowcase` view model. Each file follows that library's convention:
 * a `name` constant plus one component per variant.
 */
export const showcaseFiles: readonly ShowcaseFile[] = [
  { name: Button.name, showcases: { Gold: Button.Gold, GoldBig: Button.GoldBig, Blue: Button.Blue, BlueWithSub: Button.BlueWithSub, Ghost: Button.Ghost, Disabled: Button.Disabled } },
  { name: Chip.name, showcases: { Start: Chip.Start, Nest: Chip.Nest, Trap: Chip.Trap, FullLegend: Chip.FullLegend } },
  { name: Wheel.name, showcases: { MoveWheel: Wheel.MoveWheel, TamingWheel: Wheel.TamingWheel, BattleWheel: Wheel.BattleWheel } },
  { name: PlayerCard.name, showcases: { Empty: PlayerCard.Empty, Active: PlayerCard.Active, WithDragons: PlayerCard.WithDragons, ReadyAndSkipping: PlayerCard.ReadyAndSkipping } },
  { name: TurnHeader.name, showcases: { Default: TurnHeader.Default, FlockComplete: TurnHeader.FlockComplete } },
  { name: HealthPips.name, showcases: { AlphaFull: HealthPips.AlphaFull, AlphaHurt: HealthPips.AlphaHurt, RiderFull: HealthPips.RiderFull, RiderDown: HealthPips.RiderDown } },
  { name: SagaLog.name, showcases: { Default: SagaLog.Default, Empty: SagaLog.Empty } },
  {
    name: BoardTile.name,
    showcases: {
      Nest: BoardTile.Nest,
      Highlighted: BoardTile.Highlighted,
      FeastStormSafe: BoardTile.FeastStormSafe,
      Start: BoardTile.Start,
      Lair: BoardTile.Lair,
      Token: BoardTile.Token,
    },
  },
  {
    name: EventModal.name,
    showcases: { SafeSkies: EventModal.SafeSkies, TrapperNet: EventModal.TrapperNet, MoveChoice: EventModal.MoveChoice },
  },
];
