import { Card, EntityState, GameSnapshot } from '@manaflow/types';
import { CSSProperties, ReactNode, memo } from 'react';
import { joinClassNames, getCardMetadata } from './index';

export interface BaseZoneConfig {
  id: string;
  title: string;
}

export interface BaseCardRenderContext {
  entityId: string;
  card: Card | undefined;
  state?: EntityState;
}

export interface ZoneCardProps {
  entityId: string;
  card: Card | undefined;
  entityState?: EntityState;
  cardClassName?: string;
  cardStyle?: CSSProperties;
  baseClassName?: string;
}

const ZoneCard = memo<ZoneCardProps>(function ZoneCard({
  entityId,
  card,
  entityState,
  cardClassName,
  cardStyle,
  baseClassName = 'replay-player__card'
}) {
  return (
    <div
      className={joinClassNames(
        baseClassName,
        entityState?.tapped ? `${baseClassName}--tapped` : undefined,
        entityState?.exhausted ? `${baseClassName}--exhausted` : undefined,
        entityState?.faceDown ? `${baseClassName}--face-down` : undefined,
        cardClassName
      )}
      role="article"
      style={cardStyle}
    >
      {entityState?.faceDown ? (
        <div className={`${baseClassName}-name`}>Face-down</div>
      ) : (
        <>
          <div className={`${baseClassName}-name`}>{card?.name ?? entityId}</div>
          <div className={`${baseClassName}-cost`}>Cost {card?.cost ?? '-'}</div>
        </>
      )}
      {entityState?.damage !== undefined ? (
        <div className={`${baseClassName}-badge ${baseClassName}-badge--damage`}>
          {entityState.damage} dmg
        </div>
      ) : null}
      {entityState?.attachments?.length ? (
        <div className={`${baseClassName}-badge ${baseClassName}-badge--attachments`}>
          +{entityState.attachments.length} att
        </div>
      ) : null}
      {entityState?.counters
        ? Object.entries(entityState.counters).map(([key, value]) => (
            <div key={key} className={`${baseClassName}-badge`}>
              {key}:{value}
            </div>
          ))
        : null}
    </div>
  );
});

export interface ZoneRendererProps<T extends BaseZoneConfig> {
  zones: T[];
  snapshot: GameSnapshot;
  getEntityIds: (zone: T) => string[];
  renderCard?: (context: BaseCardRenderContext) => ReactNode;
  renderZoneTitle?: (context: { zone: T; entityIds: string[]; snapshot: GameSnapshot }) => ReactNode;
  cardClassName?: string;
  baseClassName?: string;
  viewTransitions?: boolean;
}

export function ZoneRenderer<T extends BaseZoneConfig>({
  zones,
  snapshot,
  getEntityIds,
  renderCard,
  renderZoneTitle,
  cardClassName,
  baseClassName = 'replay-player__card',
  viewTransitions = true
}: ZoneRendererProps<T>): ReactNode {
  return (
    <>
      {zones.map((zone) => {
        const entityIds = getEntityIds(zone);
        return (
          <div key={zone.id} className={joinClassNames('replay-player__zone', `replay-player__zone--${zone.id}`)}>
            <div className="replay-player__zone-title">
              {renderZoneTitle
                ? renderZoneTitle({ zone, entityIds, snapshot })
                : `${zone.title} (${entityIds.length})`}
            </div>
            <div className="replay-player__zone-rail" data-zone-id={zone.id}>
              {entityIds.map((entityId) => {
                const card = getCardMetadata(entityId, snapshot);
                const entityState = snapshot.entities[entityId]?.state;
                const cardStyle: CSSProperties | undefined = viewTransitions
                  ? { viewTransitionName: `replay-card-${entityId}` }
                  : undefined;

                if (renderCard) {
                  return (
                    <div key={entityId} className={joinClassNames(baseClassName, cardClassName)} role="article">
                      {renderCard({ entityId, card, state: entityState })}
                    </div>
                  );
                }

                return (
                  <ZoneCard
                    key={entityId}
                    entityId={entityId}
                    card={card}
                    entityState={entityState}
                    cardClassName={cardClassName}
                    cardStyle={cardStyle}
                    baseClassName={baseClassName}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

export interface SimpleZoneRendererProps<T extends BaseZoneConfig> {
  zones: T[];
  snapshot: GameSnapshot;
  getEntityIds: (zone: T) => string[];
  renderCard?: (context: BaseCardRenderContext) => ReactNode;
  renderZoneTitle?: (context: { zone: T; entityIds: string[]; snapshot: GameSnapshot }) => ReactNode;
  cardClassName?: string;
  baseClassName?: string;
}

export function SimpleZoneRenderer<T extends BaseZoneConfig>({
  zones,
  snapshot,
  getEntityIds,
  renderCard,
  renderZoneTitle,
  cardClassName,
  baseClassName = 'replay-player__card'
}: SimpleZoneRendererProps<T>): ReactNode {
  return (
    <>
      {zones.map((zone) => {
        const entityIds = getEntityIds(zone);
        return (
          <div key={zone.id} className={joinClassNames('replay-player__zone', `replay-player__zone--${zone.id}`)}>
            <div className="replay-player__zone-title">
              {renderZoneTitle
                ? renderZoneTitle({ zone, entityIds, snapshot })
                : `${zone.title} (${entityIds.length})`}
            </div>
            <div className="replay-player__zone-rail" data-zone-id={zone.id}>
              {entityIds.map((entityId) => {
                const card = getCardMetadata(entityId, snapshot);
                return (
                  <div key={entityId} className={joinClassNames(baseClassName, cardClassName)} role="article">
                    {renderCard
                      ? renderCard({ entityId, card, state: snapshot.entities[entityId]?.state })
                      : card?.name ?? entityId}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
