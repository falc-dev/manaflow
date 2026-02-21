import { Card, GameSnapshot, ZoneId } from '@manaflow/types';
import { ReactNode } from 'react';
import { ReactReplayState } from '../store';

export interface ReplayViewportProps {
  state: ReactReplayState;
  zones?: ReplayViewportZoneConfig[];
  timelineFormatter?: (snapshot: GameSnapshot) => string;
  renderCard?: (context: ReplayViewportCardRenderContext) => ReactNode;
  renderZoneTitle?: (context: ReplayViewportZoneTitleRenderContext) => ReactNode;
  className?: string;
  cardClassName?: string;
}

export interface ReplayViewportZoneConfig {
  id: ZoneId;
  title: string;
}

export interface ReplayViewportCardRenderContext {
  entityId: string;
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
  timelineFormatter = defaultTimelineFormatter,
  renderCard,
  renderZoneTitle,
  className,
  cardClassName
}: ReplayViewportProps) {
  const snapshot = state.frame.snapshot;
  const eventId = state.frame.event?.id;

  return (
    <div className={joinClassNames('replay-player__viewport', className)}>
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
          <div key={zone.id} className="replay-player__zone" role="group" aria-label={zone.title}>
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
                return (
                  <div key={entityId} className={joinClassNames('replay-player__card', cardClassName)} role="article">
                    {renderCard ? (
                      renderCard({
                        entityId,
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
