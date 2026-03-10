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
  resources?: ResourceState[];
  hand: string[];
  deck: string[];
  discard: string[];
  zones: Record<string, string[]>;
  metadata?: Record<string, unknown>;
}

export interface SnapshotMetadata extends Record<string, unknown> {
  rulesProfile: string;
  currentPhase?: string;
}

export interface ReplayEventMetadata extends Record<string, unknown> {
  phase?: string;
  intent?: string;
  summary?: string;
}

export interface GameSnapshot {
  id: string;
  players: PlayerState[];
  currentPlayer: string;
  turn: number;
  entities: Record<string, GameEntity>;
  zones: Record<string, string[]>;
  metadata: SnapshotMetadata;
}

export type GameState = GameSnapshot;

export interface ReplayActionBase<TType extends string, TPayload extends Record<string, unknown>> {
  type: TType;
  playerId: string;
  payload: TPayload;
  timestamp: number;
}

export interface DrawToFourPayload extends Record<string, unknown> {
  cardId: string;
  from: string;
  to: string;
  targetHandSize: number;
}

export interface BankRunePayload extends Record<string, unknown> {
  cardId: string;
  runeId: string;
  from: string;
  to: string;
  resourceDelta: number;
  producedCardId?: string;
}

export interface ZoneMovePayload extends Record<string, unknown> {
  cardId: string;
  from: string;
  to: string;
}

export interface CastSpellPayload extends Record<string, unknown> {
  cardId: string;
  from: string;
  to: string;
  targetId?: string;
  targetFrom?: string;
  targetTo?: string;
}

export interface EndTurnPayload extends Record<string, unknown> {
  reason?: string;
}

export interface ScoreBattlefieldsPayload extends Record<string, unknown> {
  controlledBattlefields: string[];
  pointsGained: number;
  fromScore: number;
  toScore: number;
  targetScore: number;
}

export interface WinGamePayload extends Record<string, unknown> {
  winnerId: string;
  finalScore: Record<string, number>;
  targetScore: number;
}

export interface DrawToFourAction extends ReplayActionBase<'DRAW_TO_FOUR', DrawToFourPayload> {}
export interface BankRuneAction extends ReplayActionBase<'BANK_RUNE', BankRunePayload> {}
export interface DeployUnitAction extends ReplayActionBase<'DEPLOY_UNIT', ZoneMovePayload> {}
export interface MoveEntityAction extends ReplayActionBase<'MOVE_ENTITY', ZoneMovePayload> {}
export interface RepositionUnitAction extends ReplayActionBase<'REPOSITION_UNIT', ZoneMovePayload> {}
export interface RetreatUnitAction extends ReplayActionBase<'RETREAT_UNIT', ZoneMovePayload> {}
export interface CastSpellAction extends ReplayActionBase<'CAST_SPELL', CastSpellPayload> {}
export interface EndTurnAction extends ReplayActionBase<'END_TURN', EndTurnPayload> {}
export interface ScoreBattlefieldsAction
  extends ReplayActionBase<'SCORE_BATTLEFIELDS', ScoreBattlefieldsPayload> {}
export interface WinGameAction extends ReplayActionBase<'WIN_GAME', WinGamePayload> {}

export type KnownReplayAction =
  | DrawToFourAction
  | BankRuneAction
  | DeployUnitAction
  | MoveEntityAction
  | RepositionUnitAction
  | RetreatUnitAction
  | CastSpellAction
  | EndTurnAction
  | ScoreBattlefieldsAction
  | WinGameAction;

export const KNOWN_REPLAY_ACTION_TYPES = [
  'DRAW_TO_FOUR',
  'BANK_RUNE',
  'DEPLOY_UNIT',
  'MOVE_ENTITY',
  'REPOSITION_UNIT',
  'RETREAT_UNIT',
  'CAST_SPELL',
  'END_TURN',
  'SCORE_BATTLEFIELDS',
  'WIN_GAME'
] as const;

export type KnownReplayActionType = (typeof KNOWN_REPLAY_ACTION_TYPES)[number];
export type RulesProfile = 'riftbound-1v1-v1' | (string & {});

export interface ReplayActionPayloadByType {
  DRAW_TO_FOUR: DrawToFourPayload;
  BANK_RUNE: BankRunePayload;
  DEPLOY_UNIT: ZoneMovePayload;
  MOVE_ENTITY: ZoneMovePayload;
  REPOSITION_UNIT: ZoneMovePayload;
  RETREAT_UNIT: ZoneMovePayload;
  CAST_SPELL: CastSpellPayload;
  END_TURN: EndTurnPayload;
  SCORE_BATTLEFIELDS: ScoreBattlefieldsPayload;
  WIN_GAME: WinGamePayload;
}

export const ACTION_CATALOG_BY_PROFILE: Readonly<Record<string, readonly KnownReplayActionType[]>> = {
  'riftbound-1v1-v1': KNOWN_REPLAY_ACTION_TYPES
};

export function getActionCatalog(profile?: RulesProfile): readonly KnownReplayActionType[] {
  if (!profile) {
    return KNOWN_REPLAY_ACTION_TYPES;
  }
  return ACTION_CATALOG_BY_PROFILE[profile] ?? KNOWN_REPLAY_ACTION_TYPES;
}

export type CustomReplayAction = ReplayActionBase<string, Record<string, unknown>> & {
  type: Exclude<string, KnownReplayActionType>;
};

export type ReplayAction = KnownReplayAction | CustomReplayAction;
export type GameAction = ReplayAction;

interface CreateKnownReplayActionInput<TType extends KnownReplayActionType> {
  type: TType;
  playerId: string;
  payload: ReplayActionPayloadByType[TType];
  timestamp?: number;
}

interface CreateCustomReplayActionInput {
  type: string;
  playerId: string;
  payload?: Record<string, unknown>;
  timestamp?: number;
}

export function createReplayAction<TType extends KnownReplayActionType>(
  input: CreateKnownReplayActionInput<TType>
): ReplayActionBase<TType, ReplayActionPayloadByType[TType]>;
export function createReplayAction(input: CreateCustomReplayActionInput): ReplayAction;
export function createReplayAction(input: CreateCustomReplayActionInput): ReplayAction {
  return {
    type: input.type,
    playerId: input.playerId,
    payload: input.payload ?? {},
    timestamp: input.timestamp ?? Date.now()
  } as ReplayAction;
}

export interface ReplayEvent {
  id: string;
  action: GameAction;
  timestamp: number;
  playerId: string;
  tags?: string[];
  metadata?: ReplayEventMetadata;
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
