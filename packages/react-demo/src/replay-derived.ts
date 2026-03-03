import { ReactReplayState } from '@manaflow/react';

interface MovementInfo {
  cardId: string;
  from: string;
  to: string;
}

export interface ScoreboardInfo {
  blue: number;
  red: number;
  target: number;
}

export interface PlayerZones {
  champion: string[];
  mainDeck: string[];
  runeDeck: string[];
  baseRunes: string[];
  trash: string[];
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === 'string');
}

export function pickFirstZone(
  zones: Record<string, string[] | undefined>,
  aliases: readonly string[]
): string[] {
  for (const alias of aliases) {
    const zone = zones[alias];
    if (Array.isArray(zone) && zone.length > 0) {
      return zone;
    }
  }

  for (const alias of aliases) {
    const zone = zones[alias];
    if (Array.isArray(zone)) {
      return zone;
    }
  }

  return [];
}

export function canonicalizeZoneId(zoneId: string): string {
  if (zoneId === 'battlefield_top') return 'battlefield_north';
  if (zoneId === 'battlefield_bot') return 'battlefield_south';
  if (zoneId === 'battlefield_mid') return 'battlefield_south';
  if (zoneId === 'blue_base') return 'champion_blue';
  if (zoneId === 'red_base') return 'champion_red';
  if (zoneId === 'graveyard') return 'trash_blue';
  return zoneId;
}

export function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function getPlayerName(state: ReactReplayState, playerId: string | undefined): string {
  if (!playerId) {
    return 'System';
  }

  return state.frame.snapshot.players.find((player) => player.id === playerId)?.name ?? playerId;
}

function getCardName(state: ReactReplayState, entityId: string | undefined): string {
  if (!entityId) {
    return 'a card';
  }

  const entity = state.frame.snapshot.entities[entityId];
  const card = entity?.components.find((component) => component.componentType === 'CARD')?.metadata as
    | { name?: string }
    | undefined;

  return card?.name ?? entityId;
}

export function getMovement(state: ReactReplayState): MovementInfo | null {
  const payload = toRecord(state.frame.event?.action.payload);
  if (!payload) {
    return null;
  }

  const cardId = payload.cardId;
  const from = payload.from;
  const to = payload.to;

  if (typeof cardId !== 'string' || typeof from !== 'string' || typeof to !== 'string') {
    return null;
  }

  return { cardId, from, to };
}

export function getScoreboard(snapshot: ReactReplayState['frame']['snapshot']): ScoreboardInfo {
  const metadata = toRecord(snapshot.metadata);
  const score = toRecord(metadata?.score);

  return {
    blue: toNumber(score?.blue, 0),
    red: toNumber(score?.red, 0),
    target: toNumber(metadata?.targetScore, 8)
  };
}

export function getBattlefieldControl(snapshot: ReactReplayState['frame']['snapshot']): {
  battlefield_north: string;
  battlefield_south: string;
} {
  const metadata = toRecord(snapshot.metadata);
  const control = toRecord(metadata?.control);

  return {
    battlefield_north:
      typeof control?.battlefield_north === 'string'
        ? control.battlefield_north
        : typeof control?.battlefield_top === 'string'
          ? control.battlefield_top
          : 'neutral',
    battlefield_south:
      typeof control?.battlefield_south === 'string'
        ? control.battlefield_south
        : typeof control?.battlefield_bot === 'string'
          ? control.battlefield_bot
          : typeof control?.battlefield_mid === 'string'
            ? control.battlefield_mid
            : 'neutral'
  };
}

export function getCardType(card: { metadata?: Record<string, unknown> } | undefined): string {
  const cardType = card?.metadata?.cardType;
  return typeof cardType === 'string' ? cardType : 'card';
}

export function getCardFaction(card: { metadata?: Record<string, unknown> } | undefined): string {
  const faction = card?.metadata?.faction;
  return typeof faction === 'string' ? faction : 'neutral';
}

