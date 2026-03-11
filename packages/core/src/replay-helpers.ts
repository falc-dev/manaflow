import { EntityState, GameSnapshot, ZoneId, ZoneMeta } from '@manaflow/types';

export function getZoneMeta(snapshot: GameSnapshot, zoneId: ZoneId): ZoneMeta | undefined {
  return snapshot.zoneMeta?.[zoneId];
}

export function getZoneEntities(snapshot: GameSnapshot, zoneId: ZoneId): string[] {
  return snapshot.zones[zoneId] ?? [];
}

export function getEntityState(snapshot: GameSnapshot, entityId: string): EntityState | undefined {
  return snapshot.entities[entityId]?.state;
}
