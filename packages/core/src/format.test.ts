import { describe, expect, it } from 'vitest';
import type { GameFormat, ReplayData } from '@manaflow/types';
import { collectReplayFormatIssues, resolveReplayFormat, validateReplayFormat } from './format';

function createBaseFormat(): GameFormat {
  return {
    schemaVersion: 1,
    formatId: 'riftbound-1v1-v1',
    name: 'Riftbound 1v1',
    rulesProfile: 'riftbound-1v1-v1',
    players: {
      ids: ['blue', 'red'],
      count: 2,
      seatOrder: ['blue', 'red']
    },
    phases: [{ id: 'DRAW' }, { id: 'MAIN' }],
    zones: {
      deck_blue: { id: 'deck_blue', ownerId: 'blue', kind: 'deck', visibility: 'owner', ordered: true },
      deck_red: { id: 'deck_red', ownerId: 'red', kind: 'deck', visibility: 'owner', ordered: true },
      stack: { id: 'stack', ownerId: 'shared', kind: 'stack', visibility: 'public' }
    },
    zoneOrder: ['deck_blue', 'deck_red', 'stack']
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

describe('resolveReplayFormat', () => {
  it('merges overrides over the base format', () => {
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
      },
      zoneOrder: ['battlefield_mid']
    };

    const resolved = resolveReplayFormat(replay, baseFormat);
    expect(resolved.phases[0].id).toBe('MAIN');
    expect(resolved.zones.deck_blue).toBeDefined();
    expect(resolved.zones.battlefield_mid).toBeDefined();
    expect(resolved.zoneOrder).toEqual(['battlefield_mid']);
  });
});

describe('collectReplayFormatIssues', () => {
  it('reports formatRef mismatch and unknown zones', () => {
    const baseFormat = createBaseFormat();
    const replay = createReplay();
    replay.formatRef = { formatId: 'mtg-1v1-v1' };
    replay.initialState.zones.unknown_zone = [];

    const issues = collectReplayFormatIssues(replay, baseFormat);
    expect(issues.some((issue) => issue.path === 'formatRef.formatId')).toBe(true);
    expect(issues.some((issue) => issue.path === 'initialState.zones')).toBe(true);
  });

  it('reports rulesProfile mismatch', () => {
    const baseFormat = createBaseFormat();
    const replay = createReplay();
    replay.initialState.metadata.rulesProfile = 'mtg-1v1-v1';

    const result = validateReplayFormat(replay, baseFormat);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((issue) => issue.path === 'initialState.metadata.rulesProfile')).toBe(true);
    }
  });

  it('reports formatRef schemaVersion mismatch', () => {
    const baseFormat = createBaseFormat();
    const replay = createReplay();
    replay.formatRef = { formatId: baseFormat.formatId, schemaVersion: 2 as 1 };

    const issues = collectReplayFormatIssues(replay, baseFormat);
    expect(issues.some((issue) => issue.path === 'formatRef.schemaVersion')).toBe(true);
  });
});
