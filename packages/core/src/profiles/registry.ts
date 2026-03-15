import type { RulesProfileDefinition, ProfileRegistry as IProfileRegistry } from './types';

class ProfileRegistryImpl implements IProfileRegistry {
  private profiles = new Map<string, RulesProfileDefinition>();

  register(profile: RulesProfileDefinition): void {
    if (this.profiles.has(profile.id)) {
      console.warn(`[ProfileRegistry] Profile "${profile.id}" is already registered. Overwriting.`);
    }
    this.profiles.set(profile.id, profile);
  }

  get(profileId: string): RulesProfileDefinition | undefined {
    return this.profiles.get(profileId);
  }

  list(): RulesProfileDefinition[] {
    return Array.from(this.profiles.values());
  }

  has(profileId: string): boolean {
    return this.profiles.has(profileId);
  }
}

export const profileRegistry: IProfileRegistry = new ProfileRegistryImpl();

export function registerProfile(profile: RulesProfileDefinition): void {
  profileRegistry.register(profile);
}

export function getProfile(profileId: string): RulesProfileDefinition | undefined {
  return profileRegistry.get(profileId);
}

export function listProfiles(): RulesProfileDefinition[] {
  return profileRegistry.list();
}
