import { ReactNode } from 'react';
import {
  ReplayPlayerField as ReplayPlayerFieldData,
  ReplayPlayerFieldZoneMap,
  selectPlayerFields
} from '../player-field';
import { ReactReplayState } from '../store';
import {
  ReplayPlayerField,
  ReplayPlayerFieldCardRenderContext,
  ReplayPlayerFieldProps,
  ReplayPlayerFieldZoneTitleRenderContext
} from './replay-player-field';
import {
  ReplaySharedObjective,
  ReplaySharedObjectiveCardRenderContext,
  ReplaySharedObjectiveProps,
  ReplaySharedObjectiveTitleRenderContext
} from './replay-shared-objective';
import {
  ReplayTable,
  ReplayTableCardRenderContext,
  ReplayTableProps,
  ReplayTableZoneTitleRenderContext
} from './replay-table';

export interface ReplayDuelLayoutProps {
  state: ReactReplayState;
  fields?: ReplayPlayerFieldData[];
  fieldZoneMap?: ReplayPlayerFieldZoneMap;
  className?: string;
  topClassName?: string;
  centerClassName?: string;
  bottomClassName?: string;
  playerCardClassName?: string;
  playerZones?: ReplayPlayerFieldProps['zones'];
  renderPlayerZoneTitle?: (context: ReplayPlayerFieldZoneTitleRenderContext) => ReactNode;
  renderPlayerCard?: (context: ReplayPlayerFieldCardRenderContext) => ReactNode;
  showSharedObjective?: boolean;
  sharedObjectiveProps?: Omit<ReplaySharedObjectiveProps, 'state'>;
  showTable?: boolean;
  tableProps?: Omit<ReplayTableProps, 'state'>;
  renderTableZoneTitle?: (context: ReplayTableZoneTitleRenderContext) => ReactNode;
  renderTableCard?: (context: ReplayTableCardRenderContext) => ReactNode;
  renderSharedObjectiveTitle?: (context: ReplaySharedObjectiveTitleRenderContext) => ReactNode;
  renderSharedObjectiveCard?: (context: ReplaySharedObjectiveCardRenderContext) => ReactNode;
}

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function orderFields(fields: ReplayPlayerFieldData[], currentPlayerId: string): ReplayPlayerFieldData[] {
  if (fields.length !== 2) {
    return fields;
  }

  const currentPlayerIndex = fields.findIndex((field) => field.playerId === currentPlayerId);
  if (currentPlayerIndex < 0) {
    return fields;
  }

  return [fields[(currentPlayerIndex + 1) % 2], fields[currentPlayerIndex]];
}

export function ReplayDuelLayout({
  state,
  fields,
  fieldZoneMap,
  className,
  topClassName,
  centerClassName,
  bottomClassName,
  playerCardClassName,
  playerZones,
  renderPlayerZoneTitle,
  renderPlayerCard,
  showSharedObjective = true,
  sharedObjectiveProps,
  showTable = true,
  tableProps,
  renderTableZoneTitle,
  renderTableCard,
  renderSharedObjectiveTitle,
  renderSharedObjectiveCard
}: ReplayDuelLayoutProps) {
  const selectedFields = fields ?? selectPlayerFields(state.frame.snapshot, { zoneMap: fieldZoneMap });
  const orderedFields = orderFields(selectedFields, state.frame.snapshot.currentPlayer);
  const topField = orderedFields[0];
  const bottomField = orderedFields[1];
  const effectiveTableProps =
    tableProps ?? (showSharedObjective ? { zones: [{ id: 'stack', title: 'Stack' }] } : undefined);

  return (
    <section className={joinClassNames('replay-duel-layout', className)} aria-label="Duel layout">
      {topField ? (
        <ReplayPlayerField
          state={state}
          field={topField}
          zoneMap={fieldZoneMap}
          className={joinClassNames('replay-duel-layout__top', topClassName)}
          cardClassName={playerCardClassName}
          zones={playerZones}
          renderZoneTitle={renderPlayerZoneTitle}
          renderCard={renderPlayerCard}
        />
      ) : null}

      <section className={joinClassNames('replay-duel-layout__center', centerClassName)}>
        {showSharedObjective ? (
          <ReplaySharedObjective
            state={state}
            {...sharedObjectiveProps}
            renderTitle={renderSharedObjectiveTitle ?? sharedObjectiveProps?.renderTitle}
            renderCard={renderSharedObjectiveCard ?? sharedObjectiveProps?.renderCard}
          />
        ) : null}

        {showTable ? (
          <ReplayTable
            state={state}
            {...effectiveTableProps}
            renderZoneTitle={renderTableZoneTitle ?? effectiveTableProps?.renderZoneTitle}
            renderCard={renderTableCard ?? effectiveTableProps?.renderCard}
          />
        ) : null}
      </section>

      {bottomField ? (
        <ReplayPlayerField
          state={state}
          field={bottomField}
          zoneMap={fieldZoneMap}
          className={joinClassNames('replay-duel-layout__bottom', bottomClassName)}
          cardClassName={playerCardClassName}
          zones={playerZones}
          renderZoneTitle={renderPlayerZoneTitle}
          renderCard={renderPlayerCard}
        />
      ) : null}
    </section>
  );
}
