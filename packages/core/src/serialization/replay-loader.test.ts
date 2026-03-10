import { describe, expect, it } from 'vitest';
import { ReplayLoader } from './replay-loader';

describe('ReplayLoader', () => {
  const jsonPayload = JSON.stringify({
    schemaVersion: 1,
    initialState: {
      id: 'game_json',
      players: [],
      currentPlayer: 'p1',
      turn: 1,
      entities: {},
      zones: { deck: [], hand: [], board: [], graveyard: [], stack: [] },
      metadata: { rulesProfile: 'test-v1', currentPhase: 'DRAW' }
    },
    events: []
  });
  const prettyJsonPayload = JSON.stringify(JSON.parse(jsonPayload), null, 2);

  const jsoncPayload = `
    {
      // comment
      "schemaVersion": 1,
      "initialState": {
        "id": "game_jsonc",
        "players": [],
        "currentPlayer": "p1",
        "turn": 1,
        "entities": {},
        "zones": { "deck": [], "hand": [], "board": [], "graveyard": [], "stack": [], },
        "metadata": {"rulesProfile": "test-v1", "currentPhase": "DRAW"}
      },
      "events": []
    }
  `;

  const ndjsonPayload = `${JSON.stringify({
    schemaVersion: 1,
    initialState: {
      id: 'game_ndjson',
      players: [],
      currentPlayer: 'p1',
      turn: 1,
      entities: {},
      zones: { deck: [], hand: [], board: [], graveyard: [], stack: [] },
      metadata: { rulesProfile: 'test-v1', currentPhase: 'DRAW' }
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
      currentPlayer: 'p1',
      turn: 1,
      entities: {},
      zones: { deck: [], hand: [], board: [], graveyard: [], stack: [] },
      metadata: { rulesProfile: 'test-v1', currentPhase: 'MAIN' }
    }
  })}`;

  const yamlPayload = `
schemaVersion: 1
initialState:
  id: game_yaml
  players: []
  currentPlayer: p1
  turn: 1
  entities: {}
  zones:
    deck: []
    hand: []
    board: []
    graveyard: []
    stack: []
  metadata: { rulesProfile: 'test-v1', currentPhase: 'DRAW' }
events: []
`;

  it('auto-detects JSON', () => {
    const replay = ReplayLoader.loadReplay(jsonPayload);
    expect(replay.getCurrentState().id).toBe('game_json');
  });

  it('auto-detects pretty JSON', () => {
    const replay = ReplayLoader.loadReplay(prettyJsonPayload);
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
