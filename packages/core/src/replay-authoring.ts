import { GameAction, GameSnapshot, ReplayData, ReplayEvent, ReplayFrameInput, createSnapshotId } from '@manaflow/types';
import { deepClone } from './utils';

export type ReplayReducer = (snapshot: GameSnapshot, action: GameAction) => GameSnapshot;

export interface ReplayAuthoringEvent {
  action: GameAction;
  id?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
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
