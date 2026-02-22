import { ReplayEngine } from '@manaflow/core';
import { createReplayStore, ReplayStore, ReplayStoreState } from '@manaflow/replay-runtime';
import { CreateVueReplayControllerOptions } from './controller';

export type VueReplayState = ReplayStoreState;
export type VueReplayStore = ReplayStore;
export type CreateVueReplayStoreOptions = CreateVueReplayControllerOptions;

export function createVueReplayStore(
  replay: ReplayEngine,
  options: CreateVueReplayStoreOptions = {}
): VueReplayStore {
  return createReplayStore(replay, { renderer: options.renderer });
}
