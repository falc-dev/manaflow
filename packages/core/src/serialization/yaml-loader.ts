import { ReplayEngine } from '../replay-engine';
import { ReplayValidationError, parseReplayYaml } from './validation';

export class YamlLoader {
  static loadReplay(yamlString: string): ReplayEngine {
    try {
      const parsed = parseReplayYaml(yamlString, { normalizeRiftboundAliases: true });
      return new ReplayEngine(parsed.initialState, parsed.events);
    } catch (error) {
      const message =
        error instanceof ReplayValidationError
          ? error.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')
          : error instanceof Error
            ? error.message
            : String(error);
      throw new Error(`Invalid replay YAML: ${message}`);
    }
  }
}
