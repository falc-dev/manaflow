import type { GameFormat, ReplayData, ReplayFormatOverrides } from '@manaflow/types';

export interface ReplayFormatIssue {
  path: string;
  message: string;
}

export interface ReplayFormatValidationSuccess {
  ok: true;
  format: GameFormat;
}

export interface ReplayFormatValidationFailure {
  ok: false;
  format: GameFormat;
  issues: ReplayFormatIssue[];
}

export type ReplayFormatValidationResult = ReplayFormatValidationSuccess | ReplayFormatValidationFailure;

function applyFormatOverrides(base: GameFormat, overrides?: ReplayFormatOverrides): GameFormat {
  if (!overrides) {
    return base;
  }

  const mergedMetadata = overrides.metadata
    ? {
        ...(base.metadata ?? {}),
        ...overrides.metadata
      }
    : base.metadata;

  return {
    schemaVersion: base.schemaVersion,
    formatId: base.formatId,
    name: overrides.name ?? base.name,
    rulesProfile: overrides.rulesProfile ?? base.rulesProfile,
    players: overrides.players ?? base.players,
    phases: overrides.phases ?? base.phases,
    zones: {
      ...base.zones,
      ...(overrides.zones ?? {})
    },
    zoneOrder: overrides.zoneOrder ?? base.zoneOrder,
    zoneGroups: overrides.zoneGroups ?? base.zoneGroups,
    metadata: mergedMetadata
  };
}

export function resolveReplayFormat(replay: ReplayData, baseFormat: GameFormat): GameFormat {
  return applyFormatOverrides(baseFormat, replay.formatOverrides);
}

function pushIssue(issues: ReplayFormatIssue[], path: string, condition: boolean, message: string): void {
  if (!condition) {
    issues.push({ path, message });
  }
}

function collectSnapshotIssues(
  issues: ReplayFormatIssue[],
  snapshot: ReplayData['initialState'],
  label: string,
  format: GameFormat
): void {
  const expectedRulesProfile = format.rulesProfile;
  pushIssue(
    issues,
    `${label}.metadata.rulesProfile`,
    snapshot.metadata.rulesProfile === expectedRulesProfile,
    `${label}: metadata.rulesProfile must be "${expectedRulesProfile}".`
  );

  const playerIds = new Set(format.players.ids);
  if (format.players.count !== undefined) {
    pushIssue(
      issues,
      `${label}.players`,
      snapshot.players.length === format.players.count,
      `${label}: expected ${format.players.count} players.`
    );
  }

  pushIssue(
    issues,
    `${label}.players`,
    snapshot.players.length === format.players.ids.length,
    `${label}: expected ${format.players.ids.length} players based on format ids.`
  );

  for (const player of snapshot.players) {
    pushIssue(
      issues,
      `${label}.players`,
      playerIds.has(player.id),
      `${label}: unexpected player id "${player.id}".`
    );
  }

  const zoneIds = new Set(Object.keys(format.zones));
  for (const zoneId of Object.keys(snapshot.zones)) {
    pushIssue(
      issues,
      `${label}.zones`,
      zoneIds.has(zoneId),
      `${label}: unknown zone "${zoneId}" not present in format.`
    );
  }
}

export function collectReplayFormatIssues(replay: ReplayData, baseFormat: GameFormat): ReplayFormatIssue[] {
  const issues: ReplayFormatIssue[] = [];
  const resolved = resolveReplayFormat(replay, baseFormat);

  if (replay.formatRef?.formatId) {
    pushIssue(
      issues,
      'formatRef.formatId',
      replay.formatRef.formatId === baseFormat.formatId,
      `formatRef.formatId must match base formatId ("${baseFormat.formatId}").`
    );
  }

  if (replay.formatRef?.schemaVersion !== undefined) {
    pushIssue(
      issues,
      'formatRef.schemaVersion',
      replay.formatRef.schemaVersion === baseFormat.schemaVersion,
      `formatRef.schemaVersion must match base schemaVersion (${baseFormat.schemaVersion}).`
    );
  }

  collectSnapshotIssues(issues, replay.initialState, 'initialState', resolved);
  for (let index = 0; index < replay.events.length; index += 1) {
    collectSnapshotIssues(issues, replay.events[index].snapshot, `events[${index}].snapshot`, resolved);
  }

  return issues;
}

export function validateReplayFormat(replay: ReplayData, baseFormat: GameFormat): ReplayFormatValidationResult {
  const format = resolveReplayFormat(replay, baseFormat);
  const issues = collectReplayFormatIssues(replay, baseFormat);
  if (issues.length === 0) {
    return { ok: true, format };
  }
  return { ok: false, format, issues };
}
