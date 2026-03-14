import { useCallback, useState } from 'react';
import { ReactReplayState, ReactReplayStore } from './store';
import { useReplayStore } from './use-replay-store-react';
import { runWithOptionalViewTransition } from './view-transitions';
import type { ReplayLoopRange, UseReplayPlaybackControllerOptions, UseReplayPlaybackControllerResult } from './use-replay-playback-controller';

function clampFrame(frame: number, totalFrames: number): number {
  return Math.min(Math.max(frame, 0), Math.max(totalFrames - 1, 0));
}

function resolveLoopBounds(totalFrames: number, loopRange: ReplayLoopRange | undefined): ReplayLoopRange {
  if (!loopRange) {
    return { from: 0, to: Math.max(totalFrames - 1, 0) };
  }

  const from = clampFrame(loopRange.from, totalFrames);
  const to = clampFrame(loopRange.to, totalFrames);

  if (from <= to) {
    return { from, to };
  }

  return { from: to, to: from };
}

export interface UseReplayConfigOptions {
  autoplayIntervalMs?: number;
  defaultPlaying?: boolean;
  defaultPlaybackRate?: number;
  loop?: boolean;
  loopRange?: ReplayLoopRange;
  viewTransitions?: boolean;
}

export interface UseReplayConfigResult {
  state: ReactReplayState;
  playing: boolean;
  playbackRate: number;
  isPlayingControlled: boolean;
  isPlaybackRateControlled: boolean;
  togglePlaying: () => void;
  setPlaying: (value: boolean) => void;
  setPlaybackRate: (value: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  seek: (frame: number) => void;
}

export function createReplayConfig() {
  return function useReplayConfig(
    store: ReactReplayStore,
    options: UseReplayConfigOptions = {}
  ): UseReplayConfigResult {
    const state = useReplayStore(store);
    const [uncontrolledPlaying, setUncontrolledPlaying] = useState(options.defaultPlaying ?? false);
    const [uncontrolledPlaybackRate, setUncontrolledPlaybackRate] = useState(options.defaultPlaybackRate ?? 1);

    const isPlayingControlled = false;
    const isPlaybackRateControlled = false;
    const playing = uncontrolledPlaying;
    const effectivePlaybackRate = uncontrolledPlaybackRate;
    const safePlaybackRate = Number.isFinite(effectivePlaybackRate) && effectivePlaybackRate > 0 ? effectivePlaybackRate : 1;
    const playbackIntervalMs = Math.max(16, Math.round((options.autoplayIntervalMs ?? 700) / safePlaybackRate));
    const loopBounds = resolveLoopBounds(state.totalFrames, options.loopRange);

    const togglePlaying = useCallback(() => {
      setUncontrolledPlaying((prev) => !prev);
    }, []);

    const setPlaying = useCallback((value: boolean) => {
      setUncontrolledPlaying(value);
    }, []);

    const setPlaybackRate = useCallback((value: number) => {
      const normalized = Number.isFinite(value) && value > 0 ? value : 1;
      setUncontrolledPlaybackRate(normalized);
    }, []);

    const stepForward = useCallback(() => {
      if (options.viewTransitions ?? true) {
        runWithOptionalViewTransition(() => {
          store.next();
        });
      } else {
        store.next();
      }
    }, [store, options.viewTransitions]);

    const stepBackward = useCallback(() => {
      if (options.viewTransitions ?? true) {
        runWithOptionalViewTransition(() => {
          store.previous();
        });
      } else {
        store.previous();
      }
    }, [store, options.viewTransitions]);

    const seek = useCallback((frame: number) => {
      if (options.viewTransitions ?? true) {
        runWithOptionalViewTransition(() => {
          store.seek(frame);
        });
      } else {
        store.seek(frame);
      }
    }, [store, options.viewTransitions]);

    return {
      state,
      playing,
      playbackRate: safePlaybackRate,
      isPlayingControlled,
      isPlaybackRateControlled,
      togglePlaying,
      setPlaying,
      setPlaybackRate,
      stepForward,
      stepBackward,
      seek
    };
  };
}

export const useReplayConfig = createReplayConfig();
