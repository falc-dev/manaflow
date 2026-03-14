export type ZoneId = 'deck' | 'hand' | 'board' | 'graveyard' | 'stack' | (string & {});

export type Phase = 'DRAW' | 'MAIN' | 'COMBAT' | 'END' | (string & {});

export type EntityType = 'card' | 'player' | 'marker' | 'token';

export type ZoneVisibility = 'public' | 'owner' | 'hidden';
export type ZoneKind =
  | 'deck'
  | 'hand'
  | 'board'
  | 'discard'
  | 'resource'
  | 'objective'
  | 'stack'
  | 'attachment'
  | 'limbo'
  | 'custom';

export interface ZoneMeta {
  ownerId?: string | 'shared';
  kind?: ZoneKind;
  visibility?: ZoneVisibility;
  ordered?: boolean;
  capacity?: number;
  label?: string;
  tags?: string[];
}

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
  state?: EntityState;
  metadata?: Record<string, unknown>;
}

export interface EntityState {
  tapped?: boolean;
  exhausted?: boolean;
  damage?: number;
  counters?: Record<string, number>;
  attachedTo?: string;
  attachments?: string[];
  faceDown?: boolean;
  status?: string[];
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
  counters?: Record<string, number>;
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
  focusZones?: ZoneId[];
  actionWindow?: string;
  priorityPlayerId?: string;
}

export interface GameSnapshot {
  id: string;
  players: PlayerState[];
  currentPhase: Phase;
  currentPlayer: string;
  turn: number;
  entities: Record<string, GameEntity>;
  zones: Record<string, string[]>;
  zoneMeta?: Record<string, ZoneMeta>;
  metadata: SnapshotMetadata;
}

export type GameState = GameSnapshot;

export interface GameMatch {
  id: string;
  formatId?: string;
  replay: ReplayData;
  metadata: {
    startedAt: number;
    endedAt?: number;
    duration?: number;
    source?: string;
    title?: string;
    players?: string[];
  };
}

export function createGameMatch(
  replay: ReplayData,
  options: Partial<GameMatch['metadata']> = {}
): GameMatch {
  return {
    id: `match_${Date.now()}`,
    replay,
    metadata: {
      startedAt: Date.now(),
      ...options
    }
  };
}

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

export interface SnapshotPayload extends Record<string, unknown> {}

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
export interface SnapshotAction extends ReplayActionBase<'SNAPSHOT', SnapshotPayload> {}
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
  | SnapshotAction
  | ScoreBattlefieldsAction
  | WinGameAction;

export const KNOWN_REPLAY_ACTION_TYPES = [
  'SNAPSHOT',
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
  SNAPSHOT: SnapshotPayload;
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
  'riftbound-1v1-v1': ['SNAPSHOT', ...KNOWN_REPLAY_ACTION_TYPES]
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

export function createAction<TType extends KnownReplayActionType>(
  type: TType,
  playerId: string,
  payload: ReplayActionPayloadByType[TType]
): ReplayActionBase<TType, ReplayActionPayloadByType[TType]> {
  return {
    type,
    playerId,
    payload,
    timestamp: Date.now()
  };
}

export function createEvent(
  action: GameAction,
  playerId: string,
  options?: { id?: string; tags?: string[]; metadata?: ReplayEventMetadata }
): ReplayEvent {
  return {
    id: options?.id ?? createSnapshotId('event'),
    action,
    timestamp: action.timestamp,
    playerId,
    tags: options?.tags,
    metadata: options?.metadata
  };
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
  formatRef?: ReplayFormatRef;
  formatOverrides?: ReplayFormatOverrides;
  initialState: GameSnapshot;
  events: ReplayFrameInput[];
}

export interface ReplayFrameInput {
  event: ReplayEvent;
  snapshot: GameSnapshot;
}

export interface ReplayFormatRef {
  formatId: string;
  schemaVersion?: 1;
  source?: string;
  checksum?: string;
}

export interface ReplayFormatOverrides {
  name?: string;
  rulesProfile?: string;
  players?: GameFormatPlayers;
  phases?: GameFormatPhase[];
  zones?: Record<string, GameFormatZone>;
  zoneOrder?: string[];
  zoneGroups?: GameFormatZoneGroup[];
  metadata?: Record<string, unknown>;
}

export interface GameFormatPlayers {
  ids: string[];
  count?: number;
  seatOrder?: string[];
  labels?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface GameFormatPhase {
  id: string;
  label?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface GameFormatZone {
  id: string;
  ownerId?: string;
  kind?: 'deck' | 'hand' | 'board' | 'discard' | 'resource' | 'objective' | 'stack' | 'attachment' | 'limbo' | 'custom';
  visibility?: 'public' | 'owner' | 'hidden';
  ordered?: boolean;
  capacity?: number;
  label?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface GameFormatZoneGroup {
  id: string;
  label?: string;
  zoneIds: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface GameFormat {
  schemaVersion: 1;
  formatId: string;
  name?: string;
  rulesProfile: string;
  players: GameFormatPlayers;
  phases: GameFormatPhase[];
  zones: Record<string, GameFormatZone>;
  zoneOrder?: string[];
  zoneGroups?: GameFormatZoneGroup[];
  metadata?: Record<string, unknown>;
}

export interface RendererAdapter {
  mount(container: HTMLElement): void;
  render(snapshot: GameSnapshot): void;
  renderFrame?(frame: ReplayFrame): void;
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

export type { GameMatch };
