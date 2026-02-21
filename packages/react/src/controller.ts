import { ReplayEngine } from '@manaflow/core';
import { HtmlRendererAdapter, HtmlRendererAdapterOptions } from '@manaflow/html-visor';
import { createReplayController, ReplayController } from '@manaflow/replay-runtime';
import { RendererAdapter } from '@manaflow/types';

export interface CreateReactReplayControllerOptions {
  renderer?: RendererAdapter;
  htmlRendererOptions?: HtmlRendererAdapterOptions;
}

export type ReactReplayController = ReplayController;

export function createReactReplayController(
  replay: ReplayEngine,
  options: CreateReactReplayControllerOptions = {}
): ReactReplayController {
  const renderer = options.renderer ?? new HtmlRendererAdapter(options.htmlRendererOptions);
  return createReplayController(replay, { renderer });
}
