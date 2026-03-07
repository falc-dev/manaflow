import { useEffect, useState } from 'react';
import { ReplayFrame } from '@manaflow/core';
import { ReactReplayState, ReactReplayStore } from './store';
import { useReplayStore } from './use-replay-store-react';
import { runWithOptionalViewTransition } from './view-transitions';

export interface ReplayLoopRange {
  from: number;
  to: number;
}

export interface UseReplayPlaybackControllerOptions {
  autoplayIntervalMs?: number;
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  playbackRate?: number;
  defaultPlaybackRate?: number;
  onPlaybackRateChange?: (playbackRate: number) => void;
  loop?: boolean;
  loopRange?: ReplayLoopRange;
  onReachEnd?: (state: ReactReplayState) => void;
  viewTransitions?: boolean;
}

export interface UseReplayPlaybackControllerResult {
  state: ReactReplayState;
  playing: boolean;
  playbackRate: number;
  setPlaying: (value: boolean | ((previous: boolean) => boolean)) => void;
  togglePlaying: () => void;
  setPlaybackRate: (value: number | ((previous: number) => number)) => void;
}

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

export function useReplayPlaybackController(
  store: ReactReplayStore,
  {
    autoplayIntervalMs = 700,
    playing: controlledPlaying,
    defaultPlaying = false,
    onPlayingChange,
    playbackRate: controlledPlaybackRate,
    defaultPlaybackRate = 1,
    onPlaybackRateChange,
    loop = false,
    loopRange,
    onReachEnd,
    viewTransitions = true
  }: UseReplayPlaybackControllerOptions = {}
): UseReplayPlaybackControllerResult {
  const state = useReplayStore(store);
  const [uncontrolledPlaying, setUncontrolledPlaying] = useState(defaultPlaying);
  const [uncontrolledPlaybackRate, setUncontrolledPlaybackRate] = useState(defaultPlaybackRate);
  const isPlayingControlled = controlledPlaying !== undefined;
  const isPlaybackRateControlled = controlledPlaybackRate !== undefined;
  const playing = isPlayingControlled ? controlledPlaying : uncontrolledPlaying;
  const effectivePlaybackRate = isPlaybackRateControlled ? controlledPlaybackRate : uncontrolledPlaybackRate;
  const safePlaybackRate = Number.isFinite(effectivePlaybackRate) && effectivePlaybackRate > 0 ? effectivePlaybackRate : 1;
  const playbackIntervalMs = Math.max(16, Math.round(autoplayIntervalMs / safePlaybackRate));
  const loopBounds = resolveLoopBounds(state.totalFrames, loopRange);

  const setPlaying = (value: boolean | ((previous: boolean) => boolean)) => {
    const nextPlaying = typeof value === 'function' ? value(playing) : value;

    if (!isPlayingControlled) {
      setUncontrolledPlaying(nextPlaying);
    }

    if (nextPlaying !== playing) {
      onPlayingChange?.(nextPlaying);
    }
  };

  const setPlaybackRate = (value: number | ((previous: number) => number)) => {
    const nextRate = typeof value === 'function' ? value(safePlaybackRate) : value;
    const normalizedRate = Number.isFinite(nextRate) && nextRate > 0 ? nextRate : 1;

    if (!isPlaybackRateControlled) {
      setUncontrolledPlaybackRate(normalizedRate);
    }

    if (Math.abs(normalizedRate - safePlaybackRate) > 0.001) {
      onPlaybackRateChange?.(normalizedRate);
    }
  };

  const togglePlaying = () => {
    setPlaying((value) => !value);
  };

  useEffect(() => {
    if (!playing) {
      return;
    }

    const latestState = store.getState();

    if (loop) {
      if (
        latestState.currentFrame < loopBounds.from ||
        latestState.currentFrame > loopBounds.to ||
        latestState.currentFrame === loopBounds.to
      ) {
        if (viewTransitions) {
          runWithOptionalViewTransition(() => {
            store.seek(loopBounds.from);
          });
        } else {
          store.seek(loopBounds.from);
        }
      }
    } else if (!latestState.canStepForward && latestState.totalFrames > 1) {
      if (viewTransitions) {
        runWithOptionalViewTransition(() => {
          store.seek(0);
        });
      } else {
        store.seek(0);
      }
    }

    const timer = window.setInterval(() => {
      const nextState = store.getState();

      if (loop) {
        if (nextState.currentFrame >= loopBounds.to) {
          if (viewTransitions) {
            runWithOptionalViewTransition(() => {
              store.seek(loopBounds.from);
            });
          } else {
            store.seek(loopBounds.from);
          }
          return;
        }

        const next = viewTransitions
          ? (() => {
              let frame: ReplayFrame | null = null;
              runWithOptionalViewTransition(() => {
                frame = store.next();
              });
              return frame;
            })()
          : store.next();
        if (!next) {
          if (viewTransitions) {
            runWithOptionalViewTransition(() => {
              store.seek(loopBounds.from);
            });
          } else {
            store.seek(loopBounds.from);
          }
        }
        return;
      }

      const next = viewTransitions
        ? (() => {
            let frame: ReplayFrame | null = null;
            runWithOptionalViewTransition(() => {
              frame = store.next();
            });
            return frame;
          })()
        : store.next();
      if (!next) {
        onReachEnd?.(store.getState());
        setPlaying(false);
      }
    }, playbackIntervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [playing, playbackIntervalMs, store, loop, loopBounds.from, loopBounds.to, onReachEnd, viewTransitions]);

  return {
    state,
    playing,
    playbackRate: safePlaybackRate,
    setPlaying,
    togglePlaying,
    setPlaybackRate
  };
}
