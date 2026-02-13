import { ReplayEngine, ReplayFrame } from '@manaflow/core';
import { HtmlRendererAdapter } from '@manaflow/html-visor';

export interface ReactReplayController {
  getFrame(): ReplayFrame;
  seek(frame: number): ReplayFrame | null;
  next(): ReplayFrame | null;
  previous(): ReplayFrame | null;
  render(container: HTMLElement): void;
  destroy(): void;
}

export function createReactReplayController(replay: ReplayEngine): ReactReplayController {
  const adapter = new HtmlRendererAdapter();
  let mounted = false;

  return {
    getFrame() {
      return replay.getCurrentFrame();
    },
    seek(frame: number) {
      const next = replay.seek({ frame });
      if (next && mounted) {
        adapter.render(next.snapshot);
        adapter.highlight(next.event?.id);
      }
      return next;
    },
    next() {
      const frame = replay.stepForward();
      if (frame && mounted) {
        adapter.render(frame.snapshot);
        adapter.highlight(frame.event?.id);
      }
      return frame;
    },
    previous() {
      const frame = replay.stepBack();
      if (frame && mounted) {
        adapter.render(frame.snapshot);
        adapter.highlight(frame.event?.id);
      }
      return frame;
    },
    render(container: HTMLElement) {
      if (!mounted) {
        adapter.mount(container);
        mounted = true;
      }
      const frame = replay.getCurrentFrame();
      adapter.render(frame.snapshot);
      adapter.highlight(frame.event?.id);
    },
    destroy() {
      adapter.destroy();
      mounted = false;
    }
  };
}
