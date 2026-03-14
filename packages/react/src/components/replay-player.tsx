import { ReactNode, useEffect, useRef } from 'react';
import { GameSnapshot } from '@manaflow/types';
import { ReactReplayState, ReactReplayStore } from '../store';
import { ReplayTimelineMarker } from '../replay-markers';
import { useReplayPlaybackController } from '../use-replay-playback-controller';
import { runWithOptionalViewTransition } from '../view-transitions';
import { joinClassNames } from '../utils';
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
  viewTransitions?: boolean;
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
  renderZoneTitle,
  viewTransitions = true
}: ReplayPlayerProps) {
  const { state, playing, playbackRate: safePlaybackRate, togglePlaying, setPlaybackRate } =
    useReplayPlaybackController(store, {
      autoplayIntervalMs,
      playing: controlledPlaying,
      defaultPlaying,
      onPlayingChange,
      playbackRate: controlledPlaybackRate,
      defaultPlaybackRate,
      onPlaybackRateChange,
      loop,
      loopRange,
      onReachEnd,
      viewTransitions
    });
  const previousFrameRef = useRef(state.currentFrame);

  useEffect(() => {
    if (previousFrameRef.current !== state.currentFrame) {
      previousFrameRef.current = state.currentFrame;
      onFrameChange?.(state);
    }
  }, [onFrameChange, state]);

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
        onPrevious={() => {
          if (viewTransitions) {
            runWithOptionalViewTransition(() => {
              store.previous();
            });
            return;
          }
          store.previous();
        }}
        onNext={() => {
          if (viewTransitions) {
            runWithOptionalViewTransition(() => {
              store.next();
            });
            return;
          }
          store.next();
        }}
        onTogglePlay={togglePlaying}
        onSeek={(frame) => {
          if (viewTransitions) {
            runWithOptionalViewTransition(() => {
              store.seek(frame);
            });
            return;
          }
          store.seek(frame);
        }}
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
        viewTransitions={viewTransitions}
      />
      {timelinePosition === 'afterViewport' ? timelineNode : null}
    </div>
  );
}
