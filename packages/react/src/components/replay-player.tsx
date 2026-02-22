import { ReactNode, useEffect, useRef, useState } from 'react';
import { GameSnapshot } from '@manaflow/types';
import { ReactReplayState, ReactReplayStore } from '../store';
import { ReplayTimelineMarker } from '../replay-markers';
import { useReplayStore } from '../use-replay-store-react';
import { ReplayControls } from './replay-controls';
import { ReplayTimeline, ReplayTimelineRenderContext } from './replay-timeline';
import {
  ReplayViewportLayout,
  ReplayViewport,
  ReplayViewportCardRenderContext,
  ReplayViewportZoneConfig,
  ReplayViewportZoneTitleRenderContext
} from './replay-viewport';

export interface ReplayPlayerProps {
  store: ReactReplayStore;
  autoplayIntervalMs?: number;
  playbackRate?: number;
  defaultPlaybackRate?: number;
  playbackRateOptions?: number[];
  loop?: boolean;
  loopRange?: { from: number; to: number };
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  onPlaybackRateChange?: (playbackRate: number) => void;
  onFrameChange?: (state: ReactReplayState) => void;
  onReachEnd?: (state: ReactReplayState) => void;
  className?: string;
  controlsClassName?: string;
  timelineClassName?: string;
  viewportClassName?: string;
  viewportCardClassName?: string;
  viewportLayout?: ReplayViewportLayout;
  showTimeline?: boolean;
  timelinePosition?: 'beforeViewport' | 'afterViewport';
  timelineAriaLabel?: string;
  timelineFramePrefix?: string;
  timelineMarkers?: ReplayTimelineMarker[];
  renderTimelineMarker?: (context: ReplayTimelineRenderContext) => ReactNode;
  onTimelineSeek?: (frame: number) => void;
  zones?: ReplayViewportZoneConfig[];
  timelineFormatter?: (snapshot: GameSnapshot) => string;
  renderCard?: (context: ReplayViewportCardRenderContext) => ReactNode;
  renderZoneTitle?: (context: ReplayViewportZoneTitleRenderContext) => ReactNode;
}

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function clampFrame(frame: number, totalFrames: number): number {
  return Math.min(Math.max(frame, 0), Math.max(totalFrames - 1, 0));
}

function resolveLoopBounds(
  totalFrames: number,
  loopRange: { from: number; to: number } | undefined
): { from: number; to: number } {
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

export function ReplayPlayer({
  store,
  autoplayIntervalMs = 700,
  playbackRate: controlledPlaybackRate,
  defaultPlaybackRate = 1,
  playbackRateOptions = [0.5, 1, 2],
  loop = false,
  loopRange,
  playing: controlledPlaying,
  defaultPlaying = false,
  onPlayingChange,
  onPlaybackRateChange,
  onFrameChange,
  onReachEnd,
  className,
  controlsClassName,
  timelineClassName,
  viewportClassName,
  viewportCardClassName,
  viewportLayout,
  showTimeline = false,
  timelinePosition = 'beforeViewport',
  timelineAriaLabel,
  timelineFramePrefix,
  timelineMarkers,
  renderTimelineMarker,
  onTimelineSeek,
  zones,
  timelineFormatter,
  renderCard,
  renderZoneTitle
}: ReplayPlayerProps) {
  const state = useReplayStore(store);
  const [uncontrolledPlaying, setUncontrolledPlaying] = useState(defaultPlaying);
  const [uncontrolledPlaybackRate, setUncontrolledPlaybackRate] = useState(defaultPlaybackRate);
  const isControlled = controlledPlaying !== undefined;
  const isPlaybackRateControlled = controlledPlaybackRate !== undefined;
  const playing = isControlled ? controlledPlaying : uncontrolledPlaying;
  const effectivePlaybackRate = isPlaybackRateControlled ? controlledPlaybackRate : uncontrolledPlaybackRate;
  const safePlaybackRate = Number.isFinite(effectivePlaybackRate) && effectivePlaybackRate > 0 ? effectivePlaybackRate : 1;
  const playbackIntervalMs = Math.max(16, Math.round(autoplayIntervalMs / safePlaybackRate));
  const loopBounds = resolveLoopBounds(state.totalFrames, loopRange);
  const previousFrameRef = useRef(state.currentFrame);

  const setPlaying = (value: boolean | ((previous: boolean) => boolean)) => {
    const nextPlaying = typeof value === 'function' ? value(playing) : value;

    if (!isControlled) {
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

  useEffect(() => {
    if (previousFrameRef.current !== state.currentFrame) {
      previousFrameRef.current = state.currentFrame;
      onFrameChange?.(state);
    }
  }, [onFrameChange, state]);

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
        store.seek(loopBounds.from);
      }
    } else if (!latestState.canStepForward && latestState.totalFrames > 1) {
      store.seek(0);
    }

    const timer = window.setInterval(() => {
      const nextState = store.getState();

      if (loop) {
        if (nextState.currentFrame >= loopBounds.to) {
          store.seek(loopBounds.from);
          return;
        }

        const next = store.next();
        if (!next) {
          store.seek(loopBounds.from);
        }
        return;
      }

      const next = store.next();
      if (!next) {
        onReachEnd?.(store.getState());
        setPlaying(false);
      }
    }, playbackIntervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    playing,
    playbackIntervalMs,
    state.totalFrames,
    store,
    loop,
    loopBounds.from,
    loopBounds.to,
    onReachEnd
  ]);

  const timelineNode = showTimeline ? (
    <ReplayTimeline
      className={timelineClassName}
      state={state}
      markers={timelineMarkers}
      ariaLabel={timelineAriaLabel}
      framePrefix={timelineFramePrefix}
      renderMarker={renderTimelineMarker}
      onSeek={(frame) => {
        store.seek(frame);
        onTimelineSeek?.(frame);
      }}
    />
  ) : null;

  return (
    <div className={joinClassNames('replay-player', className)}>
      <ReplayControls
        className={controlsClassName}
        state={state}
        isPlaying={playing}
        playbackRate={safePlaybackRate}
        playbackRateOptions={playbackRateOptions}
        onPrevious={() => store.previous()}
        onNext={() => store.next()}
        onTogglePlay={() => setPlaying((value) => !value)}
        onSeek={(frame) => store.seek(frame)}
        onPlaybackRateChange={(rate) => setPlaybackRate(rate)}
      />
      {timelinePosition === 'beforeViewport' ? timelineNode : null}
      <ReplayViewport
        className={viewportClassName}
        cardClassName={viewportCardClassName}
        layout={viewportLayout}
        state={state}
        zones={zones}
        timelineFormatter={timelineFormatter}
        renderCard={renderCard}
        renderZoneTitle={renderZoneTitle}
      />
      {timelinePosition === 'afterViewport' ? timelineNode : null}
    </div>
  );
}
