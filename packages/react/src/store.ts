import { ReplayEngine } from '@manaflow/core';
import { createReplayStore, ReplayStore, ReplayStoreState } from '@manaflow/replay-runtime';
import { CreateReactReplayControllerOptions } from './controller';

export type ReactReplayState = ReplayStoreState;
export type ReactReplayStore = ReplayStore;
export type CreateReactReplayStoreOptions = CreateReactReplayControllerOptions;

export function createReactReplayStore(
  replay: ReplayEngine,
  options: CreateReactReplayStoreOptions = {}
): ReactReplayStore {
  return createReplayStore(replay, {
    renderer: options.renderer
  });
}
