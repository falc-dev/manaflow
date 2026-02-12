import { GameAction, GameSnapshot, ReplayEvent, createSnapshotId } from '@manaflow/types';
import { deepClone } from './utils';

export interface GameEngineHooks {
  onActionApplied?: (event: ReplayEvent, snapshot: GameSnapshot) => void;
}

export type ActionReducer = (snapshot: GameSnapshot, action: GameAction) => GameSnapshot;

export class GameEngine {
  private readonly reducer: ActionReducer;
  private readonly hooks: GameEngineHooks;
  private snapshot: GameSnapshot;

  constructor(initialState: GameSnapshot, reducer?: ActionReducer, hooks: GameEngineHooks = {}) {
    this.snapshot = deepClone(initialState);
    this.reducer = reducer ?? ((state) => state);
    this.hooks = hooks;
  }

  getState(): GameSnapshot {
    return deepClone(this.snapshot);
  }

  reset(state: GameSnapshot): void {
    this.snapshot = deepClone(state);
  }

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
