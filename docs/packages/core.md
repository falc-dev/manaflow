# @manaflow/core

Motor base de juego y replay.

## Para que sirve

- Aplicar acciones sobre snapshots (`GameEngine`)
- Navegar frames deterministas (`ReplayEngine`)
- Cargar replay desde JSON/YAML/JSONC/NDJSON

## Exports clave

- `GameEngine`
- `ReplayEngine`
- `loadReplayFromJson(json)`
- `loadReplayFromJsonc(jsonc)`
- `loadReplayFromNdjson(ndjson)`
- `loadReplayFromYaml(yaml)`
- `loadReplay(payload, format?)` (autodetect)
- `validateReplayPresetCompatibility(replay, preset)` (comprobacion replay vs preset UI)
- `JsonLoader`, `JsoncLoader`, `NdjsonLoader`, `YamlLoader`, `ReplayLoader`

## Ejemplo

```ts
import { ReplayEngine } from '@manaflow/core';

const replay = ReplayEngine.fromJson(jsonPayload);

// JSONC (comentarios + trailing commas)
const replayFromJsonc = ReplayEngine.fromJsonc(jsoncPayload);

// NDJSON (header + frames por linea)
const replayFromNdjson = ReplayEngine.fromNdjson(ndjsonPayload);

// Autodetect
const replayAuto = ReplayEngine.fromSerialized(serializedPayload);

replay.stepForward();
replay.seek({ frame: 2 });
const frame = replay.getCurrentFrame();
```

## Notas

- `ReplayEngine` soporta `stepForward`, `stepBack` y `seek({ frame | timestamp })`.
- `toReplayData()` serializa el replay al formato v1.
- Para NDJSON, usa: linea 1 = header (`schemaVersion` + `initialState`), lineas siguientes = entradas `{"event", "snapshot"}`.

## Build/Test

```bash
pnpm --filter @manaflow/core build
pnpm --filter @manaflow/core test
```
