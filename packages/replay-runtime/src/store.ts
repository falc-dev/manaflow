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
  isAtStart: boolean;
  isAtEnd: boolean;
  isPlaying: boolean;
  playbackRate: number;
}

export interface ReplayStore extends ReplayController {
  setPlaybackState(playing: boolean, rate?: number): void;
  getState(): ReplayStoreState;
  subscribe(listener: (state: ReplayStoreState) => void): () => void;
}

function createState(
  frame: ReplayFrame,
  totalFrames: number,
  isPlaying: boolean,
  playbackRate: number
): ReplayStoreState {
  const currentFrame = frame.index;
  const canStepBack = currentFrame > 0;
  const canStepForward = currentFrame < totalFrames - 1;
  return {
    frame,
    currentFrame,
    totalFrames,
    canStepBack,
    canStepForward,
    isAtStart: currentFrame === 0,
    isAtEnd: currentFrame === totalFrames - 1,
    isPlaying,
    playbackRate
  };
}

export function createReplayStore(
  replay: ReplayEngine,
  options: CreateReplayControllerOptions = {}
): ReplayStore {
  const controller = createReplayController(replay, options);
  const listeners = new Set<(state: ReplayStoreState) => void>();
  let isPlaying = false;
  let playbackRate = 1;

  const notify = () => {
    const state = createState(controller.getFrame(), replay.getTotalFrames(), isPlaying, playbackRate);
    for (const listener of listeners) {
      listener(state);
    }
  };

  return {
    ...controller,
    setPlaybackState(playing: boolean, rate?: number) {
      isPlaying = playing;
      if (rate !== undefined) {
        playbackRate = rate;
      }
      notify();
    },
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
      return createState(controller.getFrame(), replay.getTotalFrames(), isPlaying, playbackRate);
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
