import { describe, expect, it } from 'vitest';
import { buildReplayDataFromActions } from './replay-authoring';

function createInitialState() {
  return {
    id: 'game',
    players: [
      { id: 'p1', name: 'P1', health: 20, resources: [], hand: [], deck: [], discard: [], zones: {} },
      { id: 'p2', name: 'P2', health: 20, resources: [], hand: [], deck: [], discard: [], zones: {} }
    ],
    currentPhase: 'MAIN',
    currentPlayer: 'p1',
    turn: 1,
    entities: {},
    zones: {},
    metadata: {}
  };
}

describe('buildReplayDataFromActions', () => {
  it('derives frame snapshots from action stream using reducer', () => {
    const replay = buildReplayDataFromActions(
      createInitialState(),
      [
        {
          action: {
            type: 'END_TURN',
            playerId: 'p1',
            payload: {},
            timestamp: 1000
          }
        }
      ],
      (snapshot, action) => {
        if (action.type !== 'END_TURN') {
          return snapshot;
        }
        return {
          ...snapshot,
          currentPlayer: snapshot.currentPlayer === 'p1' ? 'p2' : 'p1',
          currentPhase: 'DRAW',
          turn: snapshot.turn + 1
        };
      }
    );

    expect(replay.schemaVersion).toBe(1);
    expect(replay.events).toHaveLength(1);
    expect(replay.events[0].event.action.type).toBe('END_TURN');
    expect(replay.events[0].snapshot.currentPlayer).toBe('p2');
    expect(replay.events[0].snapshot.turn).toBe(2);
  });

  it('preserves explicit event metadata and id', () => {
    const replay = buildReplayDataFromActions(
      createInitialState(),
      [
        {
          id: 'evt_explicit',
          tags: ['turn-end'],
          metadata: { intent: 'pass-priority' },
          action: {
            type: 'END_TURN',
            playerId: 'p1',
            payload: {},
            timestamp: 1000
          }
        }
      ],
      (snapshot) => snapshot
    );

    expect(replay.events[0].event.id).toBe('evt_explicit');
    expect(replay.events[0].event.tags).toEqual(['turn-end']);
    expect(replay.events[0].event.metadata).toEqual({ intent: 'pass-priority' });
  });
});
