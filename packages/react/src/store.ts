import { ReplayEngine } from '@manaflow/core';
import { HtmlRendererAdapter } from '@manaflow/html-visor';
import { createReplayStore, ReplayStore, ReplayStoreState } from '@manaflow/replay-runtime';
import { CreateReactReplayControllerOptions } from './controller';

export type ReactReplayState = ReplayStoreState;
export type ReactReplayStore = ReplayStore;
export type CreateReactReplayStoreOptions = CreateReactReplayControllerOptions;

export function createReactReplayStore(
  replay: ReplayEngine,
  options: CreateReactReplayStoreOptions = {}
): ReactReplayStore {
  const renderer = options.renderer ?? new HtmlRendererAdapter(options.htmlRendererOptions);
  return createReplayStore(replay, {
    renderer
  });
}
