import { describe, expect, it } from 'vitest';
import { ReplayEngine } from '@manaflow/core';
import { GameSnapshot, ReplayEvent } from '@manaflow/types';
import { createReactReplayStore } from './store';

function makeSnapshot(turn: number): GameSnapshot {
  return {
    id: 'game_1',
    players: [
      {
        id: 'p1',
        name: 'P1',
        health: 20,
        resources: [{ type: 'MANA', amount: 1, max: 10 }],
        hand: [],
        deck: [],
        discard: [],
        zones: {}
      }
    ],
    currentPhase: 'DRAW',
    currentPlayer: 'p1',
    turn,
    entities: {},
    zones: { deck: [], hand: [], board: [], graveyard: [], stack: [] },
    metadata: {}
  };
}

function makeEvent(id: string, timestamp: number): ReplayEvent {
  return {
    id,
    action: { type: 'NOOP', playerId: 'p1', payload: {}, timestamp },
    timestamp,
    playerId: 'p1'
  };
}

function makeReplay(): ReplayEngine {
  const replay = new ReplayEngine(makeSnapshot(1));
  replay.appendSnapshot(makeSnapshot(2), makeEvent('e1', 1000));
  replay.appendSnapshot(makeSnapshot(3), makeEvent('e2', 2000));
  replay.seek({ frame: 0 });
  return replay;
}

describe('createReactReplayStore', () => {
  it('emits initial state on subscribe and updates on next/previous', () => {
    const store = createReactReplayStore(makeReplay());
    const seen: number[] = [];

    const unsubscribe = store.subscribe((state) => {
      seen.push(state.currentFrame);
    });

    expect(seen).toEqual([0]);
    store.next();
    store.next();
    store.previous();

    expect(seen).toEqual([0, 1, 2, 1]);
    unsubscribe();
    store.destroy();
  });

  it('seek outside frame bounds returns null and does not notify', () => {
    const store = createReactReplayStore(makeReplay());
    let calls = 0;

    const unsubscribe = store.subscribe(() => {
      calls += 1;
    });

    expect(store.seek(99)).toBeNull();
    expect(calls).toBe(1);

    unsubscribe();
    store.destroy();
  });
});
