import { ReplayEngine } from '../replay-engine';
import { ReplayValidationError, parseReplayNdjson } from './validation';

/** NDJSON loader that validates payloads before creating a `ReplayEngine`. */
export class NdjsonLoader {
  /** Parses and validates replay NDJSON. Throws a normalized human-readable error on failure. */
  static loadReplay(ndjsonString: string): ReplayEngine {
    try {
      const parsed = parseReplayNdjson(ndjsonString, { normalizeRiftboundAliases: true });
      return new ReplayEngine(parsed.initialState, parsed.events);
    } catch (error) {
      const message =
        error instanceof ReplayValidationError
          ? error.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')
          : error instanceof Error
            ? error.message
            : String(error);
      throw new Error(`Invalid replay NDJSON: ${message}`);
    }
  }
}
