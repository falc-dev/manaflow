import { ReplayEngine } from '../replay-engine';
import { JsonLoader } from './json-loader';
import { JsoncLoader } from './jsonc-loader';
import { NdjsonLoader } from './ndjson-loader';
import { validateReplayNdjson } from './validation';
import { YamlLoader } from './yaml-loader';

export type ReplaySerializationFormat = 'json' | 'jsonc' | 'yaml' | 'ndjson';

function detectFormat(payload: string): ReplaySerializationFormat {
  const trimmed = payload.trimStart();

  const ndjsonProbe = validateReplayNdjson(payload);
  if (ndjsonProbe.ok) {
    return 'ndjson';
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    if (trimmed.includes('//') || trimmed.includes('/*')) {
      return 'jsonc';
    }
    return 'json';
  }

  return 'yaml';
}

export class ReplayLoader {
  static loadReplay(payload: string, format?: ReplaySerializationFormat): ReplayEngine {
    const resolvedFormat = format ?? detectFormat(payload);
    switch (resolvedFormat) {
      case 'json':
        return JsonLoader.loadReplay(payload);
      case 'jsonc':
        return JsoncLoader.loadReplay(payload);
      case 'yaml':
        return YamlLoader.loadReplay(payload);
      case 'ndjson':
        return NdjsonLoader.loadReplay(payload);
      default:
        throw new Error(`Unsupported replay format: ${String(resolvedFormat)}`);
    }
  }
}
