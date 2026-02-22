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

function cloneArray(values: string[] | undefined): string[] {
  return Array.isArray(values) ? [...values] : [];
}

function resolveTrash(player: PlayerState): string[] {
  if (Array.isArray(player.discard) && player.discard.length > 0) {
    return [...player.discard];
  }

  const graveyardZone = player.zones?.graveyard;
  if (Array.isArray(graveyardZone)) {
    return [...graveyardZone];
  }

  const trashZone = player.zones?.trash;
  return cloneArray(trashZone);
}

export function selectPlayerField(snapshot: GameSnapshot, playerId: string): ReplayPlayerField | null {
  const player = snapshot.players.find((entry) => entry.id === playerId);
  if (!player) {
    return null;
  }

  return {
    playerId: player.id,
    playerName: player.name,
    health: player.health,
    resources: [...player.resources],
    zones: {
      hand: cloneArray(player.hand),
      deck: cloneArray(player.deck),
      trash: resolveTrash(player)
    }
  };
}

export function selectPlayerFields(snapshot: GameSnapshot): ReplayPlayerField[] {
  return snapshot.players
    .map((player) => selectPlayerField(snapshot, player.id))
    .filter((field): field is ReplayPlayerField => field !== null);
}
