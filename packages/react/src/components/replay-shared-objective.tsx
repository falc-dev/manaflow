import { Card, GameSnapshot, ZoneId } from '@manaflow/types';
import { ReactNode } from 'react';
import { ReactReplayState } from '../store';
import { joinClassNames, getCardMetadata } from '../utils';

export interface ReplaySharedObjectiveProps {
  state: ReactReplayState;
  title?: string;
  zoneIds?: ZoneId[];
  className?: string;
  cardClassName?: string;
  renderTitle?: (context: ReplaySharedObjectiveTitleRenderContext) => ReactNode;
  renderCard?: (context: ReplaySharedObjectiveCardRenderContext) => ReactNode;
}

export interface ReplaySharedObjectiveTitleRenderContext {
  title: string;
  snapshot: GameSnapshot;
  zoneId: ZoneId;
  entityIds: string[];
}

export interface ReplaySharedObjectiveCardRenderContext {
  snapshot: GameSnapshot;
  zoneId: ZoneId;
  entityId: string;
  card: Card | undefined;
}

const DEFAULT_ZONE_IDS: ZoneId[] = ['objective', 'board'];

function resolveSharedZone(snapshot: GameSnapshot, zoneIds: ZoneId[]): { zoneId: ZoneId; entityIds: string[] } {
  let fallbackZoneId: ZoneId = zoneIds[0] ?? 'board';
  let fallback: string[] = [];

  for (const zoneId of zoneIds) {
    const entityIds = snapshot.zones[zoneId];
    if (!Array.isArray(entityIds)) {
      continue;
    }

    if (fallback.length === 0) {
      fallbackZoneId = zoneId;
      fallback = entityIds;
    }

    if (entityIds.length > 0) {
      return { zoneId, entityIds };
    }
  }

  return { zoneId: fallbackZoneId, entityIds: fallback };
}

export function ReplaySharedObjective({
  state,
  title = 'Shared Objective',
  zoneIds = DEFAULT_ZONE_IDS,
  className,
  cardClassName,
  renderTitle,
  renderCard
}: ReplaySharedObjectiveProps) {
  const snapshot = state.frame.snapshot;
  const resolved = resolveSharedZone(snapshot, zoneIds);

  return (
    <section className={joinClassNames('replay-shared-objective', className)} aria-label={title}>
      <div className="replay-shared-objective__title">
        {renderTitle
          ? renderTitle({
              title,
              snapshot,
              zoneId: resolved.zoneId,
              entityIds: resolved.entityIds
            })
          : `${title} (${resolved.entityIds.length})`}
      </div>

      <div className="replay-shared-objective__rail">
        {resolved.entityIds.map((entityId) => {
          const card = getCardMetadata(entityId, snapshot);
          return (
            <div key={entityId} className={joinClassNames('replay-shared-objective__card', cardClassName)}>
              {renderCard
                ? renderCard({
                    snapshot,
                    zoneId: resolved.zoneId,
                    entityId,
                    card
                  })
                : card?.name ?? entityId}
            </div>
          );
        })}
      </div>
    </section>
  );
}
