import { Card, GameSnapshot, ZoneId } from '@manaflow/types';
import { ReactNode } from 'react';
import { ReactReplayState } from '../store';
import { joinClassNames, getCardMetadata } from '../utils';

export interface ReplayTableProps {
  state: ReactReplayState;
  zones?: ReplayTableZoneConfig[];
  zoneMap?: ReplayTableZoneMap;
  className?: string;
  cardClassName?: string;
  renderZoneTitle?: (context: ReplayTableZoneTitleRenderContext) => ReactNode;
  renderCard?: (context: ReplayTableCardRenderContext) => ReactNode;
}

export interface ReplayTableZoneConfig {
  id: ZoneId;
  title: string;
}

export interface ReplayTableZoneMap {
  [zoneId: string]: string | string[];
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

function normalizeAliases(aliases: string | string[] | undefined, fallback: string): string[] {
  if (!aliases) {
    return [fallback];
  }

  return Array.isArray(aliases) ? aliases : [aliases];
}

function resolveZoneEntityIds(snapshot: GameSnapshot, zoneId: ZoneId, zoneMap: ReplayTableZoneMap | undefined): string[] {
  const aliases = normalizeAliases(zoneMap?.[zoneId], zoneId);
  let fallback: string[] | undefined;

  for (const alias of aliases) {
    const entityIds = snapshot.zones[alias];
    if (!Array.isArray(entityIds)) {
      continue;
    }

    if (!fallback) {
      fallback = entityIds;
    }

    if (entityIds.length > 0) {
      return entityIds;
    }
  }

  return fallback ?? [];
}

export function ReplayTable({
  state,
  zones = DEFAULT_ZONES,
  zoneMap,
  className,
  cardClassName,
  renderZoneTitle,
  renderCard
}: ReplayTableProps) {
  const snapshot = state.frame.snapshot;

  return (
    <section className={joinClassNames('replay-table', className)} aria-label="Shared table">
      {zones.map((zone) => {
        const entityIds = resolveZoneEntityIds(snapshot, zone.id, zoneMap);
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
