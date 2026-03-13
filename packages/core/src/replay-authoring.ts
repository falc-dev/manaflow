import {
  GameAction,
  GameSnapshot,
  PlayerState,
  ReplayData,
  ReplayEvent,
  ReplayEventMetadata,
  ReplayFrameInput,
  Phase,
  createSnapshotId
} from '@manaflow/types';
import { deepClone } from './utils';

export type ReplayReducer = (snapshot: GameSnapshot, action: GameAction) => GameSnapshot;

export interface ReplayAuthoringEvent {
  action: GameAction;
  id?: string;
  tags?: string[];
  metadata?: ReplayEventMetadata;
}

export interface BuildReplayDataFromActionsOptions {
  eventIdPrefix?: string;
}

function toReplayEvent(input: ReplayAuthoringEvent, options: BuildReplayDataFromActionsOptions): ReplayEvent {
  return {
    id: input.id ?? createSnapshotId(options.eventIdPrefix ?? 'event'),
    action: deepClone(input.action),
    timestamp: input.action.timestamp,
    playerId: input.action.playerId,
    tags: input.tags,
    metadata: input.metadata
  };
}

export function buildReplayDataFromActions(
  initialState: GameSnapshot,
  events: ReplayAuthoringEvent[],
  reducer: ReplayReducer,
  options: BuildReplayDataFromActionsOptions = {}
): ReplayData {
  const frames: ReplayFrameInput[] = [];
  let state = deepClone(initialState);

  for (const entry of events) {
    const nextState = reducer(state, entry.action);
    frames.push({
      event: toReplayEvent(entry, options),
      snapshot: deepClone(nextState)
    });
    state = nextState;
  }

  return {
    schemaVersion: 1,
    initialState: deepClone(initialState),
    events: frames
  };
}

export interface CreateDemoReplayOptions {
  players?: number;
  cardsPerHand?: number;
  turns?: number;
}

export function createDemoReplay(options: CreateDemoReplayOptions = {}): ReplayData {
  const { players = 2, cardsPerHand = 3, turns = 3 } = options;

  const playerStates: PlayerState[] = Array.from({ length: players }, (_, i) => ({
    id: `player_${i + 1}`,
    name: `Player ${i + 1}`,
    health: 20,
    hand: Array.from({ length: cardsPerHand }, (_, j) => `card_${i}_${j}`),
    deck: [`deck_card_${i}`],
    discard: [],
    zones: {}
  }));

  const entities: Record<string, any> = {};
  playerStates.forEach((p, pi) => {
    p.hand.forEach((cardId) => {
      entities[cardId] = {
        id: cardId,
        type: 'card',
        components: [
          {
            componentType: 'CARD',
            entityId: cardId,
            metadata: {
              id: cardId,
              name: `Card ${cardId}`,
              cost: Math.floor(Math.random() * 7),
              rarity: 'common'
            }
          }
        ]
      };
    });
  });

  const initialState: GameSnapshot = {
    id: 'demo_replay',
    players: playerStates,
    currentPlayer: playerStates[0].id,
    turn: 1,
    currentPhase: 'MAIN' as Phase,
    entities,
    zones: {
      hand_player_1: playerStates[0].hand,
      hand_player_2: playerStates[1].hand,
      deck_player_1: playerStates[0].deck,
      deck_player_2: playerStates[1].deck,
      board: []
    },
    metadata: { rulesProfile: 'riftbound-1v1-v1' }
  };

  const frames: ReplayFrameInput[] = [];
  let state = deepClone(initialState);

  for (let turn = 1; turn <= turns; turn++) {
    for (let p = 0; p < players; p++) {
      const playerId = playerStates[p].id;
      const nextPlayer = playerStates[(p + 1) % players].id;

      const drawCardId = `card_${p}_drawn_${turn}`;
      entities[drawCardId] = {
        id: drawCardId,
        type: 'card',
        components: [
          {
            componentType: 'CARD',
            entityId: drawCardId,
            metadata: {
              id: drawCardId,
              name: `Drawn Card ${turn}`,
              cost: Math.floor(Math.random() * 7),
              rarity: 'common'
            }
          }
        ]
      };

      state = deepClone({
        ...state,
        players: state.players.map((pl, i) =>
          i === p
            ? { ...pl, hand: [...pl.hand, drawCardId], deck: pl.deck.slice(1) }
            : pl
        ),
        entities: { ...state.entities, [drawCardId]: entities[drawCardId] },
        zones: {
          ...state.zones,
          [`hand_${playerId}`]: [...(state.zones[`hand_${playerId}`] || []), drawCardId],
          [`deck_${playerId}`]: state.zones[`deck_${playerId}`]?.slice(1) || []
        }
      });

      frames.push({
        event: {
          id: createSnapshotId('event'),
          action: {
            type: 'DRAW_CARD',
            playerId,
            payload: { cardId: drawCardId, from: 'deck', to: 'hand' },
            timestamp: frames.length * 1000
          },
          timestamp: frames.length * 1000,
          playerId
        },
        snapshot: deepClone(state)
      });

      state = {
        ...state,
        currentPlayer: nextPlayer,
        turn: p === players - 1 ? turn + 1 : turn
      };

      if (turn <= turns || p < players - 1) {
        frames.push({
          event: {
            id: createSnapshotId('event'),
            action: {
              type: 'END_TURN',
              playerId,
              payload: { reason: 'phase_complete' },
              timestamp: frames.length * 1000
            },
            timestamp: frames.length * 1000,
            playerId
          },
          snapshot: deepClone(state)
        });
      }
    }
  }

  return {
    schemaVersion: 1,
    initialState: deepClone(initialState),
    events: frames
  };
}
