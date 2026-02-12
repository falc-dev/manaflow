import { JsonLoader } from './serialization/json-loader';
import { YamlLoader } from './serialization/yaml-loader';

export { GameEngine } from './game-engine';
export { ReplayEngine } from './replay-engine';
export { YamlLoader } from './serialization/yaml-loader';
export { JsonLoader } from './serialization/json-loader';
export { createAction, createInitialState, deepClone, generateUUID } from './utils';

export function loadReplayFromYaml(yaml: string) {
  return YamlLoader.loadReplay(yaml);
}

export function loadReplayFromJson(json: string) {
  return JsonLoader.loadReplay(json);
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
