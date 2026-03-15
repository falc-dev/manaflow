import { KNOWN_REPLAY_ACTION_TYPES } from '@manaflow/types';
import type { GameSnapshot, KnownReplayActionType } from '@manaflow/types';
import type { RulesProfileDefinition, ProfileValidationIssue } from './types';

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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function pushIssue(issues: ProfileValidationIssue[], path: string, condition: boolean, message: string): void {
  if (!condition) {
    issues.push({ path, message });
  }
}

function validateRiftboundSnapshot(snapshot: GameSnapshot, label: string): ProfileValidationIssue[] {
  const issues: ProfileValidationIssue[] = [];

  pushIssue(
    issues,
    `${label}.players`,
    snapshot.players.length === 2,
    `${label}: riftbound-1v1-v1 requires exactly 2 players.`
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
    `${label}: missing required zones for riftbound-1v1-v1: ${missingZones.join(', ')}.`
  );

  const metadata = asRecord(snapshot.metadata);
  const control = asRecord(metadata?.control);
  pushIssue(issues, `${label}.metadata.control`, control !== null, `${label}: metadata.control must be an object.`);
  if (!control) {
    return issues;
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

  const battlefieldCount = metadata?.battlefieldCount;
  pushIssue(
    issues,
    'initialState.metadata.battlefieldCount',
    battlefieldCount === 2,
    `initialState.metadata.battlefieldCount must be 2 for riftbound-1v1-v1.`
  );

  return issues;
}

export const RIFTBOUND_PROFILE: RulesProfileDefinition = {
  id: 'riftbound-1v1-v1',
  name: 'Riftbound 1v1',
  description: 'Default profile for Riftbound 1v1 matches',
  requiredZones: REQUIRED_ZONE_IDS.map((id) => ({ id })),
  requiredPlayers: { ids: ['blue', 'red'], count: 2 },
  actionCatalog: ['SNAPSHOT', ...KNOWN_REPLAY_ACTION_TYPES] as readonly KnownReplayActionType[],
  validator: (snapshot: GameSnapshot) => validateRiftboundSnapshot(snapshot, 'snapshot')
};
