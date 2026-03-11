import { ReplayEngine, ReplayFrame } from '@manaflow/core';
import { RendererAdapter } from '@manaflow/types';

export interface ReplayController {
  getFrame(): ReplayFrame;
  seek(frame: number): ReplayFrame | null;
  next(): ReplayFrame | null;
  previous(): ReplayFrame | null;
  render(container: HTMLElement): void;
  destroy(): void;
}

export interface CreateReplayControllerOptions {
  renderer?: RendererAdapter;
}

export function createReplayController(
  replay: ReplayEngine,
  options: CreateReplayControllerOptions = {}
): ReplayController {
  const renderer = options.renderer;
  let mountedContainer: HTMLElement | null = null;

  const renderFrame = (frame: ReplayFrame) => {
    if (!renderer) {
      return;
    }
    if (renderer.renderFrame) {
      renderer.renderFrame(frame);
    } else {
      renderer.render(frame.snapshot);
    }
    renderer.highlight(frame.event?.id);
  };

  return {
    getFrame() {
      return replay.getCurrentFrame();
    },
    seek(frame: number) {
      const next = replay.seek({ frame });
      if (next && mountedContainer) {
        renderFrame(next);
      }
      return next;
    },
    next() {
      const frame = replay.stepForward();
      if (frame && mountedContainer) {
        renderFrame(frame);
      }
      return frame;
    },
    previous() {
      const frame = replay.stepBack();
      if (frame && mountedContainer) {
        renderFrame(frame);
      }
      return frame;
    },
    render(container: HTMLElement) {
      if (!renderer) {
        return;
      }

      if (mountedContainer !== container) {
        if (mountedContainer) {
          renderer.destroy();
        }
        renderer.mount(container);
        mountedContainer = container;
      }

      renderFrame(replay.getCurrentFrame());
    },
    destroy() {
      renderer?.destroy();
      mountedContainer = null;
    }
  };
}
