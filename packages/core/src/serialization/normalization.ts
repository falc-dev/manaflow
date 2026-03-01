import { deepClone } from '../utils';
import { ReplaySchemaType } from './schema';

const ZONE_ALIASES: Record<string, string> = {
  battlefield_top: 'battlefield_north',
  battlefield_bot: 'battlefield_south',
  battlefield_mid: 'battlefield_south',
  blue_base: 'champion_blue',
  red_base: 'champion_red'
};

function canonicalizeZoneId(zoneId: string): string {
  return ZONE_ALIASES[zoneId] ?? zoneId;
}

function normalizeZoneMap(zones: Record<string, string[]>): Record<string, string[]> {
  const normalized: Record<string, string[]> = {};
  for (const [zoneId, entities] of Object.entries(zones)) {
    const canonical = canonicalizeZoneId(zoneId);
    const bucket = normalized[canonical] ?? [];
    bucket.push(...entities);
    normalized[canonical] = bucket;
  }
  return normalized;
}

function normalizePlayerZones(replay: ReplaySchemaType): void {
  const snapshots = [replay.initialState, ...replay.events.map((event) => event.snapshot)];
  for (const snapshot of snapshots) {
    for (const player of snapshot.players) {
      player.zones = normalizeZoneMap(player.zones);
    }
  }
}

function normalizeSnapshotZones(replay: ReplaySchemaType): void {
  const snapshots = [replay.initialState, ...replay.events.map((event) => event.snapshot)];
  for (const snapshot of snapshots) {
    snapshot.zones = normalizeZoneMap(snapshot.zones);
  }
}

function normalizeControlMetadata(replay: ReplaySchemaType): void {
  const snapshots = [replay.initialState, ...replay.events.map((event) => event.snapshot)];
  for (const snapshot of snapshots) {
    const metadata = snapshot.metadata as Record<string, unknown>;
    const control = metadata.control;
    if (!control || typeof control !== 'object' || Array.isArray(control)) {
      continue;
    }

    const normalizedControl: Record<string, unknown> = {};
    for (const [zoneId, owner] of Object.entries(control as Record<string, unknown>)) {
      normalizedControl[canonicalizeZoneId(zoneId)] = owner;
    }
    metadata.control = normalizedControl;
  }
}

function normalizeEventPayloadZones(replay: ReplaySchemaType): void {
  const zoneFields = ['from', 'to', 'targetFrom', 'targetTo', 'sourceZone'] as const;
  for (const frame of replay.events) {
    const payload = frame.event.action.payload;
    for (const field of zoneFields) {
      const value = payload[field];
      if (typeof value === 'string') {
        payload[field] = canonicalizeZoneId(value);
      }
    }

    const controlledBattlefields = payload.controlledBattlefields;
    if (Array.isArray(controlledBattlefields)) {
      payload.controlledBattlefields = controlledBattlefields.map((zoneId) =>
        typeof zoneId === 'string' ? canonicalizeZoneId(zoneId) : zoneId
      );
    }
  }
}

export function normalizeReplayAliases(replay: ReplaySchemaType): ReplaySchemaType {
  const normalized = deepClone(replay);
  normalizePlayerZones(normalized);
  normalizeSnapshotZones(normalized);
  normalizeControlMetadata(normalized);
  normalizeEventPayloadZones(normalized);
  return normalized;
}
