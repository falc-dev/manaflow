import { describe, expect, it } from 'vitest';
import { GameSnapshot } from '@manaflow/types';
import { selectPlayerField, selectPlayerFields } from './player-field';

function makeSnapshot(): GameSnapshot {
  return {
    id: 'game_1',
    players: [
      {
        id: 'p1',
        name: 'Player 1',
        health: 20,
        resources: [{ type: 'MANA', amount: 2, max: 10 }],
        hand: ['card_1'],
        deck: ['card_2'],
        discard: ['card_3'],
        zones: {}
      },
      {
        id: 'p2',
        name: 'Player 2',
        health: 18,
        resources: [{ type: 'MANA', amount: 1, max: 10 }],
        hand: ['card_4'],
        deck: ['card_5'],
        discard: [],
        zones: {
          graveyard: ['card_6']
        }
      }
    ],
    currentPhase: 'DRAW',
    currentPlayer: 'p1',
    turn: 1,
    entities: {},
    zones: {
      hand: ['card_1', 'card_4'],
      deck: ['card_2', 'card_5'],
      board: [],
      graveyard: ['card_3', 'card_6'],
      stack: []
    },
    metadata: {}
  };
}

describe('selectPlayerField', () => {
  it('returns hand/deck/trash for a specific player', () => {
    const snapshot = makeSnapshot();
    const field = selectPlayerField(snapshot, 'p1');

    expect(field).toEqual({
      playerId: 'p1',
      playerName: 'Player 1',
      health: 20,
      resources: [{ type: 'MANA', amount: 2, max: 10 }],
      zones: {
        hand: ['card_1'],
        deck: ['card_2'],
        trash: ['card_3']
      }
    });
  });

  it('falls back to player graveyard/trash zone when discard is empty', () => {
    const snapshot = makeSnapshot();
    const field = selectPlayerField(snapshot, 'p2');

    expect(field?.zones.trash).toEqual(['card_6']);
  });

  it('returns null for unknown players', () => {
    const snapshot = makeSnapshot();

    expect(selectPlayerField(snapshot, 'missing')).toBeNull();
  });

  it('supports custom zone aliases through zoneMap', () => {
    const snapshot = makeSnapshot();
    snapshot.players[0].zones.reserve = ['card_7'];
    snapshot.players[0].zones.bin = ['card_8'];

    const field = selectPlayerField(snapshot, 'p1', {
      zoneMap: {
        hand: ['reserve', 'hand'],
        trash: ['bin', 'discard']
      }
    });

    expect(field?.zones.hand).toEqual(['card_7']);
    expect(field?.zones.trash).toEqual(['card_8']);
  });
});

describe('selectPlayerFields', () => {
  it('returns one field entry per player', () => {
    const snapshot = makeSnapshot();
    const fields = selectPlayerFields(snapshot);

    expect(fields).toHaveLength(2);
    expect(fields[0].playerId).toBe('p1');
    expect(fields[1].playerId).toBe('p2');
  });
});
