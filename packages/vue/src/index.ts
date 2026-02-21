import { ReplayEngine, ReplayFrame } from '@manaflow/core';
import { HtmlRendererAdapter, HtmlRendererAdapterOptions } from '@manaflow/html-visor';
import { createReplayController } from '@manaflow/replay-runtime';
import { RendererAdapter } from '@manaflow/types';

export interface VueReplayController {
  frame(): ReplayFrame;
  next(): ReplayFrame | null;
  previous(): ReplayFrame | null;
  mount(container: HTMLElement): void;
  destroy(): void;
}

export interface CreateVueReplayControllerOptions {
  renderer?: RendererAdapter;
  htmlRendererOptions?: HtmlRendererAdapterOptions;
}

export function createVueReplayController(
  replay: ReplayEngine,
  options: CreateVueReplayControllerOptions = {}
): VueReplayController {
  const renderer = options.renderer ?? new HtmlRendererAdapter(options.htmlRendererOptions);
  const controller = createReplayController(replay, { renderer });

  return {
    frame() {
      return controller.getFrame();
    },
    next() {
      return controller.next();
    },
    previous() {
      return controller.previous();
    },
    mount(container: HTMLElement) {
      controller.render(container);
    },
    destroy() {
      controller.destroy();
    }
  };
}
