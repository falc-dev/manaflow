import { ReactNode } from 'react';
import { ReactReplayState } from '../store';
import { ReplayTimelineMarker } from '../replay-markers';

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

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

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
  const resolvedMarkers = getResolvedMarkers(markers, state.totalFrames);

  return (
    <div className={joinClassNames('replay-timeline', className)} role="list" aria-label={ariaLabel}>
      {resolvedMarkers.map((marker) => {
        const isActive = marker.frame === state.currentFrame;
        return (
          <button
            key={`${marker.frame}-${marker.actionType}`}
            type="button"
            className={joinClassNames('replay-timeline__item', isActive ? 'replay-timeline__item--active' : undefined)}
            onClick={() => onSeek(marker.frame)}
            aria-current={isActive ? 'step' : undefined}
            role="listitem"
          >
            {renderMarker ? (
              renderMarker({
                marker,
                isActive,
                state
              })
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
      })}
    </div>
  );
}
