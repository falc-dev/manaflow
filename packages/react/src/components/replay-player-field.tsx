import { Card, GameSnapshot } from '@manaflow/types';
import { ReactNode } from 'react';
import { ReplayPlayerField as ReplayPlayerFieldData, ReplayPlayerFieldZoneMap, selectPlayerField } from '../player-field';
import { ReactReplayState } from '../store';
import { joinClassNames, getCardMetadata } from '../utils';

export interface ReplayPlayerFieldProps {
  state: ReactReplayState;
  field: ReplayPlayerFieldData;
  zoneMap?: ReplayPlayerFieldZoneMap;
  className?: string;
  cardClassName?: string;
  zones?: ReplayPlayerFieldZoneConfig[];
  renderZoneTitle?: (context: ReplayPlayerFieldZoneTitleRenderContext) => ReactNode;
  renderCard?: (context: ReplayPlayerFieldCardRenderContext) => ReactNode;
}

export interface ReplayPlayerFieldZoneConfig {
  id: keyof ReplayPlayerFieldData['zones'];
  title: string;
}

export interface ReplayPlayerFieldZoneTitleRenderContext {
  zone: ReplayPlayerFieldZoneConfig;
  snapshot: GameSnapshot;
  field: ReplayPlayerFieldData;
  entityIds: string[];
}

export interface ReplayPlayerFieldCardRenderContext {
  zone: ReplayPlayerFieldZoneConfig;
  snapshot: GameSnapshot;
  field: ReplayPlayerFieldData;
  entityId: string;
  card: Card | undefined;
}

const DEFAULT_ZONES: ReplayPlayerFieldZoneConfig[] = [
  { id: 'hand', title: 'Hand' },
  { id: 'deck', title: 'Deck' },
  { id: 'trash', title: 'Trash' }
];

export function ReplayPlayerField({
  state,
  field,
  zoneMap,
  className,
  cardClassName,
  zones = DEFAULT_ZONES,
  renderZoneTitle,
  renderCard
}: ReplayPlayerFieldProps) {
  const snapshot = state.frame.snapshot;
  const resolvedField = zoneMap ? selectPlayerField(snapshot, field.playerId, { zoneMap }) ?? field : field;

  return (
    <article className={joinClassNames('replay-player-field', className)} aria-label={`${resolvedField.playerName} field`}>
      <header className="replay-player-field__header">
        <strong>{resolvedField.playerName}</strong>
        <span>HP {resolvedField.health}</span>
      </header>

      <div className="replay-player-field__zones">
        {zones.map((zone) => {
          const entityIds = resolvedField.zones[zone.id] ?? [];
          return (
            <section
              key={zone.id}
              className={joinClassNames('replay-player-field__zone', `replay-player-field__zone--${zone.id}`)}
              aria-label={zone.title}
            >
              <div className="replay-player-field__zone-title">
                {renderZoneTitle
                  ? renderZoneTitle({
                      zone,
                      snapshot,
                      field: resolvedField,
                      entityIds
                    })
                  : `${zone.title} (${entityIds.length})`}
              </div>

              <div className="replay-player-field__zone-rail">
                {entityIds.map((entityId) => {
                  const card = getCardMetadata(entityId, snapshot);
                  return (
                    <div key={entityId} className={joinClassNames('replay-player-field__card', cardClassName)}>
                      {renderCard
                        ? renderCard({
                            zone,
                            snapshot,
                            field: resolvedField,
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
        })}
      </div>
    </article>
  );
}
