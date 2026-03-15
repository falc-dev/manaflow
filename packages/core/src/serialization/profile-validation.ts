import { ReplaySchemaType } from './schema';
import { profileRegistry } from '../profiles';
import type { ProfileValidationIssue } from '../profiles/types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function pushIssue(
  issues: ProfileValidationIssue[],
  path: string,
  condition: boolean,
  message: string
): void {
  if (!condition) {
    issues.push({ path, message });
  }
}

function collectZoneMetaIssues(
  snapshot: ReplaySchemaType['initialState'],
  label: string,
  issues: ProfileValidationIssue[]
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

function validateSnapshotWithProfile(
  snapshot: ReplaySchemaType['initialState'],
  label: string,
  profileId: string,
  issues: ProfileValidationIssue[]
): void {
  const profile = profileRegistry.get(profileId);
  if (!profile) {
    return;
  }

  if (profile.requiredPlayers) {
    const { ids, count } = profile.requiredPlayers;
    if (count !== undefined) {
      pushIssue(
        issues,
        `${label}.players`,
        snapshot.players.length === count,
        `${label}: expected ${count} players.`
      );
    }

    pushIssue(
      issues,
      `${label}.players`,
      snapshot.players.length === ids.length,
      `${label}: expected ${ids.length} players based on profile.`
    );

    const playerIds = new Set(snapshot.players.map((player) => player.id));
    for (const requiredId of ids) {
      pushIssue(
        issues,
        `${label}.players`,
        playerIds.has(requiredId),
        `${label}: missing required player "${requiredId}".`
      );
    }
  }

  if (profile.requiredZones) {
    const requiredZoneIds = profile.requiredZones.map((z: { id: string }) => z.id);
    const missingZones = requiredZoneIds.filter((zoneId: string) => !(zoneId in snapshot.zones));
    pushIssue(
      issues,
      `${label}.zones`,
      missingZones.length === 0,
      `${label}: missing required zones for ${profileId}: ${missingZones.join(', ')}.`
    );
  }

  if (profile.validator) {
    const profileIssues = profile.validator(snapshot);
    issues.push(...profileIssues);
  }
}

export function collectReplayProfileIssues(replay: ReplaySchemaType): ProfileValidationIssue[] {
  const issues: ProfileValidationIssue[] = [];
  const metadata = asRecord(replay.initialState.metadata);
  const rulesProfile = metadata?.rulesProfile as string | undefined;
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

  if (!rulesProfile) {
    return issues;
  }

  validateSnapshotWithProfile(replay.initialState, 'initialState', rulesProfile, issues);

  for (let index = 0; index < replay.events.length; index += 1) {
    const frame = replay.events[index];
    const label = `events[${index}].snapshot`;
    validateSnapshotWithProfile(frame.snapshot, label, rulesProfile, issues);
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
