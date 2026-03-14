import { ReactNode, memo, useMemo } from 'react';
import { ReactReplayState } from '../store';
import { ReplayTimelineMarker } from '../replay-markers';
import { joinClassNames } from '../utils';

export interface ReplayTimelineProps {
  state: ReactReplayState;
  onSeek(frame: number): void;
  markers?: ReplayTimelineMarker[];
  className?: string;
  ariaLabel?: string;
  framePrefix?: string;
  renderMarker?: (context: ReplayTimelineRenderContext) => ReactNode;
}

export interface ReplayTimelineRenderContext {
  marker: ReplayTimelineMarker;
  isActive: boolean;
  state: ReactReplayState;
}

interface TimelineItemProps {
  marker: ReplayTimelineMarker;
  isActive: boolean;
  framePrefix: string;
  onSeek: (frame: number) => void;
  renderMarker?: (context: ReplayTimelineRenderContext) => ReactNode;
  state: ReactReplayState;
}

const TimelineItem = memo<TimelineItemProps>(function TimelineItem({
  marker,
  isActive,
  framePrefix,
  onSeek,
  renderMarker,
  state
}) {
  const handleClick = () => {
    onSeek(marker.frame);
  };

  const context = useMemo(
    () => ({ marker, isActive, state }),
    [marker, isActive, state]
  );

  return (
    <button
      type="button"
      className={joinClassNames('replay-timeline__item', isActive ? 'replay-timeline__item--active' : undefined)}
      onClick={handleClick}
      aria-current={isActive ? 'step' : undefined}
      role="listitem"
    >
      {renderMarker ? (
        renderMarker(context)
      ) : (
        <>
          <span className="replay-timeline__frame">
            {framePrefix}
            {marker.frame + 1}
          </span>
          <span className="replay-timeline__label">{marker.label}</span>
        </>
      )}
    </button>
  );
});

function getDefaultMarkers(totalFrames: number): ReplayTimelineMarker[] {
  return Array.from({ length: totalFrames }, (_, frame) => ({
    frame,
    label: frame === 0 ? 'Setup' : `Frame ${frame + 1}`,
    actionType: frame === 0 ? 'SETUP' : 'EVENT'
  }));
}

function getResolvedMarkers(
  markers: ReplayTimelineMarker[] | undefined,
  totalFrames: number
): ReplayTimelineMarker[] {
  const source = markers ? [...markers] : getDefaultMarkers(totalFrames);
  const normalized = source
    .filter(
      (marker) =>
        Number.isInteger(marker.frame) &&
        marker.frame >= 0 &&
        marker.frame < totalFrames &&
        typeof marker.label === 'string' &&
        marker.label.length > 0
    )
    .sort((a, b) => a.frame - b.frame);

  return normalized.length > 0 ? normalized : getDefaultMarkers(totalFrames);
}

export function ReplayTimeline({
  state,
  onSeek,
  markers,
  className,
  ariaLabel = 'Replay timeline',
  framePrefix = 'F',
  renderMarker
}: ReplayTimelineProps) {
  const resolvedMarkers = useMemo(
    () => getResolvedMarkers(markers, state.totalFrames),
    [markers, state.totalFrames]
  );

  return (
    <div className={joinClassNames('replay-timeline', className)} role="list" aria-label={ariaLabel}>
      {resolvedMarkers.map((marker) => (
        <TimelineItem
          key={`${marker.frame}-${marker.actionType}`}
          marker={marker}
          isActive={marker.frame === state.currentFrame}
          framePrefix={framePrefix}
          onSeek={onSeek}
          renderMarker={renderMarker}
          state={state}
        />
      ))}
    </div>
  );
}
