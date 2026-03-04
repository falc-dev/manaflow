import { GameAction, GameSnapshot } from '@manaflow/types';

/** Generates a best-effort unique id for runtime entities and snapshots. */
export function generateUUID(prefix = 'entity'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * JSON-based deep clone for replay/state payloads.
 *
 * Note: this is intended for plain serializable objects.
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Creates a default game snapshot scaffold for the provided players. */
export function createInitialState(players: { id: string; name: string }[]): GameSnapshot {
  const firstPlayer = players[0]?.id ?? '';

  return {
    id: generateUUID('game'),
    players: players.map((player) => ({
      id: player.id,
      name: player.name,
      health: 20,
      resources: [{ type: 'MANA', amount: 1, max: 10 }],
      hand: [],
      deck: [],
      discard: [],
      zones: {}
    })),
    currentPhase: 'DRAW',
    currentPlayer: firstPlayer,
    turn: 1,
    entities: {},
    zones: {
      deck: [],
      hand: [],
      board: [],
      graveyard: [],
      stack: []
    },
    metadata: {}
  };
}

/** Creates a timestamped action object with a generic payload map. */
export function createAction(type: string, playerId: string, payload: Record<string, unknown> = {}): GameAction {
  return {
    type,
    playerId,
    payload,
    timestamp: Date.now()
  };
}
