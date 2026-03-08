import { JsonLoader } from './serialization/json-loader';
import { JsoncLoader } from './serialization/jsonc-loader';
import { NdjsonLoader } from './serialization/ndjson-loader';
import { ReplayLoader, ReplaySerializationFormat } from './serialization/replay-loader';
import { YamlLoader } from './serialization/yaml-loader';

export { GameEngine } from './game-engine';
export { ReplayEngine } from './replay-engine';
export { buildReplayDataFromActions } from './replay-authoring';
export type { BuildReplayDataFromActionsOptions, ReplayAuthoringEvent, ReplayReducer } from './replay-authoring';
export { YamlLoader } from './serialization/yaml-loader';
export { JsonLoader } from './serialization/json-loader';
export { JsoncLoader } from './serialization/jsonc-loader';
export { NdjsonLoader } from './serialization/ndjson-loader';
export { ReplayLoader } from './serialization/replay-loader';
export type { ReplaySerializationFormat } from './serialization/replay-loader';
export {
  ReplayValidationError,
  parseReplayData,
  parseReplayJson,
  parseReplayJsonc,
  parseReplayNdjson,
  parseReplayYaml,
  validateReplayData,
  validateReplayJson,
  validateReplayJsonc,
  validateReplayNdjson,
  validateReplayYaml
} from './serialization/validation';
export type {
  ReplayValidationFailure,
  ReplayValidationIssue,
  ReplayValidationOptions,
  ReplayValidationResult,
  ReplayValidationSuccess
} from './serialization/validation';
export { collectReplayProfileIssues, validateReplayProfile } from './serialization/profile-validation';
export { validateReplayPresetCompatibility } from './serialization/preset-validation';
export type {
  ReplayPresetCompatibilityIssue,
  ReplayPresetCompatibilityResult,
  ReplayUiPreset,
  ReplayUiPresetZone
} from './serialization/preset-validation';
export { createAction, createInitialState, deepClone, generateUUID } from './utils';

/** Loads replay data from YAML into a `ReplayEngine`. */
export function loadReplayFromYaml(yaml: string) {
  return YamlLoader.loadReplay(yaml);
}

/** Loads replay data from JSON into a `ReplayEngine`. */
export function loadReplayFromJson(json: string) {
  return JsonLoader.loadReplay(json);
}

/** Loads replay data from JSONC into a `ReplayEngine`. */
export function loadReplayFromJsonc(jsonc: string) {
  return JsoncLoader.loadReplay(jsonc);
}

/** Loads replay data from NDJSON into a `ReplayEngine`. */
export function loadReplayFromNdjson(ndjson: string) {
  return NdjsonLoader.loadReplay(ndjson);
}

/** Loads replay data using explicit or auto-detected serialization format. */
export function loadReplay(payload: string, format?: ReplaySerializationFormat) {
  return ReplayLoader.loadReplay(payload, format);
}

export type {
  Card,
  CardInstance,
  GameAction,
  GameSnapshot,
  GameState,
  ReplayData,
  ReplayEvent,
  ReplayFrame,
  ReplayFrameInput,
  RendererAdapter,
  PlayerState,
  ZoneId,
  Phase
} from '@manaflow/types';
