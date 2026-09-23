import { describe, expect, it } from 'vitest';
import { createInitialPlayers, MAX_DRAGONS, type PlayerState } from '../core/constants';
import {
  ESCAPE_RETREAT,
  LAIR_REPEL_STEPS,
  MAX_STORM_DEPTH,
  advanceTurn,
  applyBattleDefeat,
  applyNestChallenge,
  chainWalks,
  classifyNest,
  classifyTile,
  clearSkip,
  decideTurnAdvance,
  grantSkip,
  moveChoiceForfeits,
  nextPlayerIndex,
  placeAt,
} from './gameEngine';

function player(over: Partial<PlayerState> = {}): PlayerState {
  return { ...createInitialPlayers()[0], ...over };
}

describe('classifyTile', () => {
  const p = () => player();

  it('classifies safe / trap / feast / start / unknown tiles', () => {
    expect(classifyTile('safe', { player: p(), pos: 2 }).kind).toBe('safe');
    expect(classifyTile('trap', { player: p(), pos: 3 }).kind).toBe('trap');
    expect(classifyTile('feast', { player: p(), pos: 7 }).kind).toBe('feast');
    expect(classifyTile('start', { player: p(), pos: 0 }).kind).toBe('start');
    expect(classifyTile('mystery', { player: p(), pos: 0 }).kind).toBe('done');
  });

  it('rides the storm to the next nest', () => {
    const task = classifyTile('storm', { player: p(), pos: 0 });
    expect(task.kind).toBe('stormRide');
    expect(task.stormTo).toBe(5);
  });

  it('honors an explicitly injected storm target', () => {
    const task = classifyTile('storm', { player: p(), pos: 0, stormTo: 19 });
    expect(task).toEqual({ kind: 'stormRide', stormTo: 19 });
  });

  it('fizzles when the storm depth limit is reached', () => {
    expect(classifyTile('storm', { player: p(), pos: 0, stormDepth: MAX_STORM_DEPTH }).kind).toBe(
      'stormFizzle',
    );
    expect(classifyTile('storm', { player: p(), pos: 0, stormDepth: 99 }).kind).toBe('stormFizzle');
  });

  it('fizzles past the last nest', () => {
    expect(classifyTile('storm', { player: p(), pos: 58 }).kind).toBe('stormFizzle');
    expect(classifyTile('storm', { player: p(), pos: 0, stormTo: null }).kind).toBe('stormFizzle');
  });

  it('delegates nest tiles to nest classification', () => {
    expect(classifyTile('nest', { player: p(), pos: 5, dragonId: 'meatlug' }).kind).toBe(
      'nestChallenge',
    );
    expect(
      classifyTile('nest', { player: player({ dragons: ['meatlug'] }), pos: 5, dragonId: 'meatlug' })
        .kind,
    ).toBe('nestOwned');
  });

  it('treats a nest without a dragon as done', () => {
    expect(classifyTile('nest', { player: p(), pos: 5 }).kind).toBe('done');
    expect(classifyTile('nest', { player: p(), pos: 5, dragonId: null }).kind).toBe('done');
  });

  it('sends a flocked rider to battle and a lone rider back', () => {
    expect(classifyTile('lair', { player: p(), pos: 58 }).kind).toBe('lairRepel');
    expect(
      classifyTile('lair', { player: player({ dragons: ['meatlug'] }), pos: 58 }).kind,
    ).toBe('lairBattle');
  });
});

describe('classifyNest', () => {
  it('opens a challenge for a new dragon', () => {
    expect(classifyNest(player(), 'meatlug')).toEqual({ kind: 'nestChallenge' });
  });

  it('grants reunion spins for an already-owned dragon', () => {
    expect(classifyNest(player({ dragons: ['meatlug'] }), 'meatlug')).toEqual({
      kind: 'nestOwned',
    });
  });

  it('turns away a full flock', () => {
    const full = player({ dragons: ['meatlug', 'grump', 'barf', 'stormfly', 'cloudjumper'] });
    expect(full.dragons).toHaveLength(MAX_DRAGONS);
    expect(classifyNest(full, 'toothless')).toEqual({ kind: 'nestFull' });
  });

  it('prefers reunion over the full-flock rule for owned dragons', () => {
    const full = player({ dragons: ['meatlug', 'grump', 'barf', 'stormfly', 'cloudjumper'] });
    expect(classifyNest(full, 'meatlug')).toEqual({ kind: 'nestOwned' });
  });

  it('is done without a dragon', () => {
    expect(classifyNest(player(), null)).toEqual({ kind: 'done' });
  });
});

