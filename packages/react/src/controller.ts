import { ReplayEngine } from '@manaflow/core';
import { createReplayController, ReplayController } from '@manaflow/replay-runtime';
import { RendererAdapter } from '@manaflow/types';

export interface CreateReactReplayControllerOptions {
  renderer?: RendererAdapter;
}

export type ReactReplayController = ReplayController;

export function createReactReplayController(
  replay: ReplayEngine,
  options: CreateReactReplayControllerOptions = {}
): ReactReplayController {
  return createReplayController(replay, { renderer: options.renderer });
}
