import { z } from 'zod';

const ResourceSchema = z.object({
  type: z.string(),
  amount: z.number(),
  max: z.number().optional()
});

const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  health: z.number(),
  resources: z.array(ResourceSchema),
  hand: z.array(z.string()),
  deck: z.array(z.string()),
  discard: z.array(z.string()),
  zones: z.record(z.array(z.string()))
});

const GameComponentSchema = z.object({
  componentType: z.string(),
  entityId: z.string(),
  metadata: z.record(z.unknown()).optional()
});

const EntitySchema = z.object({
  id: z.string(),
  type: z.enum(['card', 'player', 'marker', 'token']),
  components: z.array(GameComponentSchema),
  owner: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

const SnapshotSchema = z.object({
  id: z.string(),
  players: z.array(PlayerSchema),
  currentPhase: z.string(),
  currentPlayer: z.string(),
  turn: z.number(),
  entities: z.record(EntitySchema),
  zones: z.record(z.array(z.string())),
  metadata: z.record(z.unknown())
});

const ActionSchema = z.object({
  type: z.string(),
  playerId: z.string(),
  payload: z.record(z.unknown()),
  timestamp: z.number()
});

const ReplayEventSchema = z.object({
  id: z.string(),
  action: ActionSchema,
  timestamp: z.number(),
  playerId: z.string(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
});

const ReplayFrameInputSchema = z.object({
  event: ReplayEventSchema,
  snapshot: SnapshotSchema
});

export const ReplaySchema = z.object({
  schemaVersion: z.literal(1),
  initialState: SnapshotSchema,
  events: z.array(ReplayFrameInputSchema)
});

export type ReplaySchemaType = z.infer<typeof ReplaySchema>;
