import { describe, expect, it } from 'vitest';
import { parseGameFormat, validateGameFormat } from './format-validation';

function createFormat() {
  return {
    schemaVersion: 1,
    formatId: 'riftbound-1v1-v1',
    rulesProfile: 'riftbound-1v1-v1',
    players: {
      ids: ['blue', 'red'],
      count: 2
    },
    phases: [{ id: 'DRAW' }],
    zones: {
      deck_blue: { id: 'deck_blue', ownerId: 'blue', kind: 'deck', visibility: 'owner', ordered: true },
      deck_red: { id: 'deck_red', ownerId: 'red', kind: 'deck', visibility: 'owner', ordered: true }
    }
  };
}

describe('validateGameFormat', () => {
  it('accepts a valid format', () => {
    const format = createFormat();
    const result = validateGameFormat(format);
    expect(result.ok).toBe(true);
  });

  it('rejects when player count mismatches ids length', () => {
    const format = createFormat();
    format.players.count = 3;
    const result = validateGameFormat(format);
    expect(result.ok).toBe(false);
  });

  it('rejects when zone id mismatches the map key', () => {
    const format = createFormat();
    format.zones.deck_blue.id = 'deck_wrong';
    const result = validateGameFormat(format);
    expect(result.ok).toBe(false);
  });

  it('parseGameFormat throws for invalid payload', () => {
    expect(() => parseGameFormat({})).toThrow(/formatId/i);
  });
});
