import { describe, expect, it } from 'vitest';
import { ReplayEngine } from './replay-engine';
import { GameSnapshot, ReplayEvent } from '@manaflow/types';

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

describe('ReplayEngine', () => {
  it('navigates 0 -> N -> 0 deterministically', () => {
    const engine = new ReplayEngine(makeSnapshot(1));
    engine.appendSnapshot(makeSnapshot(2), makeEvent('e1', 1000));
    engine.appendSnapshot(makeSnapshot(3), makeEvent('e2', 2000));

    expect(engine.getCurrentState().turn).toBe(3);
    expect(engine.stepBack()?.snapshot.turn).toBe(2);
    expect(engine.stepBack()?.snapshot.turn).toBe(1);
    expect(engine.stepBack()).toBeNull();
    expect(engine.stepForward()?.snapshot.turn).toBe(2);
    expect(engine.stepForward()?.snapshot.turn).toBe(3);
  });

  it('seeks by timestamp', () => {
    const engine = new ReplayEngine(makeSnapshot(1));
    engine.appendSnapshot(makeSnapshot(2), makeEvent('e1', 1000));
    engine.appendSnapshot(makeSnapshot(3), makeEvent('e2', 2000));

    expect(engine.seek({ timestamp: 1500 })?.snapshot.turn).toBe(2);
    expect(engine.seek({ timestamp: 3000 })?.snapshot.turn).toBe(3);
  });
});
