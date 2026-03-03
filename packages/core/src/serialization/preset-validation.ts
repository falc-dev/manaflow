import { GameSnapshot, ReplayData } from '@manaflow/types';

export interface ReplayUiPresetZone {
  id: string;
  title?: string;
}

export interface ReplayUiPreset {
  schemaVersion?: number;
  presetId?: string;
  title?: string;
  rulesProfile?: string;
  viewport?: {
    layout?: string;
    zones?: ReplayUiPresetZone[];
  };
  duelLayout?: {
    sharedObjective?: {
      title?: string;
      zoneIds?: string[];
    };
    table?: {
      zones?: ReplayUiPresetZone[];
    };
  };
  zoneAliases?: Record<string, string[]>;
}

export interface ReplayPresetCompatibilityIssue {
  path: string;
  message: string;
  code: 'rules_profile_mismatch' | 'missing_zone';
}

export type ReplayPresetCompatibilityResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      issues: ReplayPresetCompatibilityIssue[];
    };

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function getRulesProfile(snapshot: GameSnapshot): string | undefined {
  const metadata = toRecord(snapshot.metadata);
  const rulesProfile = metadata?.rulesProfile;
  return typeof rulesProfile === 'string' ? rulesProfile : undefined;
}

function hasCompatibleZone(snapshot: GameSnapshot, zoneId: string, preset: ReplayUiPreset): boolean {
  if (zoneId in snapshot.zones) {
    return true;
  }

  const aliases = preset.zoneAliases?.[zoneId] ?? [];
  return aliases.some((alias) => alias in snapshot.zones);
}

function collectZoneRefs(preset: ReplayUiPreset): Array<{ zoneId: string; path: string }> {
  const refs: Array<{ zoneId: string; path: string }> = [];

  for (const [index, zone] of (preset.viewport?.zones ?? []).entries()) {
    refs.push({ zoneId: zone.id, path: `preset.viewport.zones[${index}].id` });
  }

  for (const [index, zoneId] of (preset.duelLayout?.sharedObjective?.zoneIds ?? []).entries()) {
    refs.push({ zoneId, path: `preset.duelLayout.sharedObjective.zoneIds[${index}]` });
  }

  for (const [index, zone] of (preset.duelLayout?.table?.zones ?? []).entries()) {
    refs.push({ zoneId: zone.id, path: `preset.duelLayout.table.zones[${index}].id` });
  }

  return refs;
}

export function validateReplayPresetCompatibility(
  replay: Pick<ReplayData, 'initialState'>,
  preset: ReplayUiPreset
): ReplayPresetCompatibilityResult {
  const issues: ReplayPresetCompatibilityIssue[] = [];
  const snapshot = replay.initialState;
  const replayRulesProfile = getRulesProfile(snapshot);

  if (typeof preset.rulesProfile === 'string' && typeof replayRulesProfile === 'string') {
    if (preset.rulesProfile !== replayRulesProfile) {
      issues.push({
        code: 'rules_profile_mismatch',
        path: 'preset.rulesProfile',
        message: `Preset rulesProfile "${preset.rulesProfile}" does not match replay rulesProfile "${replayRulesProfile}".`
      });
    }
  }

  for (const ref of collectZoneRefs(preset)) {
    if (!hasCompatibleZone(snapshot, ref.zoneId, preset)) {
      issues.push({
        code: 'missing_zone',
        path: ref.path,
        message: `Replay snapshot is missing zone "${ref.zoneId}" required by the preset.`
      });
    }
  }

  if (issues.length > 0) {
    return {
      ok: false,
      issues
    };
  }

  return { ok: true };
}
