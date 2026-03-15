export type {
  ProfileValidationIssue,
  ProfileZoneRequirement,
  ProfilePlayerRequirement,
  RulesProfileDefinition,
  ProfileRegistry,
  ValidateProfileOptions,
  ValidateProfileResult
} from './types';

export { profileRegistry, registerProfile, getProfile, listProfiles } from './registry';
export { RIFTBOUND_PROFILE } from './riftbound';
export { convertFormatProfileToDefinition } from './format-profile';

import { profileRegistry } from './registry';
import { RIFTBOUND_PROFILE } from './riftbound';

profileRegistry.register(RIFTBOUND_PROFILE);
