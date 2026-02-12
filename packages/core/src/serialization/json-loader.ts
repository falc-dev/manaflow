import { ReplayEngine } from '../replay-engine';
import { ReplaySchema } from './schema';

export class JsonLoader {
  static loadReplay(jsonString: string): ReplayEngine {
    try {
      const parsedJson = JSON.parse(jsonString);
      const parsed = ReplaySchema.parse(parsedJson);
      return new ReplayEngine(parsed.initialState, parsed.events);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid replay JSON: ${message}`);
    }
  }
}
