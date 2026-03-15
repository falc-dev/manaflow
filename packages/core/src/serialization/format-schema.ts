import { z } from 'zod';

const FormatPlayersSchema = z.object({
  ids: z.array(z.string()).min(1),
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
  zoneIds: z.array(z.string()).min(1),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
});

const RulesProfileZoneSchema = z.object({
  id: z.string(),
  ownerId: z.string().optional(),
  kind: z.string().optional()
});

const RulesProfilePlayersSchema = z.object({
  ids: z.array(z.string()).min(1),
  count: z.number().optional()
});

const RulesProfileInlineSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  requiredZones: z.array(RulesProfileZoneSchema).optional(),
  requiredPlayers: RulesProfilePlayersSchema.optional()
});

export const GameFormatSchema = z
  .object({
    schemaVersion: z.literal(1),
    formatId: z.string(),
    name: z.string().optional(),
    rulesProfile: z.union([z.string(), RulesProfileInlineSchema]),
    players: FormatPlayersSchema,
    phases: z.array(FormatPhaseSchema).min(1),
    zones: z.record(FormatZoneSchema),
    zoneOrder: z.array(z.string()).optional(),
    zoneGroups: z.array(FormatZoneGroupSchema).optional(),
    metadata: z.record(z.unknown()).optional()
  })
  .superRefine((format, ctx) => {
    if (format.players.count !== undefined && format.players.count !== format.players.ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['players', 'count'],
        message: 'players.count must match players.ids.length.'
      });
    }

    for (const [zoneId, zone] of Object.entries(format.zones)) {
      if (zone.id !== zoneId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['zones', zoneId, 'id'],
          message: `zone id must match map key (${zoneId}).`
        });
      }
    }
  });

export type GameFormatSchemaType = z.infer<typeof GameFormatSchema>;
