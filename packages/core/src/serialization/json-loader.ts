import { ReplayEngine } from '../replay-engine';
import { ReplayValidationError, parseReplayJson } from './validation';

/** JSON loader that validates payloads before creating a `ReplayEngine`. */
export class JsonLoader {
  /** Parses and validates replay JSON. Throws a normalized human-readable error on failure. */
  static loadReplay(jsonString: string): ReplayEngine {
    try {
      const parsed = parseReplayJson(jsonString, { normalizeRiftboundAliases: true });
      return new ReplayEngine(parsed.initialState, parsed.events, {
        formatRef: parsed.formatRef,
        formatOverrides: parsed.formatOverrides
      });
    } catch (error) {
      const message =
        error instanceof ReplayValidationError
          ? error.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')
          : error instanceof Error
            ? error.message
            : String(error);
      throw new Error(`Invalid replay JSON: ${message}`);
    }
  }
}