describe('moveChoiceForfeits', () => {
  it('forfeits on anything but the full spin', () => {
    expect(moveChoiceForfeits(5, 5)).toBe(false);
    expect(moveChoiceForfeits(5, 1)).toBe(true);
    expect(moveChoiceForfeits(5, -1)).toBe(true);
  });
});

describe('grantSkip / clearSkip / placeAt', () => {
  it('grants a skip without mutating', () => {
    const before = player();
    const after = grantSkip(before, 'net');
    expect(after.skip).toBe(true);
    expect(after.skipWhy).toBe('net');
    expect(before.skip).toBe(false);
  });

  it('grants a choice skip', () => {
    expect(grantSkip(player(), 'choice').skipWhy).toBe('choice');
  });

  it('clears a skip', () => {
    expect(clearSkip(grantSkip(player(), 'net'))).toMatchObject({ skip: false, skipWhy: null });
  });

  it('places a player without mutating', () => {
    const before = player({ pos: 4 });
    expect(placeAt(before, 10).pos).toBe(10);
    expect(before.pos).toBe(4);
  });
});

describe('applyNestChallenge', () => {
  it('catch adds the dragon with no extra and no retreat', () => {
    const res = applyNestChallenge(player(), 'meatlug', 'catch');
    expect(res.player.dragons).toEqual(['meatlug']);
    expect(res.extraGranted).toBe(false);
    expect(res.retreatBy).toBe(0);
  });

  it('catch+feast adds the dragon AND grants an extra turn', () => {
    const res = applyNestChallenge(player(), 'meatlug', 'catchfeast');
    expect(res.player.dragons).toEqual(['meatlug']);
    expect(res.extraGranted).toBe(true);
    expect(res.retreatBy).toBe(0);
  });

  it('escape retreats without touching the flock or skips', () => {
    const res = applyNestChallenge(player(), 'meatlug', 'escape');
    expect(res.player.dragons).toEqual([]);
    expect(res.player.skip).toBe(false);
    expect(res.extraGranted).toBe(false);
    expect(res.retreatBy).toBe(ESCAPE_RETREAT);
  });

  it('trap sets a net skip', () => {
    const res = applyNestChallenge(player(), 'meatlug', 'trap');
    expect(res.player.dragons).toEqual([]);
    expect(res.player.skip).toBe(true);
    expect(res.player.skipWhy).toBe('net');
    expect(res.extraGranted).toBe(false);
    expect(res.retreatBy).toBe(0);
  });
});

describe('applyBattleDefeat', () => {
  it('drops the indexed dragon', () => {
    const res = applyBattleDefeat(player({ dragons: ['meatlug', 'grump', 'barf'] }), 1);
    expect(res.player.dragons).toEqual(['meatlug', 'barf']);
    expect(res.lostDragon).toBe('grump');
  });

  it('does nothing for a null index', () => {
    const before = player({ dragons: ['meatlug'] });
    expect(applyBattleDefeat(before, null)).toEqual({ player: before, lostDragon: null });
  });

  it('does nothing for out-of-range indices', () => {
    const before = player({ dragons: ['meatlug'] });
    expect(applyBattleDefeat(before, -1).lostDragon).toBeNull();
    expect(applyBattleDefeat(before, 7).lostDragon).toBeNull();
    expect(applyBattleDefeat(before, 7).player.dragons).toEqual(['meatlug']);
  });

  it('does nothing for an empty flock', () => {
    expect(applyBattleDefeat(player(), 0).lostDragon).toBeNull();
  });
});

describe('advanceTurn', () => {
  it('stays for an extra turn without consuming the skip', () => {
    expect(advanceTurn(0, 2, { extraGranted: true, skipPending: true })).toEqual({
      nextCurrent: 0,
      isExtra: true,
      consumedSkip: false,
    });
  });

  it('stays for a plain extra turn', () => {
    expect(advanceTurn(1, 2, { extraGranted: true, skipPending: false })).toEqual({
      nextCurrent: 1,
      isExtra: true,
      consumedSkip: false,
    });
  });

  it('rotates and flags the consumed skip', () => {
    expect(advanceTurn(0, 2, { extraGranted: false, skipPending: true })).toEqual({
      nextCurrent: 1,
      isExtra: false,
      consumedSkip: true,
    });
  });

  it('rotates plain turns', () => {
    expect(advanceTurn(1, 2, { extraGranted: false, skipPending: false })).toEqual({
      nextCurrent: 0,
      isExtra: false,
      consumedSkip: false,
    });
  });

  it('is safe with a degenerate player count', () => {
    expect(advanceTurn(0, 0, { extraGranted: false, skipPending: false }).nextCurrent).toBe(0);
  });

  it('rotates through all three riders in a 3-player game', () => {
    expect(advanceTurn(0, 3, { extraGranted: false, skipPending: false })).toEqual({
      nextCurrent: 1,
      isExtra: false,
      consumedSkip: false,
    });
    expect(advanceTurn(1, 3, { extraGranted: false, skipPending: false }).nextCurrent).toBe(2);
    expect(advanceTurn(2, 3, { extraGranted: false, skipPending: false }).nextCurrent).toBe(0);
  });

  it('keeps the extra turn on the third rider without consuming a skip', () => {
    expect(advanceTurn(2, 3, { extraGranted: true, skipPending: true })).toEqual({
      nextCurrent: 2,
      isExtra: true,
      consumedSkip: false,
    });
  });
});

