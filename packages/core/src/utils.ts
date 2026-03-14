import { GameAction, GameSnapshot } from '@manaflow/types';

/** Generates a best-effort unique id for runtime entities and snapshots. */
export function generateUUID(prefix = 'entity'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * JSON-based deep clone for replay/state payloads.
 *
 * Note: this is intended for plain serializable objects.
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Creates a default game snapshot scaffold for the provided players. */
export function createInitialState(players: { id: string; name: string }[]): GameSnapshot {
  const firstPlayer = players[0]?.id ?? '';

  return {
    id: generateUUID('game'),
    players: players.map((player) => ({
      id: player.id,
      name: player.name,
      health: 20,
      resources: [{ type: 'MANA', amount: 1, max: 10 }],
      hand: [],
      deck: [],
      discard: [],
      zones: {}
    })),
    currentPhase: 'DRAW',
    currentPlayer: firstPlayer,
    turn: 1,
    entities: {},
    zones: {
      deck: [],
      hand: [],
      board: [],
      graveyard: [],
      stack: []
    },
    metadata: { rulesProfile: 'generic-v1' }
  };
}

/** Creates a timestamped action object with a generic payload map. */
export function createAction(type: string, playerId: string, payload: Record<string, unknown> = {}): GameAction {
  return {
    type,
    playerId,
    payload,
    timestamp: Date.now()
  };
}

export type CompressionFormat = 'gzip' | 'brotli' | 'none';

/**
 * Decompresses payload if it appears to be compressed (gzip/brotli).
 * Works in browser and Node.js 18+ with CompressionStream support.
 */
export async function maybeDecompress(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  if (typeof data === 'string') {
    return data;
  }

  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

  if (bytes.length < 2) {
    throw new Error('Invalid compressed data');
  }

  const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;
  const isBrotli = bytes[0] === 0x00 && bytes[1] === 0x00;

  if (!isGzip && !isBrotli) {
    throw new Error('Unknown compression format');
  }

  const format = isGzip ? 'gzip' : 'br';

  if (typeof CompressionStream === 'undefined') {
    throw new Error('CompressionStream not available in this environment');
  }

  const ds = new DecompressionStream(format);
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();

  const response = new Response(ds.readable);
  const text = await response.text();
  return text;
}

/**
 * Compresses string payload using specified format.
 * Works in browser and Node.js 18+ with CompressionStream support.
 */
export async function compressPayload(payload: string, format: CompressionFormat = 'gzip'): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);

  if (format === 'none') {
    return data;
  }

  if (typeof CompressionStream === 'undefined') {
    throw new Error('CompressionStream not available in this environment');
  }

  const cs = new CompressionStream(format);
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();

  const buffer = await new Response(cs.readable).arrayBuffer();
  return new Uint8Array(buffer);
}
