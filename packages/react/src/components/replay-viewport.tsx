import { Card, EntityState, GameSnapshot, ZoneId } from '@manaflow/types';
import { CSSProperties, ReactNode } from 'react';
import { ReactReplayState } from '../store';
import { getReplayCardViewTransitionName } from '../view-transitions';
import { joinClassNames, getCardMetadata } from '../utils';

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
  state?: EntityState;
}

export interface ReplayViewportZoneTitleRenderContext {
  zone: ReplayViewportZoneConfig;
  snapshot: GameSnapshot;
  entityIds: string[];
}

const DEFAULT_ZONES: ReplayViewportZoneConfig[] = [
  { id: 'hand', title: 'Hand' },
  { id: 'board', title: 'Board' },
  { id: 'graveyard', title: 'Graveyard' },
  { id: 'deck', title: 'Deck' },
  { id: 'stack', title: 'Stack' }
];

function defaultTimelineFormatter(snapshot: GameSnapshot): string {
  const phase = snapshot.currentPhase ?? snapshot.metadata?.currentPhase ?? '';
  return `Turn ${snapshot.turn} · Phase ${phase} · Player ${snapshot.currentPlayer}`;
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
  const focusZones = state.frame.event?.metadata?.focusZones ?? [];
  const viewerId =
    typeof snapshot.metadata?.viewerId === 'string' ? snapshot.metadata.viewerId : snapshot.currentPlayer;

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
        const zoneMeta = snapshot.zoneMeta?.[zone.id];
        const zoneTitle = zoneMeta?.label ?? zone.title;
        const visibility = zoneMeta?.visibility;
        const isOwnerHidden =
          visibility === 'owner' && zoneMeta?.ownerId && zoneMeta.ownerId !== 'shared' && zoneMeta.ownerId !== viewerId;
        const isHidden = visibility === 'hidden' || isOwnerHidden;
        const capacity = zoneMeta?.capacity;
        const visibleIds = isHidden || !capacity ? entityIds : entityIds.slice(0, Math.max(0, capacity));
        const overflowCount =
          isHidden || !capacity ? 0 : Math.max(0, entityIds.length - Math.max(0, capacity));
        const isFocused = focusZones.includes(zone.id);
        return (
          <div
            key={zone.id}
            className={joinClassNames(
              'replay-player__zone',
              `replay-player__zone--${zone.id}`,
              isFocused ? 'replay-player__zone--focused' : undefined,
              isHidden ? 'replay-player__zone--hidden' : undefined
            )}
            role="group"
            aria-label={zoneTitle}
          >
            <div className="replay-player__zone-title">
              {renderZoneTitle
                ? renderZoneTitle({
                    zone: { ...zone, title: zoneTitle },
                    snapshot,
                    entityIds
                  })
                : zoneTitle}
            </div>
            <div className="replay-player__zone-rail" data-zone-id={zone.id}>
              {isHidden ? (
                <div className="replay-player__zone-placeholder">
                  Hidden ({entityIds.length})
                </div>
              ) : null}
              {visibleIds.map((entityId) => {
                const card = getCardMetadata(entityId, snapshot);
                const entityState = snapshot.entities[entityId]?.state;
                const cardStyle = viewTransitions
                  ? ({ viewTransitionName: getReplayCardViewTransitionName(entityId) } as CSSProperties)
                  : undefined;
                return (
                  <div
                    key={entityId}
                    className={joinClassNames(
                      'replay-player__card',
                      entityState?.tapped ? 'replay-player__card--tapped' : undefined,
                      entityState?.exhausted ? 'replay-player__card--exhausted' : undefined,
                      entityState?.faceDown ? 'replay-player__card--face-down' : undefined,
                      cardClassName
                    )}
                    role="article"
                    style={cardStyle}
                  >
                    {renderCard ? (
                      renderCard({
                        entityId,
                        zoneId: zone.id,
                        snapshot,
                        card,
                        state: entityState
                      })
                    ) : (
                      <>
                        {entityState?.faceDown ? (
                          <div className="replay-player__card-name">Face-down</div>
                        ) : (
                          <>
                            <div className="replay-player__card-name">{card?.name ?? entityId}</div>
                            <div className="replay-player__card-cost">Cost {card?.cost ?? '-'}</div>
                          </>
                        )}
                        {entityState?.damage !== undefined ? (
                          <div className="replay-player__card-badge replay-player__card-badge--damage">
                            {entityState.damage} dmg
                          </div>
                        ) : null}
                        {entityState?.attachments?.length ? (
                          <div className="replay-player__card-badge replay-player__card-badge--attachments">
                            +{entityState.attachments.length} att
                          </div>
                        ) : null}
                        {entityState?.counters
                          ? Object.entries(entityState.counters).map(([key, value]) => (
                              <div key={key} className="replay-player__card-badge">
                                {key}:{value}
                              </div>
                            ))
                          : null}
                      </>
                    )}
                  </div>
                );
              })}
              {overflowCount > 0 ? (
                <div className="replay-player__zone-overflow">+{overflowCount} more</div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
