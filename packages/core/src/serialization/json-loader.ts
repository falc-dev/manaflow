import { ReplayEngine } from '../replay-engine';
import { ReplayValidationError, parseReplayJson } from './validation';

export class JsonLoader {
  static loadReplay(jsonString: string): ReplayEngine {
    try {
      const parsed = parseReplayJson(jsonString, { normalizeRiftboundAliases: true });
      return new ReplayEngine(parsed.initialState, parsed.events);
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
