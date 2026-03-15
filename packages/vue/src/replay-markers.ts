export interface ReplayTimelineMarker {
  frame: number;
  label: string;
  actionType: string;
}

export type ReplayMarkerInput =
  | {
      action?: {
        type?: unknown;
      } | null;
    }
  | {
      event?: {
        action?: {
          type?: unknown;
        } | null;
      } | null;
    };

export interface BuildReplayMarkersOptions {
  includeSetup?: boolean;
  setupLabel?: string;
  actionLabels?: Record<string, string>;
}

const DEFAULT_ACTION_LABELS: Record<string, string> = {
  SETUP: 'Setup',
  DRAW_TO_FOUR: 'Draw To Four',
  BANK_RUNE: 'Bank Rune',
  DEPLOY_UNIT: 'Deploy Unit',
  MOVE_ENTITY: 'Move Entity',
  REPOSITION_UNIT: 'Reposition Unit',
  RETREAT_UNIT: 'Retreat Unit',
  CAST_SPELL: 'Cast Spell',
  END_TURN: 'End Turn',
  SCORE_BATTLEFIELDS: 'Score Battlefields',
  WIN_GAME: 'Win Game'
};

function toTitleCase(actionType: string): string {
  return actionType
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function resolveActionType(entry: ReplayMarkerInput | null | undefined): string {
  if (!entry) {
    return 'EVENT';
  }

  const directType = (entry as { action?: { type?: unknown } | null }).action?.type;
  if (typeof directType === 'string') {
    return directType;
  }

  const nestedType = (entry as { event?: { action?: { type?: unknown } | null } | null }).event?.action?.type;
  if (typeof nestedType === 'string') {
    return nestedType;
  }

  return 'EVENT';
}

export function getReplayActionLabel(actionType: string, actionLabels: Record<string, string> = {}): string {
  return actionLabels[actionType] ?? DEFAULT_ACTION_LABELS[actionType] ?? toTitleCase(actionType);
}

export function buildReplayMarkers(
  entries: Array<ReplayMarkerInput | null | undefined>,
  options: BuildReplayMarkersOptions = {}
): ReplayTimelineMarker[] {
  const includeSetup = options.includeSetup ?? true;
  const setupLabel = options.setupLabel ?? DEFAULT_ACTION_LABELS.SETUP;
  const markers: ReplayTimelineMarker[] = [];
  let frame = 0;

  if (includeSetup) {
    markers.push({
      frame: 0,
      label: setupLabel,
      actionType: 'SETUP'
    });
    frame = 1;
  }

  for (const entry of entries) {
    const actionType = resolveActionType(entry);
    markers.push({
      frame,
      label: getReplayActionLabel(actionType, options.actionLabels),
      actionType
    });
    frame += 1;
  }

  return markers;
}
