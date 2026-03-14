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
      battlefield_north: { id: 'battlefield_north', ownerId: 'shared', kind: 'board', visibility: 'public' },
      battlefield_south: { id: 'battlefield_south', ownerId: 'shared', kind: 'board', visibility: 'public' },
      champion_blue: { id: 'champion_blue', ownerId: 'blue', kind: 'board', visibility: 'owner' },
      champion_red: { id: 'champion_red', ownerId: 'red', kind: 'board', visibility: 'owner' },
      deck_blue: { id: 'deck_blue', ownerId: 'blue', kind: 'deck', visibility: 'owner', ordered: true },
      deck_red: { id: 'deck_red', ownerId: 'red', kind: 'deck', visibility: 'owner', ordered: true },
      runes_blue: { id: 'runes_blue', ownerId: 'blue', kind: 'resource', visibility: 'owner' },
      runes_red: { id: 'runes_red', ownerId: 'red', kind: 'resource', visibility: 'owner' },
      rune_deck_blue: { id: 'rune_deck_blue', ownerId: 'blue', kind: 'deck', visibility: 'owner', ordered: true },
      rune_deck_red: { id: 'rune_deck_red', ownerId: 'red', kind: 'deck', visibility: 'owner', ordered: true },
      trash_blue: { id: 'trash_blue', ownerId: 'blue', kind: 'discard', visibility: 'owner' },
      trash_red: { id: 'trash_red', ownerId: 'red', kind: 'discard', visibility: 'owner' },
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
        battlefield_north: [],
        battlefield_south: [],
        champion_blue: [],
        champion_red: [],
        deck_blue: [],
        deck_red: [],
        runes_blue: [],
        runes_red: [],
        rune_deck_blue: [],
        rune_deck_red: [],
        trash_blue: [],
        trash_red: [],
        stack: []
      },
      metadata: {
        rulesProfile: 'riftbound-1v1-v1',
        battlefieldCount: 2,
        control: {
          battlefield_north: 'blue',
          battlefield_south: 'red'
        }
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
