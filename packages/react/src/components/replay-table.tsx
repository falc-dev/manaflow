import { Card, GameSnapshot, ZoneId } from '@manaflow/types';
import { ReactNode } from 'react';
import { ReactReplayState } from '../store';

export interface ReplayTableProps {
  state: ReactReplayState;
  zones?: ReplayTableZoneConfig[];
  className?: string;
  cardClassName?: string;
  renderZoneTitle?: (context: ReplayTableZoneTitleRenderContext) => ReactNode;
  renderCard?: (context: ReplayTableCardRenderContext) => ReactNode;
}

export interface ReplayTableZoneConfig {
  id: ZoneId;
  title: string;
}

export interface ReplayTableZoneTitleRenderContext {
  zone: ReplayTableZoneConfig;
  snapshot: GameSnapshot;
  entityIds: string[];
}

export interface ReplayTableCardRenderContext {
  zone: ReplayTableZoneConfig;
  snapshot: GameSnapshot;
  entityId: string;
  card: Card | undefined;
}

const DEFAULT_ZONES: ReplayTableZoneConfig[] = [
  { id: 'board', title: 'Table' },
  { id: 'stack', title: 'Stack' }
];

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function getCardMetadata(entityId: string, snapshot: GameSnapshot): Card | undefined {
  const entity = snapshot.entities[entityId];
  return entity?.components.find((component) => component.componentType === 'CARD')?.metadata as Card | undefined;
}

export function ReplayTable({
  state,
  zones = DEFAULT_ZONES,
  className,
  cardClassName,
  renderZoneTitle,
  renderCard
}: ReplayTableProps) {
  const snapshot = state.frame.snapshot;

  return (
    <section className={joinClassNames('replay-table', className)} aria-label="Shared table">
      {zones.map((zone) => {
        const entityIds = snapshot.zones[zone.id] ?? [];
        return (
          <article key={zone.id} className={joinClassNames('replay-table__zone', `replay-table__zone--${zone.id}`)}>
            <div className="replay-table__zone-title">
              {renderZoneTitle
                ? renderZoneTitle({
                    zone,
                    snapshot,
                    entityIds
                  })
                : `${zone.title} (${entityIds.length})`}
            </div>

            <div className="replay-table__zone-rail">
              {entityIds.map((entityId) => {
                const card = getCardMetadata(entityId, snapshot);
                return (
                  <div key={entityId} className={joinClassNames('replay-table__card', cardClassName)}>
                    {renderCard
                      ? renderCard({
                          zone,
                          snapshot,
                          entityId,
                          card
                        })
                      : card?.name ?? entityId}
                  </div>
                );
              })}
            </div>
          </article>
        );
      })}
    </section>
  );
}
