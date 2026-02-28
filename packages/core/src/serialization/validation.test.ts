import { describe, expect, it } from 'vitest';
import { parseReplayJson, validateReplayJson } from './validation';

function createReplayWithLegacyAliases() {
  return {
    schemaVersion: 1,
    initialState: {
      id: 'riftbound_game_legacy',
      players: [
        {
          id: 'blue',
          name: 'Blue',
          health: 20,
          resources: [{ type: 'RUNE', amount: 2, max: 12 }],
          hand: [],
          deck: [],
          discard: [],
          zones: {}
        },
        {
          id: 'red',
          name: 'Red',
          health: 20,
          resources: [{ type: 'RUNE', amount: 2, max: 12 }],
          hand: [],
          deck: [],
          discard: [],
          zones: {}
        }
      ],
      currentPhase: 'MAIN',
      currentPlayer: 'blue',
      turn: 1,
      entities: {},
      zones: {
        battlefield_top: ['north_lane'],
        battlefield_bot: ['south_lane'],
        blue_base: [],
        red_base: [],
        deck_blue: [],
        deck_red: [],
        runes_blue: [],
        runes_red: [],
        rune_deck_blue: [],
        rune_deck_red: [],
        graveyard: [],
        trash_red: [],
        stack: []
      },
      metadata: {
        rulesProfile: 'riftbound-1v1-v1',
        battlefieldCount: 2,
        control: {
          battlefield_top: 'blue',
          battlefield_bot: 'red'
        }
      }
    },
    events: [
      {
        event: {
          id: 'evt_1',
          action: {
            type: 'DEPLOY_UNIT',
            playerId: 'blue',
            payload: { cardId: 'u1', from: 'blue_base', to: 'battlefield_top' },
            timestamp: 1
          },
          timestamp: 1,
          playerId: 'blue'
        },
        snapshot: {
          id: 'riftbound_game_legacy',
          players: [
            {
              id: 'blue',
              name: 'Blue',
              health: 20,
              resources: [{ type: 'RUNE', amount: 2, max: 12 }],
              hand: [],
              deck: [],
              discard: [],
              zones: {}
            },
            {
              id: 'red',
              name: 'Red',
              health: 20,
              resources: [{ type: 'RUNE', amount: 2, max: 12 }],
              hand: [],
              deck: [],
              discard: [],
              zones: {}
            }
          ],
          currentPhase: 'MAIN',
          currentPlayer: 'blue',
          turn: 1,
          entities: {},
          zones: {
            battlefield_top: ['north_lane', 'u1'],
            battlefield_bot: ['south_lane'],
            blue_base: [],
            red_base: [],
            deck_blue: [],
            deck_red: [],
            runes_blue: [],
            runes_red: [],
            rune_deck_blue: [],
            rune_deck_red: [],
            graveyard: [],
            trash_red: [],
            stack: []
          },
          metadata: {
            rulesProfile: 'riftbound-1v1-v1',
            battlefieldCount: 2,
            control: {
              battlefield_top: 'blue',
              battlefield_bot: 'red'
            }
          }
        }
      }
    ]
  };
}

describe('Replay validation utilities', () => {
  it('reports path-based issues for invalid payloads', () => {
    const result = validateReplayJson('{"schemaVersion":2}');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0].path).toContain('schemaVersion');
    }
  });

  it('normalizes legacy alias zones for riftbound profile', () => {
    const replay = parseReplayJson(JSON.stringify(createReplayWithLegacyAliases()), {
      normalizeRiftboundAliases: true
    });
    expect(replay.initialState.zones.battlefield_north).toEqual(['north_lane']);
    expect(replay.initialState.zones.battlefield_south).toEqual(['south_lane']);
    expect(replay.initialState.zones.champion_blue).toEqual([]);
    expect(replay.initialState.zones.champion_red).toEqual([]);
    expect(replay.initialState.zones.trash_blue).toEqual([]);
    expect(replay.events[0].event.action.payload.to).toBe('battlefield_north');
  });
});
