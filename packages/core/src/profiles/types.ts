import type { GameSnapshot, KnownReplayActionType } from '@manaflow/types';

export interface ProfileValidationIssue {
  path: string;
  message: string;
}

export interface ProfileZoneRequirement {
  id: string;
  ownerId?: string | 'shared';
  kind?: string;
}

export interface ProfilePlayerRequirement {
  ids: string[];
  count?: number;
}

export interface RulesProfileDefinition {
  id: string;
  name?: string;
  description?: string;
  requiredZones?: ProfileZoneRequirement[];
  requiredPlayers?: ProfilePlayerRequirement;
  actionCatalog: readonly KnownReplayActionType[];
  customActions?: readonly string[];
  validator?: (snapshot: GameSnapshot) => ProfileValidationIssue[];
  metadata?: Record<string, unknown>;
}

export interface ProfileRegistry {
  register(profile: RulesProfileDefinition): void;
  get(profileId: string): RulesProfileDefinition | undefined;
  list(): RulesProfileDefinition[];
  has(profileId: string): boolean;
}

export interface ValidateProfileOptions {
  strict?: boolean;
}

export interface ValidateProfileResult {
  ok: boolean;
  issues: ProfileValidationIssue[];
}
