import { z } from 'zod';

const KNOWN_REPLAY_ACTION_TYPES = [
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

const ResourceSchema = z.object({
  type: z.string(),
  amount: z.number(),
  max: z.number().optional()
});

const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  health: z.number(),
  resources: z.array(ResourceSchema).optional(),
  hand: z.array(z.string()),
  deck: z.array(z.string()),
  discard: z.array(z.string()),
  zones: z.record(z.array(z.string())),
  counters: z.record(z.number()).optional(),
  metadata: z.record(z.unknown()).optional()
});

const GameComponentSchema = z.object({
  componentType: z.string(),
  entityId: z.string(),
  metadata: z.record(z.unknown()).optional()
});

const EntityStateSchema = z
  .object({
    tapped: z.boolean().optional(),
    exhausted: z.boolean().optional(),
    damage: z.number().optional(),
    counters: z.record(z.number()).optional(),
    attachedTo: z.string().optional(),
    attachments: z.array(z.string()).optional(),
    faceDown: z.boolean().optional(),
    status: z.array(z.string()).optional()
  })
  .catchall(z.unknown());

const EntitySchema = z.object({
  id: z.string(),
  type: z.enum(['card', 'player', 'marker', 'token']),
  components: z.array(GameComponentSchema),
  owner: z.string().optional(),
  state: EntityStateSchema.optional(),
  metadata: z.record(z.unknown()).optional()
});

const SnapshotMetadataSchema = z
  .object({
    rulesProfile: z.string(),
    currentPhase: z.string().optional()
  })
  .catchall(z.unknown());

const ReplayEventMetadataSchema = z
  .object({
    phase: z.string().optional(),
    intent: z.string().optional(),
    summary: z.string().optional(),
    focusZones: z.array(z.string()).optional(),
    actionWindow: z.string().optional(),
    priorityPlayerId: z.string().optional()
  })
  .catchall(z.unknown());

const ZoneMetaSchema = z
  .object({
    ownerId: z.string().optional(),
    kind: z
      .enum([
        'deck',
        'hand',
        'board',
        'discard',
        'resource',
        'objective',
        'stack',
        'attachment',
        'limbo',
        'custom'
      ])
      .optional(),
    visibility: z.enum(['public', 'owner', 'hidden']).optional(),
    ordered: z.boolean().optional(),
    capacity: z.number().optional(),
    label: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
  .catchall(z.unknown());

const FormatPlayersSchema = z.object({
  ids: z.array(z.string()),
  count: z.number().optional(),
  seatOrder: z.array(z.string()).optional(),
  labels: z.record(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
});

const FormatPhaseSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
});

const FormatZoneSchema = z.object({
  id: z.string(),
  ownerId: z.string().optional(),
  kind: z
    .enum([
      'deck',
      'hand',
      'board',
      'discard',
      'resource',
      'objective',
      'stack',
      'attachment',
      'limbo',
      'custom'
    ])
    .optional(),
  visibility: z.enum(['public', 'owner', 'hidden']).optional(),
  ordered: z.boolean().optional(),
  capacity: z.number().optional(),
  label: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
});

const FormatZoneGroupSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  zoneIds: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
});

const FormatRefSchema = z.object({
  formatId: z.string(),
  schemaVersion: z.literal(1).optional(),
  source: z.string().optional(),
  checksum: z.string().optional()
});

const FormatOverridesSchema = z.object({
  name: z.string().optional(),
  rulesProfile: z.string().optional(),
  players: FormatPlayersSchema.optional(),
  phases: z.array(FormatPhaseSchema).optional(),
  zones: z.record(FormatZoneSchema).optional(),
  zoneOrder: z.array(z.string()).optional(),
  zoneGroups: z.array(FormatZoneGroupSchema).optional(),
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
  zoneMeta: z.record(ZoneMetaSchema).optional(),
  metadata: SnapshotMetadataSchema
});

const ActionSchema = z.object({
  type: z.string(),
  playerId: z.string(),
  payload: z.record(z.unknown()),
  timestamp: z.number()
});

const ActionPayloadDrawToFourSchema = z
  .object({
    cardId: z.string(),
    from: z.string(),
    to: z.string(),
    targetHandSize: z.number()
  })
  .catchall(z.unknown());

const ActionPayloadBankRuneSchema = z
  .object({
    cardId: z.string(),
    runeId: z.string(),
    from: z.string(),
    to: z.string(),
    resourceDelta: z.number(),
    producedCardId: z.string().optional()
  })
  .catchall(z.unknown());

const ActionPayloadZoneMoveSchema = z
  .object({
    cardId: z.string(),
    from: z.string(),
    to: z.string()
  })
  .catchall(z.unknown());

