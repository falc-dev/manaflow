import { ReplayEngine, ReplayFrame } from '@manaflow/core';
import { HtmlRendererAdapter } from '@manaflow/html-visor';

export interface VueReplayController {
  frame(): ReplayFrame;
  next(): ReplayFrame | null;
  previous(): ReplayFrame | null;
  mount(container: HTMLElement): void;
  destroy(): void;
}

export function createVueReplayController(replay: ReplayEngine): VueReplayController {
  const adapter = new HtmlRendererAdapter();
  let mounted = false;

  return {
    frame() {
      return replay.getCurrentFrame();
    },
    next() {
      const frame = replay.stepForward();
      if (frame && mounted) {
        adapter.render(frame.snapshot);
      }
      return frame;
    },
    previous() {
      const frame = replay.stepBack();
      if (frame && mounted) {
        adapter.render(frame.snapshot);
      }
      return frame;
    },
    mount(container: HTMLElement) {
      if (!mounted) {
        adapter.mount(container);
        mounted = true;
      }
      adapter.render(replay.getCurrentState());
    },
    destroy() {
      adapter.destroy();
      mounted = false;
    }
  };
}
