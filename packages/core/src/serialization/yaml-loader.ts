import yaml from 'js-yaml';
import { ReplayEngine } from '../replay-engine';
import { ReplaySchema } from './schema';

export class YamlLoader {
  static loadReplay(yamlString: string): ReplayEngine {
    try {
      const rawData = yaml.load(yamlString);
      const parsed = ReplaySchema.parse(rawData);
      return new ReplayEngine(parsed.initialState, parsed.events);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid replay YAML: ${message}`);
    }
  }
}
