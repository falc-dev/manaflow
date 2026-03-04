import { ReplayEngine } from '../replay-engine';
import { ReplayValidationError, parseReplayJsonc } from './validation';

/** JSONC loader that validates payloads before creating a `ReplayEngine`. */
export class JsoncLoader {
  /** Parses and validates replay JSONC. Throws a normalized human-readable error on failure. */
  static loadReplay(jsoncString: string): ReplayEngine {
    try {
      const parsed = parseReplayJsonc(jsoncString, { normalizeRiftboundAliases: true });
      return new ReplayEngine(parsed.initialState, parsed.events);
    } catch (error) {
      const message =
        error instanceof ReplayValidationError
          ? error.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')
          : error instanceof Error
            ? error.message
            : String(error);
      throw new Error(`Invalid replay JSONC: ${message}`);
    }
  }
}
