import { describe, expect, it } from 'vitest';
import { ReplayData } from '@manaflow/types';
import { ReplayUiPreset, validateReplayPresetCompatibility } from './preset-validation';

function createReplayData(): ReplayData {
  return {
    schemaVersion: 1,
    initialState: {
      id: 'game_1',
      players: [],
      currentPlayer: 'blue',
      currentPhase: 'DRAW',
      turn: 1,
      entities: {},
      zones: {
        battlefield_top: [],
        battlefield_bot: [],
        stack: [],
        champion_blue: [],
        champion_red: []
      },
      metadata: {
        rulesProfile: 'riftbound-1v1-v1'
      }
    },
    events: []
  };
}

describe('validateReplayPresetCompatibility', () => {
  it('returns ok for matching rulesProfile and compatible zones', () => {
    const replay = createReplayData();
    const preset: ReplayUiPreset = {
      rulesProfile: 'riftbound-1v1-v1',
      viewport: {
        zones: [{ id: 'battlefield_north' }, { id: 'stack' }]
      },
      zoneAliases: {
        battlefield_north: ['battlefield_top']
      }
    };

    const result = validateReplayPresetCompatibility(replay, preset);
    expect(result.ok).toBe(true);
  });

  it('reports rulesProfile mismatch', () => {
    const replay = createReplayData();
    const preset: ReplayUiPreset = {
      rulesProfile: 'mtg-1v1-v1'
    };

    const result = validateReplayPresetCompatibility(replay, preset);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0].code).toBe('rules_profile_mismatch');
    }
  });

  it('reports missing preset zones with path', () => {
    const replay = createReplayData();
    const preset: ReplayUiPreset = {
      viewport: {
        zones: [{ id: 'exile' }]
      }
    };

    const result = validateReplayPresetCompatibility(replay, preset);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]).toEqual({
        code: 'missing_zone',
        path: 'preset.viewport.zones[0].id',
        message: 'Replay snapshot is missing zone "exile" required by the preset.'
      });
    }
  });
});
