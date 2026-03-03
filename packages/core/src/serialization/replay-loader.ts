import { ReplayEngine } from '../replay-engine';
import { JsonLoader } from './json-loader';
import { JsoncLoader } from './jsonc-loader';
import { NdjsonLoader } from './ndjson-loader';
import { YamlLoader } from './yaml-loader';

export type ReplaySerializationFormat = 'json' | 'jsonc' | 'yaml' | 'ndjson';

function detectFormat(payload: string): ReplaySerializationFormat {
  const trimmed = payload.trimStart();

  const nonEmptyLines = payload
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (nonEmptyLines.length >= 2) {
    try {
      const header = JSON.parse(nonEmptyLines[0]) as Record<string, unknown>;
      const firstFrame = JSON.parse(nonEmptyLines[1]) as Record<string, unknown>;
      const hasReplayHeader =
        typeof header === 'object' &&
        header !== null &&
        'schemaVersion' in header &&
        'initialState' in header &&
        !('events' in header);
      const hasFrameShape = typeof firstFrame === 'object' && firstFrame !== null && 'event' in firstFrame && 'snapshot' in firstFrame;

      if (hasReplayHeader && hasFrameShape) {
        return 'ndjson';
      }
    } catch {
      // Not NDJSON; continue with other format checks.
    }
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
