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
- `loadReplayWithFormat(payload, formatPayload, options?)` (replay + formato hibrido)
- `validateReplayPresetCompatibility(replay, preset)` (comprobacion replay vs preset UI)
- `resolveReplayFormat(replay, baseFormat)` (aplica overrides sobre el formato base)
- `validateReplayFormat(replay, baseFormat)` (validacion cruzada opcional)
- `validateGameFormat(formatPayload)` (valida el schema de formato)
- `parseGameFormat(formatPayload)` (lanza error si el formato es invalido)
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

### Replay + formato hibrido

```ts
import { loadReplayWithFormat } from '@manaflow/core';

const { engine, format, formatValidation } = loadReplayWithFormat(replayPayload, formatPayload);
```

Nota: `loadReplayWithFormat` valida el payload de formato (schema) antes de resolver overrides, y lanzara error si es invalido.

## Notas

- `ReplayEngine` soporta `stepForward`, `stepBack` y `seek({ frame | timestamp })`.
- `toReplayData()` serializa el replay al formato v1 y preserva `formatRef`/`formatOverrides` si existen.
- `getFormatRef()` y `getFormatOverrides()` exponen metadata del formato si viene en el replay.
- Para NDJSON, usa: linea 1 = header (`schemaVersion` + `initialState`), lineas siguientes = entradas `{"event", "snapshot"}`.

## Build/Test

```bash
pnpm --filter @manaflow/core build
pnpm --filter @manaflow/core test
```
