import { describe, expect, it } from 'vitest';
import { JsonLoader } from './json-loader';

function createRiftboundSnapshot() {
  return {
    id: 'riftbound_game_1',
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
        battlefield_north: 'neutral',
        battlefield_south: 'neutral'
      }
    }
  };
}

describe('JsonLoader replay profile validation', () => {
  it('accepts a valid replay for riftbound-1v1-v1', () => {
    const replay = {
      schemaVersion: 1,
      initialState: createRiftboundSnapshot(),
      events: []
    };

    const engine = JsonLoader.loadReplay(JSON.stringify(replay));
    expect(engine.getCurrentState().id).toBe('riftbound_game_1');
    expect(engine.getTotalFrames()).toBe(1);
  });

  it('throws when required zones are missing for riftbound-1v1-v1', () => {
    const replay = {
      schemaVersion: 1,
      initialState: {
        ...createRiftboundSnapshot(),
        zones: {
          battlefield_north: [],
          battlefield_south: []
        }
      },
      events: []
    };

    expect(() => JsonLoader.loadReplay(JSON.stringify(replay))).toThrow(/missing required zones/i);
  });

  it('throws when battlefieldCount does not match profile constraints', () => {
    const replay = {
      schemaVersion: 1,
      initialState: {
        ...createRiftboundSnapshot(),
        metadata: {
          ...createRiftboundSnapshot().metadata,
          battlefieldCount: 3
        }
      },
      events: []
    };

    expect(() => JsonLoader.loadReplay(JSON.stringify(replay))).toThrow(/battlefieldCount must be 2/i);
  });
});
