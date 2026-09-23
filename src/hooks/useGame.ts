import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { teamPower, randomLossIndex } from '../core/battle';
import { buildPath, clampPos, nextNest } from '../core/board';
import {
  ALPHA_BASE,
  COURAGE,
  DRAGONS,
  MAX_DRAGONS,
  MAIN_SEGS,
  createInitialPlayers,
  type DragonId,
  type PlayerState,
} from '../core/constants';
import { sound } from '../lib/sound';
import { sleep } from '../utils/sleep';
import type { WheelHandle } from '../components/molecules/Wheel';

export interface LogEntry {
  id: number;
  html: string;
  color: string;
}

export type ModalState =
  | { kind: 'event'; icon: string; title: string; html: string; accent: string; okLabel?: string }
  | { kind: 'move'; val: number; atStart: boolean; playerName: string }
  | { kind: 'challenge'; dragonId: DragonId; playerName: string }
  | { kind: 'battle'; playerId: number }
  | { kind: 'howto' }
  | { kind: 'win'; winnerId: number }
  | null;

export type ChallengeKey = 'catch' | 'catchfeast' | 'escape' | 'trap';

/**
 * Full game state machine (view model). Owns players, turn flow, movement
 * animation, tile resolution and modal promises — the same rules as the
 * original single-file game, driven by React state instead of direct DOM.
 */
