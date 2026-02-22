import { GameSnapshot, PlayerState, ResourceState } from '@manaflow/types';

export interface ReplayPlayerFieldZones {
  hand: string[];
  deck: string[];
  trash: string[];
}

export interface ReplayPlayerField {
  playerId: string;
  playerName: string;
  health: number;
  resources: ResourceState[];
  zones: ReplayPlayerFieldZones;
}

export type ReplayPlayerFieldZoneKey = keyof ReplayPlayerFieldZones;

export interface ReplayPlayerFieldZoneMap {
  hand?: string | string[];
  deck?: string | string[];
  trash?: string | string[];
}

export interface SelectPlayerFieldOptions {
  zoneMap?: ReplayPlayerFieldZoneMap;
}

function cloneArray(values: string[] | undefined): string[] {
  return Array.isArray(values) ? [...values] : [];
}

const DEFAULT_ZONE_MAP: Record<ReplayPlayerFieldZoneKey, string[]> = {
  hand: ['hand'],
  deck: ['deck'],
  trash: ['discard', 'graveyard', 'trash']
};

function normalizeAliases(aliases: string | string[] | undefined, fallback: string[]): string[] {
  if (!aliases) {
    return [...fallback];
  }

  return Array.isArray(aliases) ? aliases : [aliases];
}

function getPlayerZoneByAlias(player: PlayerState, alias: string): string[] | undefined {
  if (alias === 'hand') {
    return player.hand;
  }

  if (alias === 'deck') {
    return player.deck;
  }

  if (alias === 'discard') {
    return player.discard;
  }

  return player.zones?.[alias];
}

function resolveZone(player: PlayerState, aliases: string[]): string[] {
  let fallback: string[] | undefined;
  for (const alias of aliases) {
    const values = getPlayerZoneByAlias(player, alias);
    if (!Array.isArray(values)) {
      continue;
    }

    if (!fallback) {
      fallback = values;
    }

    if (values.length > 0) {
      return [...values];
    }
  }

  return cloneArray(fallback);
}

function resolveFieldZones(player: PlayerState, zoneMap: ReplayPlayerFieldZoneMap | undefined): ReplayPlayerFieldZones {
  return {
    hand: resolveZone(player, normalizeAliases(zoneMap?.hand, DEFAULT_ZONE_MAP.hand)),
    deck: resolveZone(player, normalizeAliases(zoneMap?.deck, DEFAULT_ZONE_MAP.deck)),
    trash: resolveZone(player, normalizeAliases(zoneMap?.trash, DEFAULT_ZONE_MAP.trash))
  };
}

export function selectPlayerField(
  snapshot: GameSnapshot,
  playerId: string,
  options?: SelectPlayerFieldOptions
): ReplayPlayerField | null {
  const player = snapshot.players.find((entry) => entry.id === playerId);
  if (!player) {
    return null;
  }

  return {
    playerId: player.id,
    playerName: player.name,
    health: player.health,
    resources: [...player.resources],
    zones: resolveFieldZones(player, options?.zoneMap)
  };
}

export function selectPlayerFields(snapshot: GameSnapshot, options?: SelectPlayerFieldOptions): ReplayPlayerField[] {
  return snapshot.players
    .map((player) => selectPlayerField(snapshot, player.id, options))
    .filter((field): field is ReplayPlayerField => field !== null);
}
