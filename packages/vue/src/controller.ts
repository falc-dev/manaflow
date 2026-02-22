import { ReplayEngine } from '@manaflow/core';
import { createReplayController, ReplayController } from '@manaflow/replay-runtime';
import { RendererAdapter } from '@manaflow/types';

export interface CreateVueReplayControllerOptions {
  renderer?: RendererAdapter;
}

export type VueReplayController = ReplayController;

export function createVueReplayController(
  replay: ReplayEngine,
  options: CreateVueReplayControllerOptions = {}
): VueReplayController {
  return createReplayController(replay, { renderer: options.renderer });
}