export function useGame() {
  const tiles = useMemo(() => buildPath(), []);
  const last = tiles.length - 1;

  const [players, setPlayers] = useState<PlayerState[]>(() => createInitialPlayers());
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<'play' | 'over'>('play');
  const [turnMsg, setTurnMsg] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [spinDisabled, setSpinDisabled] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [fadeToken, setFadeToken] = useState<number | null>(null);

  const playersRef = useRef(players);
  const currentRef = useRef(current);
  const extraTurnRef = useRef(false);
  const resolverRef = useRef<((v: never) => void) | null>(null);
  const logId = useRef(0);
  const mainWheelRef = useRef<WheelHandle>(null);
  const busyRef = useRef(false);
  const howtoShown = useRef(false);

  playersRef.current = players;
  currentRef.current = current;

  const cur = () => playersRef.current[currentRef.current];

  const pushLog = useCallback((html: string, color = '#8fa3c8') => {
    const id = ++logId.current;
    setLogs((prev) => [{ id, html, color }, ...prev].slice(0, 40));
  }, []);

  const highlightTile = useCallback((i: number) => setHighlight(i), []);

  /* ---------- modal promises (same "confirm every event with OK" UX) ---------- */

  const awaitModal = useCallback(<T,>(state: ModalState): Promise<T> => {
    setModal(state);
    return new Promise<T>((resolve) => {
      resolverRef.current = resolve as (v: never) => void;
    });
  }, []);

  const closeModalResolve = useCallback((value: unknown) => {
    setModal(null);
    const r = resolverRef.current;
    resolverRef.current = null;
    if (r) r(value as never);
  }, []);

  const showEvent = useCallback(
    (icon: string, title: string, html: string, accent = '#f0b429', okLabel = 'OK') =>
      awaitModal<void>({ kind: 'event', icon, title, html, accent, okLabel }),
    [awaitModal],
  );

  /* ---------- movement ---------- */

  const syncPlayers = useCallback((next: PlayerState[]) => {
    playersRef.current = next;
    setPlayers(next);
  }, []);

  const movePlayer = useCallback(
    async (playerIdx: number, n: number) => {
      const dir = n >= 0 ? 1 : -1;
      for (let i = 0; i < Math.abs(n); i++) {
        const p = playersRef.current[playerIdx];
        const next = clampPos(p.pos + dir, last);
        if (next === p.pos) break;
        const updated = playersRef.current.map((pl, k) => (k === playerIdx ? { ...pl, pos: next } : pl));
        syncPlayers(updated);
        sound.step();
        highlightTile(next);
        await sleep(230);
      }
    },
    [highlightTile, last, syncPlayers],
  );

  const teleportPlayer = useCallback(
    async (playerIdx: number, idx: number) => {
      setFadeToken(playerIdx);
      await sleep(340);
      const dest = clampPos(idx, last);
      syncPlayers(playersRef.current.map((pl, k) => (k === playerIdx ? { ...pl, pos: dest } : pl)));
      setFadeToken(null);
      highlightTile(dest);
      await sleep(540);
    },
    [highlightTile, last, syncPlayers],
  );

  /* ---------- tile resolution (ported 1:1 from the original rules) ---------- */

  const endGame = useCallback(
    (winnerIdx: number) => {
      setPhase('over');
      sound.win();
      const w = playersRef.current[winnerIdx];
      pushLog(`👑 <b>${w.name}</b> defeated the Alpha and wins the game!`, '#f0b429');
      setTurnMsg('Game over!');
      setModal({ kind: 'win', winnerId: winnerIdx });
    },
    [pushLog],
  );

  const resolveTile = useCallback(
    async (playerIdx: number, depth = 0): Promise<'won' | void> => {
      const p = () => playersRef.current[playerIdx];
      const t = tiles[p().pos];
      highlightTile(p().pos);

      switch (t.type) {
        case 'safe': {
          pushLog(`<b>${p().name}</b>: ${t.flavor}`, p().color);
          await showEvent('✦', 'Safe Skies', `<b>${p().name}</b> — ${t.flavor}`, '#8fa3c8');
          break;
        }
        case 'trap': {
          syncPlayers(playersRef.current.map((pl, k) => (k === playerIdx ? { ...pl, skip: true, skipWhy: 'net' as const } : pl)));
          sound.bad();
          pushLog(`🪤 <b>${p().name}</b> got caught in a trapper net — next turn lost.`, '#ff5d5d');
          await showEvent('🪤', "Trapper's Net!", `<b>${p().name}</b> is tangled in a dragon trapper's net and <b>loses the next turn</b>!`, '#ff5d5d');
          break;
        }
        case 'feast': {
          sound.good();
          extraTurnRef.current = true;
          pushLog(`🐟 <b>${p().name}</b> found a fish feast — extra spin!`, '#ffc93c');
          await showEvent('🐟', 'Fish Feast!', `<b>${p().name}</b> devours a giant fish feast and is full of energy — <b>spin again</b>!`, '#ffc93c');
          break;
        }
        case 'storm': {
          if (depth >= 2) {
            await showEvent('🌀', 'Storm Fizzles', `The storm wind dies down around <b>${p().name}</b>... nothing happens.`, '#4dd7fe');
            break;
          }
          const target = nextNest(p().pos);
          if (target == null) {
            await showEvent('🌀', 'Storm Fizzles', `The storm wind dies down around <b>${p().name}</b>... nothing happens.`, '#4dd7fe');
            break;
          }
          sound.roar();
          pushLog(`🌀 A storm wind carried <b>${p().name}</b> to tile ${target}.`, '#4dd7fe');
          await showEvent(
            '🌀',
            'Storm Vortex!',
            `The howling wind scoops up <b>${p().name}</b> and carries them straight to <b>${DRAGONS[tiles[target].dragon as DragonId].name}</b>'s nest (tile ${target})!`,
            '#4dd7fe',
          );
          await movePlayer(playerIdx, target - p().pos);
          await resolveTile(playerIdx, depth + 1);
          break;
        }
        case 'nest': {
          const dragonId = t.dragon as DragonId;
          const d = DRAGONS[dragonId];
          if (p().dragons.includes(dragonId)) {
            sound.good();
            extraTurnRef.current = true;
            pushLog(`💚 <b>${p().name}</b> reunited with ${d.name} — extra spin!`, '#59d98c');
            await showEvent('💚', 'An Old Friend!', `<b>${d.name}</b> greets <b>${p().name}</b> with a happy warble. Already part of the flock — <b>spin again</b>!`, '#59d98c');
            break;
          }
          if (p().dragons.length >= MAX_DRAGONS) {
            pushLog(`${d.name} greeted <b>${p().name}</b>, whose flock is already full.`, '#59d98c');
            await showEvent('🐉', 'Flock Is Full!', `<b>${d.name}</b> circles <b>${p().name}</b> happily, but the flock of ${MAX_DRAGONS} is already complete. Onward!`, '#59d98c');
            break;
          }
          const key = await awaitModal<ChallengeKey>({ kind: 'challenge', dragonId, playerName: p().name });
          if (key === 'catch' || key === 'catchfeast') {
            syncPlayers(playersRef.current.map((pl, k) => (k === playerIdx ? { ...pl, dragons: [...pl.dragons, dragonId] } : pl)));
            sound.good();
            pushLog(`🐉 <b>${p().name}</b> tamed <b>${d.name}</b> the ${d.species}! (${p().dragons.length}/${MAX_DRAGONS})`, '#59d98c');
            if (key === 'catchfeast') extraTurnRef.current = true;
          } else if (key === 'escape') {
            pushLog(`💨 ${d.name} slipped away from <b>${p().name}</b>.`, '#7d8db0');
            await movePlayer(playerIdx, -2);
            await showEvent('💨', 'The Dragon Escaped!', `<b>${d.name}</b> slipped through the clouds. <b>${p().name}</b> drifts back <b>2 spaces</b>.`, '#7d8db0');
          } else {
            syncPlayers(playersRef.current.map((pl, k) => (k === playerIdx ? { ...pl, skip: true, skipWhy: 'net' as const } : pl)));
            pushLog(`🪤 <b>${p().name}</b> triggered a net while chasing ${d.name}.`, '#ff5d5d');
            await showEvent('🪤', 'Net Trap!', `While chasing <b>${d.name}</b>, <b>${p().name}</b> triggers a hidden net — <b>next turn lost</b>!`, '#ff5d5d');
          }
          break;
        }
        case 'lair': {
          if (p().dragons.length >= 1) {
            const won = await awaitModal<boolean>({ kind: 'battle', playerId: playerIdx });
            if (won) {
              endGame(playerIdx);
              return 'won';
            }
            let lostName = '';
            if (p().dragons.length) {
              const ri = randomLossIndex(p().dragons.length);
              const lost = p().dragons[ri];
              lostName = DRAGONS[lost].name;
              syncPlayers(
                playersRef.current.map((pl, k) =>
                  k === playerIdx ? { ...pl, dragons: pl.dragons.filter((_, j) => j !== ri) } : pl,
                ),
              );
              pushLog(`💔 <b>${p().name}</b> lost ${lostName} as the flock scattered!`, '#ff5d5d');
            }
            sound.bad();
            pushLog(`🧊 The Alpha defeated <b>${p().name}</b> — sent back to the very start!`, '#9fdcff');
            await showEvent(
              '🧊',
              'The Alpha Wins!',
              `The flock scatters in the blizzard!${lostName ? ` <b>${lostName}</b> flies away into the mist.` : ''} <b>${p().name}</b> is sent <b>all the way back to Berk Village</b> to start the journey anew.`,
              '#9fdcff',
            );
            await teleportPlayer(playerIdx, 0);
          } else {
            sound.roar();
            pushLog(`🧊 The Alpha blasted <b>${p().name}</b> away from the lair — no dragons to fight with!`, '#9fdcff');
            await showEvent(
              '🧊',
              "The Alpha's Icy Roar!",
              `<b>${p().name}</b> arrives with <b>no dragons</b>! The Glacial Tyrant's roar blasts them back <b>8 spaces</b>. Tame a flock first!`,
              '#9fdcff',
            );
            await movePlayer(playerIdx, -8);
          }
          break;
        }
        case 'start':
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [awaitModal, endGame, highlightTile, movePlayer, pushLog, showEvent, syncPlayers, teleportPlayer, tiles],
  );

  const gameOver = endGame;

  /* ---------- turn flow ---------- */

  const turnHint = useCallback((player: PlayerState) => {
    if (player.dragons.length >= MAX_DRAGONS) setTurnMsg(`⚔️ Flock complete! Reach the <b>Alpha's Lair</b>!`);
    else if (player.dragons.length >= 1)
      setTurnMsg(`🎡 Spin! ${player.dragons.length}/${MAX_DRAGONS} dragons — a bigger flock means better odds vs the Alpha`);
    else setTurnMsg(`🎡 Spin the wheel! Find nests to build your flock`);
  }, []);

  const nextTurn = useCallback(
    (extra: boolean) => {
      if (extra) {
        pushLog(`✨ <b>${cur().name}</b> takes an extra turn!`, cur().color);
      } else {
        const n = 1 - currentRef.current;
        currentRef.current = n;
        setCurrent(n);
      }
      beginTurn();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pushLog],
  );

  const beginTurn = useCallback(async () => {
    const p = cur();
    if (p.skip) {
      const why = p.skipWhy || 'net';
      syncPlayers(playersRef.current.map((pl) => (pl.id === p.id ? { ...pl, skip: false, skipWhy: null } : pl)));
      setSpinDisabled(true);
      setTurnMsg(`⏳ ${p.name} sits this turn out.`);
      if (why === 'choice') {
        pushLog(`⏳ <b>${p.name}</b> sits out — the price of a 1-space move.`, '#ffb020');
        await showEvent('⏳', 'Turn Skipped!', `<b>${p.name}</b> paid the price of the careful 1-space move and sits this turn out.`, '#ffb020');
      } else {
        pushLog(`🪤 <b>${p.name}</b> loses a turn in the net.`, '#ff5d5d');
        await showEvent('🪤', 'Turn Lost!', `<b>${p.name}</b> is still untangling from the trapper's net — this turn is skipped.`, '#ff5d5d');
      }
      nextTurn(false);
      return;
    }
    turnHint(p);
    setSpinDisabled(false);
  }, [nextTurn, pushLog, showEvent, syncPlayers, turnHint]);

  const handleSpin = useCallback(async () => {
    if (busyRef.current || phase !== 'play') return;
    busyRef.current = true;
    setSpinDisabled(true);
    const idx = currentRef.current;
    const p = () => playersRef.current[idx];
    try {
      extraTurnRef.current = false;
      setTurnMsg('Spinning...');
      const segIdx = await mainWheelRef.current?.spin();
      if (segIdx == null) return;
      const val = MAIN_SEGS[segIdx].value as number;
      sound.good();
      setTurnMsg(`${p().name} spins <b>${val}</b>!`);
      pushLog(`🎡 <b>${p().name}</b> spun a ${val}.`, p().color);
      await sleep(300);
      const steps = await awaitModal<number>({ kind: 'move', val, atStart: p().pos === 0, playerName: p().name });
      if (steps !== val) {
        syncPlayers(playersRef.current.map((pl, k) => (k === idx ? { ...pl, skip: true, skipWhy: 'choice' as const } : pl)));
        pushLog(`🐾 <b>${p().name}</b> chose to move ${steps > 0 ? 'forward' : 'backward'} 1 — next turn is forfeit.`, p().color);
        setTurnMsg(`${p().name} moves ${steps > 0 ? 'forward' : 'back'} 1 — next turn forfeit!`);
      } else {
        setTurnMsg(`${p().name} rides forward ${val}!`);
      }
      await movePlayer(idx, steps);
      const res = await resolveTile(idx);
      if (res === 'won') return;
      nextTurn(extraTurnRef.current);
    } finally {
      busyRef.current = false;
    }
  }, [awaitModal, movePlayer, nextTurn, phase, pushLog, resolveTile, syncPlayers]);

  /* ---------- init ---------- */

  useEffect(() => {
    if (howtoShown.current) return; // guard StrictMode double-mount in dev
    howtoShown.current = true;
    pushLog('🐉 The saga begins! Tame dragons and be the first to defeat the Alpha.', '#f0b429');
    setModal({ kind: 'howto' });
    beginTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSound = useCallback(() => {
    sound.enabled = !sound.enabled;
    setSoundOn(sound.enabled);
  }, []);

  const restart = useCallback(() => window.location.reload(), []);

  return {
    tiles,
    last,
    players,
    current,
    phase,
    turnMsg,
    logs,
    modal,
    highlight,
    spinDisabled,
    soundOn,
    fadeToken,
    mainWheelRef,
    teamPowerOf: (p: PlayerState) => teamPower(p.dragons),
    handleSpin,
    gameOver,
    closeModalResolve,
    toggleSound,
    restart,
    showHowto: () => setModal({ kind: 'howto' }),
    pushLog,
    ALPHA_BASE,
    COURAGE,
  };
}

export type GameApi = ReturnType<typeof useGame>;
