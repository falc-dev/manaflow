import { describe, expect, it } from 'vitest';
import { getEntityState, getZoneEntities, getZoneMeta } from './replay-helpers';
import { GameSnapshot } from '@manaflow/types';

const snapshot: GameSnapshot = {
  id: 'game_1',
  players: [],
  currentPhase: 'MAIN',
  currentPlayer: 'p1',
  turn: 1,
  entities: {
    card_1: {
      id: 'card_1',
      type: 'card',
      components: [],
      state: { tapped: true, damage: 2, counters: { shield: 1 } }
    }
  },
  zones: {
    deck: ['card_1']
  },
  zoneMeta: {
    deck: { ownerId: 'p1', kind: 'deck', visibility: 'owner', label: 'Deck' }
  },
  metadata: { rulesProfile: 'test-v1' }
};

describe('replay-helpers', () => {
  it('returns zone metadata', () => {
    expect(getZoneMeta(snapshot, 'deck')?.label).toBe('Deck');
  });

  it('returns zone entities with fallback', () => {
    expect(getZoneEntities(snapshot, 'deck')).toEqual(['card_1']);
    expect(getZoneEntities(snapshot, 'hand')).toEqual([]);
  });

  it('returns entity state', () => {
    expect(getEntityState(snapshot, 'card_1')?.tapped).toBe(true);
  });
});
