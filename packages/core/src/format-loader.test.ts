import { describe, expect, it } from 'vitest';
import type { GameFormat, ReplayData } from '@manaflow/types';
import { loadReplayWithFormat } from './format-loader';

function createBaseFormat(): GameFormat {
  return {
    schemaVersion: 1,
    formatId: 'riftbound-1v1-v1',
    name: 'Riftbound 1v1',
    rulesProfile: 'riftbound-1v1-v1',
    players: {
      ids: ['blue', 'red'],
      count: 2
    },
    phases: [{ id: 'DRAW' }, { id: 'MAIN' }],
    zones: {
      deck_blue: { id: 'deck_blue', ownerId: 'blue', kind: 'deck', visibility: 'owner', ordered: true },
      deck_red: { id: 'deck_red', ownerId: 'red', kind: 'deck', visibility: 'owner', ordered: true },
      stack: { id: 'stack', ownerId: 'shared', kind: 'stack', visibility: 'public' }
    }
  };
}

function createReplay(): ReplayData {
  const player = (id: string) => ({
    id,
    name: id,
    health: 20,
    hand: [],
    deck: [],
    discard: [],
    zones: {}
  });

  return {
    schemaVersion: 1,
    initialState: {
      id: 'game_1',
      players: [player('blue'), player('red')],
      currentPhase: 'DRAW',
      currentPlayer: 'blue',
      turn: 1,
      entities: {},
      zones: {
        deck_blue: [],
        deck_red: [],
        stack: []
      },
      metadata: {
        rulesProfile: 'riftbound-1v1-v1',
        currentPhase: 'DRAW'
      }
    },
    events: []
  };
}

describe('loadReplayWithFormat', () => {
  it('loads replay, resolves format, and validates by default', () => {
    const baseFormat = createBaseFormat();
    const replay = createReplay();
    const payload = JSON.stringify(replay);

    const result = loadReplayWithFormat(payload, baseFormat);

    expect(result.engine.getTotalFrames()).toBe(1);
    expect(result.format.rulesProfile).toBe('riftbound-1v1-v1');
    expect(result.formatValidation?.ok).toBe(true);
  });

  it('applies format overrides from the replay', () => {
    const baseFormat = createBaseFormat();
    const replay = createReplay();
    replay.formatOverrides = {
      phases: [{ id: 'MAIN' }],
      zones: {
        battlefield_mid: {
          id: 'battlefield_mid',
          ownerId: 'shared',
          kind: 'board',
          visibility: 'public'
        }
      }
    };

    const payload = JSON.stringify(replay);
    const result = loadReplayWithFormat(payload, baseFormat);

    expect(result.format.phases[0].id).toBe('MAIN');
    expect(result.format.zones.battlefield_mid).toBeDefined();
  });

  it('returns validation issues when format mismatches', () => {
    const baseFormat = createBaseFormat();
    const replay = createReplay();
    replay.formatRef = { formatId: 'mtg-1v1-v1' };
    replay.initialState.zones.unknown_zone = [];

    const payload = JSON.stringify(replay);
    const result = loadReplayWithFormat(payload, baseFormat);

    expect(result.formatValidation?.ok).toBe(false);
  });

  it('skips format validation when disabled', () => {
    const baseFormat = createBaseFormat();
    const replay = createReplay();
    replay.initialState.zones.unknown_zone = [];

    const payload = JSON.stringify(replay);
    const result = loadReplayWithFormat(payload, baseFormat, { validateFormat: false });

    expect(result.formatValidation).toBeUndefined();
  });

  it('throws when the format payload is invalid', () => {
    const baseFormat = createBaseFormat();
    baseFormat.players.count = 3;
    const replay = createReplay();

    expect(() => loadReplayWithFormat(JSON.stringify(replay), baseFormat)).toThrow(/Invalid format payload/i);
  });
});
