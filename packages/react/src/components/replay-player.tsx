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

export function ReplayPlayer({
  store,
  autoplayIntervalMs = 700,
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

    if (!state.canStepForward && state.totalFrames > 1) {
      store.seek(0);
    }

    const timer = window.setInterval(() => {
      const next = store.next();
      if (!next) {
        setPlaying(false);
      }
    }, autoplayIntervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [playing, autoplayIntervalMs, state.canStepForward, state.totalFrames, store]);

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
