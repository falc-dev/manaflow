import { JsonLoader } from './serialization/json-loader';
import { JsoncLoader } from './serialization/jsonc-loader';
import { NdjsonLoader } from './serialization/ndjson-loader';
import { ReplayLoader, ReplaySerializationFormat } from './serialization/replay-loader';
import { YamlLoader } from './serialization/yaml-loader';

export { GameEngine } from './game-engine';
export { ReplayEngine } from './replay-engine';
export { buildReplayDataFromActions, createDemoReplay } from './replay-authoring';
export type { BuildReplayDataFromActionsOptions, CreateDemoReplayOptions, ReplayAuthoringEvent, ReplayReducer } from './replay-authoring';
export { getEntityState, getZoneEntities, getZoneMeta } from './replay-helpers';
export { YamlLoader } from './serialization/yaml-loader';
export { JsonLoader } from './serialization/json-loader';
export { JsoncLoader } from './serialization/jsonc-loader';
export { NdjsonLoader } from './serialization/ndjson-loader';
export { ReplayLoader } from './serialization/replay-loader';
export type { ReplaySerializationFormat } from './serialization/replay-loader';
export {
  ReplayValidationError,
  validateReplayData,
  validateReplayJson,
  validateReplayJsonc,
  validateReplayNdjson,
  validateReplayYaml,
  parseReplayData,
  parseReplayJson,
  parseReplayJsonc,
  parseReplayNdjson,
  parseReplayYaml,
  formatValidationIssues
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
export { loadReplayWithFormat } from './format-loader';
export type { LoadReplayWithFormatOptions, LoadReplayWithFormatResult } from './format-loader';
export {
  collectReplayFormatIssues,
  resolveReplayFormat,
  validateReplayFormat
} from './format';
export {
  parseGameFormat,
  validateGameFormat
} from './serialization/format-validation';
export type {
  FormatValidationError,
  FormatValidationFailure,
  FormatValidationIssue,
  FormatValidationResult,
  FormatValidationSuccess
} from './serialization/format-validation';
export type {
  ReplayFormatIssue,
  ReplayFormatValidationFailure,
  ReplayFormatValidationResult,
  ReplayFormatValidationSuccess
} from './format';
export { createAction, createInitialState, deepClone, generateUUID, maybeDecompress, compressPayload } from './utils';
export type { CompressionFormat } from './utils';

export {
  profileRegistry,
  registerProfile,
  getProfile,
  listProfiles,
  RIFTBOUND_PROFILE
} from './profiles';
export type {
  RulesProfileDefinition,
  ProfileRegistry,
  ProfileValidationIssue,
  ValidateProfileOptions,
  ValidateProfileResult
} from './profiles';

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
  ReplayFormatOverrides,
  ReplayFormatRef,
  GameFormat,
  GameFormatPhase,
  GameFormatPlayers,
  GameFormatZone,
  GameFormatZoneGroup,
  RendererAdapter,
  PlayerState,
  ZoneId,
  Phase
} from '@manaflow/types';
