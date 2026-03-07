import { Card, GameSnapshot, ZoneId } from '@manaflow/types';
import { CSSProperties, ReactNode } from 'react';
import { ReactReplayState } from '../store';
import { getReplayCardViewTransitionName } from '../view-transitions';

export interface ReplayViewportProps {
  state: ReactReplayState;
  zones?: ReplayViewportZoneConfig[];
  layout?: ReplayViewportLayout;
  timelineFormatter?: (snapshot: GameSnapshot) => string;
  renderCard?: (context: ReplayViewportCardRenderContext) => ReactNode;
  renderZoneTitle?: (context: ReplayViewportZoneTitleRenderContext) => ReactNode;
  className?: string;
  cardClassName?: string;
  viewTransitions?: boolean;
}

export type ReplayViewportLayout = 'stacked' | 'board';

export interface ReplayViewportZoneConfig {
  id: ZoneId;
  title: string;
}

export interface ReplayViewportCardRenderContext {
  entityId: string;
  zoneId: ZoneId;
  snapshot: GameSnapshot;
  card: Card | undefined;
}

export interface ReplayViewportZoneTitleRenderContext {
  zone: ReplayViewportZoneConfig;
  snapshot: GameSnapshot;
  entityIds: string[];
}

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

const DEFAULT_ZONES: ReplayViewportZoneConfig[] = [
  { id: 'hand', title: 'Hand' },
  { id: 'board', title: 'Board' },
  { id: 'graveyard', title: 'Graveyard' },
  { id: 'deck', title: 'Deck' },
  { id: 'stack', title: 'Stack' }
];

function getCardMetadata(entityId: string, snapshot: GameSnapshot): Card | undefined {
  const entity = snapshot.entities[entityId];
  return entity?.components.find((component) => component.componentType === 'CARD')?.metadata as Card | undefined;
}

function defaultTimelineFormatter(snapshot: GameSnapshot): string {
  return `Turn ${snapshot.turn} · Phase ${snapshot.currentPhase} · Player ${snapshot.currentPlayer}`;
}

export function ReplayViewport({
  state,
  zones = DEFAULT_ZONES,
  layout = 'stacked',
  timelineFormatter = defaultTimelineFormatter,
  renderCard,
  renderZoneTitle,
  className,
  cardClassName,
  viewTransitions = true
}: ReplayViewportProps) {
  const snapshot = state.frame.snapshot;
  const eventId = state.frame.event?.id;

  return (
    <div className={joinClassNames('replay-player__viewport', `replay-player__viewport--layout-${layout}`, className)}>
      <div
        className={joinClassNames('replay-player__timeline', eventId ? 'replay-player__timeline--highlighted' : undefined)}
        data-manaflow-timeline="true"
        role="status"
        aria-live="polite"
      >
        {timelineFormatter(snapshot)}
      </div>

      {zones.map((zone) => {
        const entityIds = snapshot.zones[zone.id] ?? [];
        return (
          <div
            key={zone.id}
            className={joinClassNames('replay-player__zone', `replay-player__zone--${zone.id}`)}
            role="group"
            aria-label={zone.title}
          >
            <div className="replay-player__zone-title">
              {renderZoneTitle
                ? renderZoneTitle({
                    zone,
                    snapshot,
                    entityIds
                  })
                : zone.title}
            </div>
            <div className="replay-player__zone-rail" data-zone-id={zone.id}>
              {entityIds.map((entityId) => {
                const card = getCardMetadata(entityId, snapshot);
                const cardStyle = viewTransitions
                  ? ({ viewTransitionName: getReplayCardViewTransitionName(entityId) } as CSSProperties)
                  : undefined;
                return (
                  <div
                    key={entityId}
                    className={joinClassNames('replay-player__card', cardClassName)}
                    role="article"
                    style={cardStyle}
                  >
                    {renderCard ? (
                      renderCard({
                        entityId,
                        zoneId: zone.id,
                        snapshot,
                        card
                      })
                    ) : (
                      <>
                        <div className="replay-player__card-name">{card?.name ?? entityId}</div>
                        <div className="replay-player__card-cost">Cost {card?.cost ?? '-'}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
