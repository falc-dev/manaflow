import { describe, expect, it } from 'vitest';
import { YamlLoader } from './serialization/yaml-loader';

const validYaml = `
schemaVersion: 1
initialState:
  id: game_1
  players:
    - id: p1
      name: Player 1
      health: 20
      resources:
        - type: MANA
          amount: 1
          max: 10
      hand: []
      deck: []
      discard: []
      zones: {}
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

describe('YamlLoader', () => {
  it('loads a valid replay', () => {
    const engine = YamlLoader.loadReplay(validYaml);
    expect(engine.getTotalFrames()).toBe(1);
    expect(engine.getCurrentState().id).toBe('game_1');
  });

  it('throws clear error for invalid schema', () => {
    expect(() => YamlLoader.loadReplay('schemaVersion: 2')).toThrow(/Invalid replay YAML/i);
  });
});
