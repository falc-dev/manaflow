import { describe, expect, it } from 'vitest';
import {
  parseReplayJson,
  parseReplayJsonc,
  parseReplayNdjson,
  validateReplayJson,
  validateReplayJsonc,
  validateReplayNdjson,
  validateReplayYaml
} from './validation';

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
        trash_blue: [],
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
            trash_blue: [],
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

  it('does not rewrite ambiguous graveyard aliases into player trash zones', () => {
    const legacy = createReplayWithLegacyAliases();
    const initialZones = legacy.initialState.zones as Record<string, string[]>;
    delete initialZones.trash_blue;
    initialZones.graveyard = [];

    const eventZones = legacy.events[0].snapshot.zones as Record<string, string[]>;
    delete eventZones.trash_blue;
    eventZones.graveyard = [];

    const result = validateReplayJson(JSON.stringify(legacy), { normalizeRiftboundAliases: true });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((issue) => issue.path.includes('.zones') && issue.message.includes('trash_blue'))).toBe(
        true
      );
    }
  });

  it('supports JSONC payloads with comments and trailing commas', () => {
    const payload = `
      {
        // Replay schema version
        "schemaVersion": 1,
        "initialState": {
          "id": "game_jsonc",
          "players": [],
          "currentPhase": "DRAW",
          "currentPlayer": "p1",
          "turn": 1,
          "entities": {},
          "zones": { "deck": [], "hand": [], "board": [], "graveyard": [], "stack": [], },
          "metadata": {},
        },
        "events": [],
      }
    `;

    const result = validateReplayJsonc(payload);
    expect(result.ok).toBe(true);
    const replay = parseReplayJsonc(payload);
    expect(replay.initialState.id).toBe('game_jsonc');
  });

  it('supports NDJSON payloads with replay header + frame lines', () => {
    const header = JSON.stringify({
      schemaVersion: 1,
      initialState: {
        id: 'game_ndjson',
        players: [],
        currentPhase: 'DRAW',
        currentPlayer: 'p1',
        turn: 1,
        entities: {},
        zones: { deck: [], hand: [], board: [], graveyard: [], stack: [] },
        metadata: {}
      }
    });
    const frame = JSON.stringify({
      event: {
        id: 'evt_1',
        action: { type: 'DRAW', playerId: 'p1', payload: { cardId: 'c1' }, timestamp: 1 },
        timestamp: 1,
        playerId: 'p1'
      },
      snapshot: {
        id: 'game_ndjson',
        players: [],
        currentPhase: 'MAIN',
        currentPlayer: 'p1',
        turn: 1,
        entities: {},
        zones: { deck: [], hand: ['c1'], board: [], graveyard: [], stack: [] },
        metadata: {}
      }
    });
    const payload = `${header}\n${frame}\n`;

    const result = validateReplayNdjson(payload);
    expect(result.ok).toBe(true);
    const replay = parseReplayNdjson(payload);
    expect(replay.events).toHaveLength(1);
    expect(replay.initialState.id).toBe('game_ndjson');
  });

  it('reports NDJSON errors with ndjson source', () => {
    const result = validateReplayNdjson('{"schemaVersion":1}');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0].source).toBe('ndjson');
    }
  });

  it('reports YAML parse errors with yaml source', () => {
    const result = validateReplayYaml('schemaVersion: [');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0].source).toBe('yaml');
    }
  });
});
