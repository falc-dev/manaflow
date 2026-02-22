import { ReactNode, useEffect, useState } from 'react';
import { GameSnapshot } from '@manaflow/types';
import { ReactReplayStore } from '../store';
import { ReplayTimelineMarker } from '../replay-markers';
import { useReplayStore } from '../use-replay-store-react';
import { ReplayControls } from './replay-controls';
import { ReplayTimeline, ReplayTimelineRenderContext } from './replay-timeline';
import {
  ReplayViewport,
  ReplayViewportCardRenderContext,
  ReplayViewportZoneConfig,
  ReplayViewportZoneTitleRenderContext
} from './replay-viewport';

export interface ReplayPlayerProps {
  store: ReactReplayStore;
  autoplayIntervalMs?: number;
  playbackRate?: number;
  loop?: boolean;
  loopRange?: { from: number; to: number };
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  className?: string;
  controlsClassName?: string;
  timelineClassName?: string;
  viewportClassName?: string;
  viewportCardClassName?: string;
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
  playbackRate = 1,
  loop = false,
  loopRange,
  playing: controlledPlaying,
  defaultPlaying = false,
  onPlayingChange,
  className,
  controlsClassName,
  timelineClassName,
  viewportClassName,
  viewportCardClassName,
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
  const isControlled = controlledPlaying !== undefined;
  const playing = isControlled ? controlledPlaying : uncontrolledPlaying;
  const safePlaybackRate = Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1;
  const playbackIntervalMs = Math.max(16, Math.round(autoplayIntervalMs / safePlaybackRate));
  const loopBounds = resolveLoopBounds(state.totalFrames, loopRange);

  const setPlaying = (value: boolean | ((previous: boolean) => boolean)) => {
    const nextPlaying = typeof value === 'function' ? value(playing) : value;

    if (!isControlled) {
      setUncontrolledPlaying(nextPlaying);
    }

    if (nextPlaying !== playing) {
      onPlayingChange?.(nextPlaying);
    }
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
    loopBounds.to
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
        onPrevious={() => store.previous()}
        onNext={() => store.next()}
        onTogglePlay={() => setPlaying((value) => !value)}
        onSeek={(frame) => store.seek(frame)}
      />
      {timelinePosition === 'beforeViewport' ? timelineNode : null}
      <ReplayViewport
        className={viewportClassName}
        cardClassName={viewportCardClassName}
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
