import { ReplayEngine, ReplayFrame } from '@manaflow/core';
import { createReactReplayController, ReactReplayController } from './controller';

export interface ReactReplayState {
  frame: ReplayFrame;
  currentFrame: number;
  totalFrames: number;
  canStepBack: boolean;
  canStepForward: boolean;
}

export interface ReactReplayStore extends ReactReplayController {
  getState(): ReactReplayState;
  subscribe(listener: (state: ReactReplayState) => void): () => void;
}

function createState(frame: ReplayFrame, totalFrames: number): ReactReplayState {
  return {
    frame,
    currentFrame: frame.index,
    totalFrames,
    canStepBack: frame.index > 0,
    canStepForward: frame.index < totalFrames - 1
  };
}

export function createReactReplayStore(replay: ReplayEngine): ReactReplayStore {
  const controller = createReactReplayController(replay);
  const listeners = new Set<(state: ReactReplayState) => void>();

  const notify = () => {
    const state = createState(controller.getFrame(), replay.getTotalFrames());
    for (const listener of listeners) {
      listener(state);
    }
  };

  return {
    ...controller,
    seek(frame: number) {
      const next = controller.seek(frame);
      if (next) {
        notify();
      }
      return next;
    },
    next() {
      const next = controller.next();
      if (next) {
        notify();
      }
      return next;
    },
    previous() {
      const previous = controller.previous();
      if (previous) {
        notify();
      }
      return previous;
    },
    getState() {
      return createState(controller.getFrame(), replay.getTotalFrames());
    },
    subscribe(listener: (state: ReactReplayState) => void) {
      listeners.add(listener);
      listener(this.getState());
      return () => {
        listeners.delete(listener);
      };
    },
    destroy() {
      controller.destroy();
      listeners.clear();
    }
  };
}
