import type { GameFormat } from '@manaflow/types';
import { ReplayEngine } from './replay-engine';
import type { ReplaySerializationFormat } from './serialization/replay-loader';
import { detectReplaySerializationFormat } from './serialization/replay-loader';
import type { ReplayValidationOptions } from './serialization/validation';
import { parseReplayJson, parseReplayJsonc, parseReplayNdjson, parseReplayYaml } from './serialization/validation';
import { FormatValidationError, parseGameFormat } from './serialization/format-validation';
import { resolveReplayFormat, validateReplayFormat, type ReplayFormatValidationResult } from './format';
import type { ReplaySchemaType } from './serialization/schema';

export interface LoadReplayWithFormatOptions {
  format?: ReplaySerializationFormat;
  replayValidation?: ReplayValidationOptions;
  /** Defaults to true. When false, only resolves format without validation. */
  validateFormat?: boolean;
}

export interface LoadReplayWithFormatResult {
  engine: ReplayEngine;
  replay: ReplaySchemaType;
  format: GameFormat;
  formatValidation?: ReplayFormatValidationResult;
}

function parseReplayPayload(
  payload: string,
  format: ReplaySerializationFormat,
  options: ReplayValidationOptions
): ReplaySchemaType {
  switch (format) {
    case 'json':
      return parseReplayJson(payload, options);
    case 'jsonc':
      return parseReplayJsonc(payload, options);
    case 'yaml':
      return parseReplayYaml(payload, options);
    case 'ndjson':
      return parseReplayNdjson(payload, options);
    default:
      throw new Error(`Unsupported replay format: ${String(format)}`);
  }
}

export function loadReplayWithFormat(
  payload: string,
  baseFormat: GameFormat,
  options: LoadReplayWithFormatOptions = {}
): LoadReplayWithFormatResult {
  let validatedFormat: GameFormat;
  try {
    validatedFormat = parseGameFormat(baseFormat);
  } catch (error) {
    const message =
      error instanceof FormatValidationError
        ? error.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')
        : error instanceof Error
          ? error.message
          : String(error);
    throw new Error(`Invalid format payload: ${message}`);
  }

  const resolvedFormat = options.format ?? detectReplaySerializationFormat(payload);
  const replayValidation: ReplayValidationOptions = {
    normalizeRiftboundAliases: true,
    ...options.replayValidation
  };

  const replay = parseReplayPayload(payload, resolvedFormat, replayValidation);
  const engine = new ReplayEngine(replay.initialState, replay.events, {
    formatRef: replay.formatRef,
    formatOverrides: replay.formatOverrides
  });

  if (options.validateFormat === false) {
    return {
      engine,
      replay,
      format: resolveReplayFormat(replay, validatedFormat)
    };
  }

  const formatValidation = validateReplayFormat(replay, validatedFormat);
  return {
    engine,
    replay,
    format: formatValidation.format,
    formatValidation
  };
}