const ActionPayloadCastSpellSchema = z
  .object({
    cardId: z.string(),
    from: z.string(),
    to: z.string(),
    targetId: z.string().optional(),
    targetFrom: z.string().optional(),
    targetTo: z.string().optional()
  })
  .catchall(z.unknown());

const ActionPayloadEndTurnSchema = z
  .object({
    reason: z.string().optional()
  })
  .catchall(z.unknown());

const ActionPayloadScoreBattlefieldsSchema = z
  .object({
    controlledBattlefields: z.array(z.string()),
    pointsGained: z.number(),
    fromScore: z.number(),
    toScore: z.number(),
    targetScore: z.number()
  })
  .catchall(z.unknown());

const ActionPayloadWinGameSchema = z
  .object({
    winnerId: z.string(),
    finalScore: z.record(z.number()),
    targetScore: z.number()
  })
  .catchall(z.unknown());

const KnownActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('DRAW_TO_FOUR'),
    playerId: z.string(),
    payload: ActionPayloadDrawToFourSchema,
    timestamp: z.number()
  }),
  z.object({
    type: z.literal('BANK_RUNE'),
    playerId: z.string(),
    payload: ActionPayloadBankRuneSchema,
    timestamp: z.number()
  }),
  z.object({
    type: z.literal('DEPLOY_UNIT'),
    playerId: z.string(),
    payload: ActionPayloadZoneMoveSchema,
    timestamp: z.number()
  }),
  z.object({
    type: z.literal('MOVE_ENTITY'),
    playerId: z.string(),
    payload: ActionPayloadZoneMoveSchema,
    timestamp: z.number()
  }),
  z.object({
    type: z.literal('REPOSITION_UNIT'),
    playerId: z.string(),
    payload: ActionPayloadZoneMoveSchema,
    timestamp: z.number()
  }),
  z.object({
    type: z.literal('RETREAT_UNIT'),
    playerId: z.string(),
    payload: ActionPayloadZoneMoveSchema,
    timestamp: z.number()
  }),
  z.object({
    type: z.literal('CAST_SPELL'),
    playerId: z.string(),
    payload: ActionPayloadCastSpellSchema,
    timestamp: z.number()
  }),
  z.object({
    type: z.literal('END_TURN'),
    playerId: z.string(),
    payload: ActionPayloadEndTurnSchema,
    timestamp: z.number()
  }),
  z.object({
    type: z.literal('SCORE_BATTLEFIELDS'),
    playerId: z.string(),
    payload: ActionPayloadScoreBattlefieldsSchema,
    timestamp: z.number()
  }),
  z.object({
    type: z.literal('WIN_GAME'),
    playerId: z.string(),
    payload: ActionPayloadWinGameSchema,
    timestamp: z.number()
  })
]);

const StrictActionSchema = z.union([
  KnownActionSchema,
  z.object({
    type: z
      .string()
      .refine((value) => !KNOWN_REPLAY_ACTION_TYPES.includes(value as (typeof KNOWN_REPLAY_ACTION_TYPES)[number]), {
        message: 'Known action types must match their typed payload contract.'
      }),
    playerId: z.string(),
    payload: z.record(z.unknown()),
    timestamp: z.number()
  })
]);

const ReplayEventSchema = z.object({
  id: z.string(),
  action: ActionSchema,
  timestamp: z.number(),
  playerId: z.string(),
  tags: z.array(z.string()).optional(),
  metadata: ReplayEventMetadataSchema.optional()
});

const ReplayEventStrictSchema = z.object({
  id: z.string(),
  action: StrictActionSchema,
  timestamp: z.number(),
  playerId: z.string(),
  tags: z.array(z.string()).optional(),
  metadata: ReplayEventMetadataSchema.optional()
});

const ReplayFrameInputSchema = z.object({
  event: ReplayEventSchema,
  snapshot: SnapshotSchema
});

const ReplayFrameInputStrictSchema = z.object({
  event: ReplayEventStrictSchema,
  snapshot: SnapshotSchema
});

export const ReplaySchema = z.object({
  schemaVersion: z.literal(1),
  formatRef: FormatRefSchema.optional(),
  formatOverrides: FormatOverridesSchema.optional(),
  initialState: SnapshotSchema,
  events: z.array(ReplayFrameInputSchema)
});

export const ReplaySchemaStrict = z.object({
  schemaVersion: z.literal(1),
  formatRef: FormatRefSchema.optional(),
  formatOverrides: FormatOverridesSchema.optional(),
  initialState: SnapshotSchema,
  events: z.array(ReplayFrameInputStrictSchema)
});

export type ReplaySchemaType = z.infer<typeof ReplaySchema>;