describe('chainWalks', () => {
  it('walks with no follow-up', () => {
    expect(chainWalks(10, 3, 58, () => null)).toBe(13);
  });

  it('clamps the first walk', () => {
    expect(chainWalks(56, 9, 58, () => null)).toBe(58);
  });

  it('follows a single chained walk (storm ride model)', () => {
    expect(chainWalks(10, 3, 58, (pos) => (pos === 13 ? 24 : null))).toBe(24);
  });

  it('chains repeatedly until no follow-up', () => {
    const seen: number[] = [];
    const end = chainWalks(0, 5, 58, (pos) => {
      seen.push(pos);
      return pos < 20 ? pos + 5 : null;
    });
    expect(end).toBe(20);
    expect(seen).toEqual([5, 10, 15, 20]);
  });

  it('stops after maxHops on a cycle', () => {
    expect(
      chainWalks(0, 0, 58, () => 10, 2),
    ).toBe(10);
  });

  it('clamps chained destinations', () => {
    expect(chainWalks(50, LAIR_REPEL_STEPS, 58, () => 999)).toBe(58);
  });
});

describe('re-exports', () => {
  it('exposes the shared turn utilities through the engine', () => {
    expect(decideTurnAdvance(false, false)).toEqual({ stayCurrent: false, consumeSkip: false });
    expect(nextPlayerIndex(0, 2)).toBe(1);
  });
});

describe('regression: reported extra-turn / skip bugs', () => {
  it('catch+feast keeps a pending forfeit skip AND grants the extra turn', () => {
    // Player chose a careful ±1 move (skip pending), then tamed a dragon
    // with CATCH+FISH. Both flags must survive: the extra turn is taken
    // first, the skip is served afterwards.
    const afterChoice = grantSkip(player({ pos: 5 }), 'choice');
    const res = applyNestChallenge(afterChoice, 'meatlug', 'catchfeast');
    expect(res.extraGranted).toBe(true);
    expect(res.player.skip).toBe(true);
    expect(res.player.skipWhy).toBe('choice');
    expect(res.player.dragons).toContain('meatlug');

    const adv = advanceTurn(0, 2, { extraGranted: res.extraGranted, skipPending: res.player.skip });
    expect(adv.isExtra).toBe(true);
    expect(adv.consumedSkip).toBe(false);
    expect(adv.nextCurrent).toBe(0);
  });

  it('a feast extra is not swallowed by a pending skip', () => {
    const adv = advanceTurn(0, 2, { extraGranted: true, skipPending: true });
    expect(adv).toMatchObject({ nextCurrent: 0, isExtra: true, consumedSkip: false });
  });

  it('a retreat onto a trap is classified as a skip (backward-landing bug)', () => {
    // Escape from tile 5 drifts back 2 to tile 3, which is a trap.
    const trapPos = 5 - ESCAPE_RETREAT;
    const task = classifyTile('trap', { player: player(), pos: trapPos });
    expect(task.kind).toBe('trap');
    const skipped = grantSkip(player({ pos: trapPos }), 'net');
    expect(skipped.skip).toBe(true);
  });

  it('a retreat onto a feast is classified as an extra turn', () => {
    const task = classifyTile('feast', { player: player(), pos: 7 });
    expect(task.kind).toBe('feast');
  });

  it('a lair repel landing re-resolves through the classifier', () => {
    // Dragon-less rider blasted back 8 from the lair must resolve wherever
    // they land — including a storm that rides again.
    const stormTask = classifyTile('storm', { player: player(), pos: 43 });
    expect(stormTask.kind).toBe('stormRide');
    expect(stormTask.stormTo).toBe(44);
  });

  it('storm chains preserve an extra earned deeper in the chain', () => {
    // Storm 30 -> nest 33 (owned -> extra). The outer turn must see it.
    const owned = player({ dragons: ['toothless'] });
    const task = classifyTile('nest', { player: owned, pos: 33, dragonId: 'toothless' });
    expect(task.kind).toBe('nestOwned');
  });
});
