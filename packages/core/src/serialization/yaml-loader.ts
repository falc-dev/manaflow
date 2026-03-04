import { ReplayEngine } from '../replay-engine';
import { ReplayValidationError, parseReplayYaml } from './validation';

/** YAML loader that validates payloads before creating a `ReplayEngine`. */
export class YamlLoader {
  /** Parses and validates replay YAML. Throws a normalized human-readable error on failure. */
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
