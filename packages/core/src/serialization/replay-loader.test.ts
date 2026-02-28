import { describe, expect, it } from 'vitest';
import { ReplayLoader } from './replay-loader';

describe('ReplayLoader', () => {
  const jsonPayload = JSON.stringify({
    schemaVersion: 1,
    initialState: {
      id: 'game_json',
      players: [],
      currentPhase: 'DRAW',
      currentPlayer: 'p1',
      turn: 1,
      entities: {},
      zones: { deck: [], hand: [], board: [], graveyard: [], stack: [] },
      metadata: {}
    },
    events: []
  });

  const jsoncPayload = `
    {
      // comment
      "schemaVersion": 1,
      "initialState": {
        "id": "game_jsonc",
        "players": [],
        "currentPhase": "DRAW",
        "currentPlayer": "p1",
        "turn": 1,
        "entities": {},
        "zones": { "deck": [], "hand": [], "board": [], "graveyard": [], "stack": [], },
        "metadata": {}
      },
      "events": []
    }
  `;

  const ndjsonPayload = `${JSON.stringify({
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
  })}\n${JSON.stringify({
    event: {
      id: 'evt_1',
      action: { type: 'DRAW', playerId: 'p1', payload: {}, timestamp: 1 },
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
      zones: { deck: [], hand: [], board: [], graveyard: [], stack: [] },
      metadata: {}
    }
  })}\n`;

  const yamlPayload = `
schemaVersion: 1
initialState:
  id: game_yaml
  players: []
  currentPhase: DRAW
  currentPlayer: p1
  turn: 1
  entities: {}
  zones:
    deck: []
    hand: []
    board: []
    graveyard: []
    stack: []
  metadata: {}
events: []
`;

  it('auto-detects JSON', () => {
    const replay = ReplayLoader.loadReplay(jsonPayload);
    expect(replay.getCurrentState().id).toBe('game_json');
  });

  it('auto-detects JSONC', () => {
    const replay = ReplayLoader.loadReplay(jsoncPayload);
    expect(replay.getCurrentState().id).toBe('game_jsonc');
  });

  it('auto-detects NDJSON', () => {
    const replay = ReplayLoader.loadReplay(ndjsonPayload);
    expect(replay.getCurrentState().id).toBe('game_ndjson');
    expect(replay.getTotalFrames()).toBe(2);
  });

  it('auto-detects YAML', () => {
    const replay = ReplayLoader.loadReplay(yamlPayload);
    expect(replay.getCurrentState().id).toBe('game_yaml');
  });

  it('supports explicit format override', () => {
    const replay = ReplayLoader.loadReplay(jsonPayload, 'json');
    expect(replay.getCurrentState().id).toBe('game_json');
  });
});
