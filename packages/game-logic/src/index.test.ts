import { describe, expect, it } from 'vitest';
import { GameAction, GameSnapshot } from '@manaflow/types';
import { tcgReplayReducer } from './index';

function createSnapshot(): GameSnapshot {
  return {
    id: 'game_1',
    players: [
      {
        id: 'p1',
        name: 'Player 1',
        health: 20,
        resources: [],
        hand: [],
        deck: [],
        discard: [],
        zones: {}
      },
      {
        id: 'p2',
        name: 'Player 2',
        health: 20,
        resources: [],
        hand: [],
        deck: [],
        discard: [],
        zones: {}
      }
    ],
    currentPhase: 'MAIN',
    currentPlayer: 'p1',
    turn: 2,
    entities: {},
    zones: {},
    metadata: {}
  };
}

function createAction(type: string): GameAction {
  return {
    type,
    playerId: 'p1',
    payload: {},
    timestamp: 1
  };
}

describe('tcgReplayReducer', () => {
  it('advances turn, switches player and resets phase on END_TURN', () => {
    const next = tcgReplayReducer(createSnapshot(), createAction('END_TURN'));
    expect(next.currentPlayer).toBe('p2');
    expect(next.turn).toBe(3);
    expect(next.currentPhase).toBe('DRAW');
  });

  it('keeps state unchanged for unknown actions', () => {
    const snapshot = createSnapshot();
    const next = tcgReplayReducer(snapshot, createAction('PLAY_CARD'));
    expect(next).toEqual(snapshot);
  });

  it('rotates to the first player after ending turn on last player', () => {
    const snapshot = createSnapshot();
    snapshot.currentPlayer = 'p2';
    const next = tcgReplayReducer(snapshot, createAction('END_TURN'));
    expect(next.currentPlayer).toBe('p1');
    expect(next.turn).toBe(3);
  });
});
