import type { GameFormatProfileZone, GameFormatProfilePlayers, KnownReplayActionType } from '@manaflow/types';
import type { RulesProfileDefinition, ProfileZoneRequirement, ProfilePlayerRequirement } from './types';

export interface ConvertFormatProfileOptions {
  actionCatalog?: readonly KnownReplayActionType[];
  validator?: RulesProfileDefinition['validator'];
}

export function convertFormatProfileToDefinition(
  formatProfile: {
    id: string;
    name?: string;
    description?: string;
    requiredZones?: GameFormatProfileZone[];
    requiredPlayers?: GameFormatProfilePlayers;
  },
  options?: ConvertFormatProfileOptions
): RulesProfileDefinition {
  const requiredZones: ProfileZoneRequirement[] | undefined = formatProfile.requiredZones?.map((z) => ({
    id: z.id,
    ownerId: z.ownerId,
    kind: z.kind
  }));

  const requiredPlayers: ProfilePlayerRequirement | undefined = formatProfile.requiredPlayers
    ? {
        ids: formatProfile.requiredPlayers.ids,
        count: formatProfile.requiredPlayers.count
      }
    : undefined;

  return {
    id: formatProfile.id as string,
    name: formatProfile.name,
    description: formatProfile.description,
    requiredZones,
    requiredPlayers,
    actionCatalog: options?.actionCatalog ?? [],
    validator: options?.validator
  };
}
