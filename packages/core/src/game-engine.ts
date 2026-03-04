import { GameAction, GameSnapshot, ReplayEvent, createSnapshotId } from '@manaflow/types';
import { deepClone } from './utils';

export interface GameEngineHooks {
  /** Called after each action is reduced and persisted in the internal snapshot. */
  onActionApplied?: (event: ReplayEvent, snapshot: GameSnapshot) => void;
}

/** Pure reducer contract used by `GameEngine.apply`. */
export type ActionReducer = (snapshot: GameSnapshot, action: GameAction) => GameSnapshot;

/**
 * Deterministic state reducer wrapper that emits replay events for applied actions.
 */
export class GameEngine {
  private readonly reducer: ActionReducer;
  private readonly hooks: GameEngineHooks;
  private snapshot: GameSnapshot;

  /** Creates an engine with an initial snapshot, optional reducer, and optional hooks. */
  constructor(initialState: GameSnapshot, reducer?: ActionReducer, hooks: GameEngineHooks = {}) {
    this.snapshot = deepClone(initialState);
    this.reducer = reducer ?? ((state) => state);
    this.hooks = hooks;
  }

  /** Returns current state as a deep clone to preserve encapsulation. */
  getState(): GameSnapshot {
    return deepClone(this.snapshot);
  }

  /** Replaces the internal snapshot with a cloned external state. */
  reset(state: GameSnapshot): void {
    this.snapshot = deepClone(state);
  }

  /**
   * Applies one action through the reducer, persists the resulting snapshot,
   * and returns the replay event metadata associated with this action.
   */
  apply(action: GameAction): ReplayEvent {
    const event: ReplayEvent = {
      id: createSnapshotId('event'),
      action,
      timestamp: action.timestamp,
      playerId: action.playerId
    };

    const next = this.reducer(this.getState(), action);
    this.snapshot = deepClone(next);
    this.hooks.onActionApplied?.(event, this.getState());
    return event;
  }
}
