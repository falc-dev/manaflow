import { ReplaySchemaType } from './schema';

const RIFTBOUND_PROFILE = 'riftbound-1v1-v1';
const REQUIRED_ZONE_IDS = [
  'battlefield_north',
  'battlefield_south',
  'champion_blue',
  'champion_red',
  'deck_blue',
  'deck_red',
  'runes_blue',
  'runes_red',
  'rune_deck_blue',
  'rune_deck_red',
  'trash_blue',
  'trash_red',
  'stack'
] as const;

const CONTROL_ZONE_IDS = ['battlefield_north', 'battlefield_south'] as const;
const ALLOWED_CONTROL_VALUES = new Set(['blue', 'red', 'neutral']);
const REQUIRED_PLAYER_IDS = new Set(['blue', 'red']);
export interface ReplayProfileIssue {
  path: string;
  message: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function pushIssue(
  issues: ReplayProfileIssue[],
  path: string,
  condition: boolean,
  message: string
): void {
  if (!condition) {
    issues.push({ path, message });
  }
}

function collectRiftboundSnapshotIssues(
  snapshot: ReplaySchemaType['initialState'],
  label: string,
  issues: ReplayProfileIssue[]
): void {
  pushIssue(
    issues,
    `${label}.players`,
    snapshot.players.length === 2,
    `${label}: ${RIFTBOUND_PROFILE} requires exactly 2 players.`
  );

  const playerIds = new Set(snapshot.players.map((player) => player.id));
  for (const requiredPlayerId of REQUIRED_PLAYER_IDS) {
    pushIssue(
      issues,
      `${label}.players`,
      playerIds.has(requiredPlayerId),
      `${label}: missing required player "${requiredPlayerId}".`
    );
  }

  pushIssue(
    issues,
    `${label}.currentPlayer`,
    playerIds.has(snapshot.currentPlayer),
    `${label}: currentPlayer "${snapshot.currentPlayer}" is not present in snapshot players.`
  );

  const missingZones = REQUIRED_ZONE_IDS.filter((zoneId) => !(zoneId in snapshot.zones));
  pushIssue(
    issues,
    `${label}.zones`,
    missingZones.length === 0,
    `${label}: missing required zones for ${RIFTBOUND_PROFILE}: ${missingZones.join(', ')}.`
  );

  const metadata = asRecord(snapshot.metadata);
  const control = asRecord(metadata?.control);
  pushIssue(issues, `${label}.metadata.control`, control !== null, `${label}: metadata.control must be an object.`);
  if (!control) {
    return;
  }

  for (const zoneId of CONTROL_ZONE_IDS) {
    const value = control[zoneId];
    pushIssue(
      issues,
      `${label}.metadata.control.${zoneId}`,
      typeof value === 'string' && ALLOWED_CONTROL_VALUES.has(value),
      `${label}: metadata.control.${zoneId} must be one of blue|red|neutral.`
    );
  }
}

function collectZoneMetaIssues(
  snapshot: ReplaySchemaType['initialState'],
  label: string,
  issues: ReplayProfileIssue[]
): void {
  if (!snapshot.zoneMeta) {
    return;
  }

  const playerIds = new Set(snapshot.players.map((player) => player.id));
  for (const [zoneId, meta] of Object.entries(snapshot.zoneMeta)) {
    pushIssue(
      issues,
      `${label}.zoneMeta.${zoneId}`,
      zoneId in snapshot.zones,
      `${label}: zoneMeta references unknown zone "${zoneId}".`
    );

    const ownerId = meta?.ownerId;
    if (!ownerId || ownerId === 'shared') {
      continue;
    }

    pushIssue(
      issues,
      `${label}.zoneMeta.${zoneId}.ownerId`,
      playerIds.has(ownerId),
      `${label}: zoneMeta.${zoneId}.ownerId must match a player id or "shared".`
    );
  }
}

export function collectReplayProfileIssues(replay: ReplaySchemaType): ReplayProfileIssue[] {
  const issues: ReplayProfileIssue[] = [];
  const metadata = asRecord(replay.initialState.metadata);
  const rulesProfile = metadata?.rulesProfile;
  const formatOverrides = asRecord(replay.formatOverrides);
  const overrideRulesProfile = formatOverrides?.rulesProfile;
  collectZoneMetaIssues(replay.initialState, 'initialState', issues);
  for (let index = 0; index < replay.events.length; index += 1) {
    const frame = replay.events[index];
    const label = `events[${index}].snapshot`;
    collectZoneMetaIssues(frame.snapshot, label, issues);
  }

  if (overrideRulesProfile) {
    pushIssue(
      issues,
      'formatOverrides.rulesProfile',
      overrideRulesProfile === rulesProfile,
      `formatOverrides.rulesProfile must match snapshot metadata.rulesProfile ("${rulesProfile}").`
    );
  }

  if (rulesProfile !== RIFTBOUND_PROFILE) {
    return issues;
  }

  const battlefieldCount = metadata?.battlefieldCount;
  pushIssue(
    issues,
    'initialState.metadata.battlefieldCount',
    battlefieldCount === 2,
    `initialState.metadata.battlefieldCount must be 2 when rulesProfile is "${RIFTBOUND_PROFILE}".`
  );

  collectRiftboundSnapshotIssues(replay.initialState, 'initialState', issues);

  for (let index = 0; index < replay.events.length; index += 1) {
    const frame = replay.events[index];
    const label = `events[${index}].snapshot`;
    collectRiftboundSnapshotIssues(frame.snapshot, label, issues);
  }

  return issues;
}

export function validateReplayProfile(replay: ReplaySchemaType): void {
  const issues = collectReplayProfileIssues(replay);
  if (issues.length > 0) {
    const detail = issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
    throw new Error(detail);
  }
}
