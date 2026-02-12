export type ZoneId = 'deck' | 'hand' | 'board' | 'graveyard' | 'stack' | (string & {});

export type Phase = 'DRAW' | 'MAIN' | 'COMBAT' | 'END' | (string & {});

export type EntityType = 'card' | 'player' | 'marker' | 'token';

export interface ResourceState {
  type: string;
  amount: number;
  max?: number;
}

export interface Card {
  id: string;
  name: string;
  description: string;
  cost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface CardInstance {
  id: string;
  cardId: string;
  ownerId: string;
  controllerId: string;
  tapped?: boolean;
  counters?: Record<string, number>;
  metadata?: Record<string, unknown>;
}

export interface GameComponent {
  componentType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export interface GameEntity {
  id: string;
  type: EntityType;
  components: GameComponent[];
  owner?: string;
  metadata?: Record<string, unknown>;
}

export interface PlayerState {
  id: string;
  name: string;
  health: number;
  resources: ResourceState[];
  hand: string[];
  deck: string[];
  discard: string[];
  zones: Record<string, string[]>;
}

export interface GameSnapshot {
  id: string;
  players: PlayerState[];
  currentPhase: Phase;
  currentPlayer: string;
  turn: number;
  entities: Record<string, GameEntity>;
  zones: Record<string, string[]>;
  metadata: Record<string, unknown>;
}

export type GameState = GameSnapshot;

export interface GameAction {
  type: string;
  playerId: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface ReplayEvent {
  id: string;
  action: GameAction;
  timestamp: number;
  playerId: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ReplayFrame {
  index: number;
  event?: ReplayEvent;
  snapshot: GameSnapshot;
}

export interface ReplayData {
  schemaVersion: 1;
  initialState: GameSnapshot;
  events: ReplayFrameInput[];
}

export interface ReplayFrameInput {
  event: ReplayEvent;
  snapshot: GameSnapshot;
}

export interface RendererAdapter {
  mount(container: HTMLElement): void;
  render(snapshot: GameSnapshot): void;
  highlight(eventId?: string): void;
  destroy(): void;
}

export function createCardComponent(
  entityId: string,
  data: Pick<Card, 'name' | 'cost' | 'rarity'>
): GameComponent {
  return {
    componentType: 'CARD',
    entityId,
    metadata: data
  };
}

export function createSnapshotId(prefix = 'snapshot'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
