import { ReplayEngine, ReplayFrame } from '@manaflow/core';
import {
  createReplayController,
  CreateReplayControllerOptions,
  ReplayController
} from './controller';

export interface ReplayStoreState {
  frame: ReplayFrame;
  currentFrame: number;
  totalFrames: number;
  canStepBack: boolean;
  canStepForward: boolean;
}

export interface ReplayStore extends ReplayController {
  getState(): ReplayStoreState;
  subscribe(listener: (state: ReplayStoreState) => void): () => void;
}

function createState(frame: ReplayFrame, totalFrames: number): ReplayStoreState {
  return {
    frame,
    currentFrame: frame.index,
    totalFrames,
    canStepBack: frame.index > 0,
    canStepForward: frame.index < totalFrames - 1
  };
}

export function createReplayStore(
  replay: ReplayEngine,
  options: CreateReplayControllerOptions = {}
): ReplayStore {
  const controller = createReplayController(replay, options);
  const listeners = new Set<(state: ReplayStoreState) => void>();

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
    subscribe(listener: (state: ReplayStoreState) => void) {
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
