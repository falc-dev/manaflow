import { describe, expect, it, vi } from 'vitest';
import { ReplayEngine } from '@manaflow/core';
import { GameSnapshot, ReplayEvent } from '@manaflow/types';
import { createReactReplayStore } from './store';
import { createUseReplayStore } from './use-replay-store';

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

function makeStore() {
  const replay = new ReplayEngine(makeSnapshot(1));
  replay.appendSnapshot(makeSnapshot(2), makeEvent('e1', 1000));
  replay.seek({ frame: 0 });
  return createReactReplayStore(replay);
}

describe('createUseReplayStore', () => {
  it('reads selected state via useSyncExternalStore', () => {
    const store = makeStore();
    const observed: number[] = [];
    const useSyncExternalStore = vi.fn((subscribe, getSnapshot) => {
      const unsubscribe = subscribe(() => {
        observed.push(getSnapshot());
      });
      const current = getSnapshot();
      // Keep the subscription alive during the test.
      void unsubscribe;
      return current;
    });

    const useReplayStore = createUseReplayStore(useSyncExternalStore);
    const currentFrame = useReplayStore(store, (state) => state.currentFrame);

    expect(currentFrame).toBe(0);
    store.next();
    expect(observed).toEqual([0, 1]);
    expect(useSyncExternalStore).toHaveBeenCalledTimes(1);

    store.destroy();
  });

  it('returns a stable snapshot reference when store state did not change', () => {
    const store = makeStore();
    let firstSnapshot: unknown;
    let secondSnapshot: unknown;

    const useSyncExternalStore = vi.fn((subscribe, getSnapshot) => {
      const unsubscribe = subscribe(() => undefined);
      firstSnapshot = getSnapshot();
      secondSnapshot = getSnapshot();
      unsubscribe();
      return secondSnapshot;
    });

    const useReplayStore = createUseReplayStore(useSyncExternalStore);
    useReplayStore(store);

    expect(firstSnapshot).toBe(secondSnapshot);
    store.destroy();
  });
});