export function getEventExplanation(state: ReactReplayState): { title: string; detail: string } {
  const event = state.frame.event;
  if (!event) {
    return {
      title: 'Quickstart Setup',
      detail:
        'Each player starts with a legend and units, refreshes runes each turn, and races to 8 points by controlling battlefields at end of turn.'
    };
  }

  const actionType = event.action.type;
  const payload = toRecord(event.action.payload) ?? {};
  const movement = getMovement(state);
  const playerName = getPlayerName(state, event.playerId);

  if (actionType === 'DRAW_TO_FOUR') {
    const handSize = toNumber(payload.targetHandSize, 4);
    return {
      title: 'Start Of Turn Draw',
      detail: `${playerName} draws until ${handSize} cards in hand before taking main-phase actions.`
    };
  }

  if (actionType === 'BANK_RUNE') {
    return {
      title: 'Bank Rune',
      detail: `${playerName} adds a rune to the rune row, increasing available resources for this turn.`
    };
  }

  if (actionType === 'DEPLOY_UNIT' && movement) {
    return {
      title: 'Deploy Unit To Battlefield',
      detail: `${playerName} moves ${getCardName(state, movement.cardId)} from ${movement.from} to ${movement.to}.`
    };
  }

  if (actionType === 'CAST_SPELL') {
    const targetId = typeof payload.targetId === 'string' ? payload.targetId : undefined;
    return {
      title: 'Spell Resolves',
      detail: `${playerName} casts ${getCardName(state, typeof payload.cardId === 'string' ? payload.cardId : undefined)} to remove ${getCardName(state, targetId)} and open a lane.`
    };
  }

  if (actionType === 'END_TURN') {
    return {
      title: 'End Turn',
      detail: `${playerName} ends turn and the replay advances to the scoring check for controlled battlefields.`
    };
  }

  if (actionType === 'SCORE_BATTLEFIELDS') {
    const gained = toNumber(payload.pointsGained, 0);
    const fromScore = toNumber(payload.fromScore, 0);
    const toScore = toNumber(payload.toScore, fromScore + gained);
    const battlefields = toStringArray(payload.controlledBattlefields)
      .map((zoneId) => canonicalizeZoneId(zoneId).replace('battlefield_', ''))
      .join(', ');

    return {
      title: 'Score Controlled Battlefields',
      detail: `${playerName} controls ${battlefields || 'active lanes'} and scores +${gained} (${fromScore} -> ${toScore}).`
    };
  }

  if (actionType === 'WIN_GAME') {
    const winnerId = typeof payload.winnerId === 'string' ? payload.winnerId : undefined;
    return {
      title: 'Match End',
      detail: `${getPlayerName(state, winnerId)} reaches the target score and wins the Riftbound match.`
    };
  }

  return {
    title: actionType,
    detail: `Event ${event.id} resolved at timestamp ${event.timestamp}.`
  };
}

export function getFocusZones(state: ReactReplayState): string[] {
  const payload = toRecord(state.frame.event?.action.payload);
  if (!payload) {
    return [];
  }

  const candidateKeys = ['from', 'to', 'targetFrom', 'targetTo'] as const;
  const zones = new Set<string>();

  for (const key of candidateKeys) {
    const value = payload[key];
    if (typeof value === 'string' && value.length > 0) {
      zones.add(value);
    }
  }

  return Array.from(zones);
}

export function getActionGlyph(actionType: string): string {
  if (actionType === 'SETUP') return 'S';
  if (actionType === 'DRAW_TO_FOUR') return 'D';
  if (actionType === 'BANK_RUNE') return 'R';
  if (actionType === 'DEPLOY_UNIT') return 'U';
  if (actionType === 'CAST_SPELL') return 'C';
  if (actionType === 'END_TURN') return 'E';
  if (actionType === 'SCORE_BATTLEFIELDS') return 'P';
  if (actionType === 'WIN_GAME') return 'W';
  return '•';
}

export function getActionTone(actionType: string): string {
  if (actionType === 'DRAW_TO_FOUR') return 'draw';
  if (actionType === 'BANK_RUNE') return 'rune';
  if (actionType === 'DEPLOY_UNIT') return 'unit';
  if (actionType === 'CAST_SPELL') return 'spell';
  if (actionType === 'SCORE_BATTLEFIELDS') return 'score';
  if (actionType === 'WIN_GAME') return 'win';
  return 'neutral';
}

export function getZoneKindLabel(zoneId: string): string {
  if (zoneId.startsWith('battlefield_')) return 'Battlefield';
  if (zoneId.startsWith('champion_')) return 'Base Units';
  if (zoneId.startsWith('runes_')) return 'Runes';
  if (zoneId.startsWith('rune_deck_')) return 'Rune Deck';
  if (zoneId.startsWith('deck_')) return 'Main Deck';
  if (zoneId.startsWith('trash_')) return 'Trash';
  if (zoneId === 'stack') return 'Legend';
  return 'Zone';
}
