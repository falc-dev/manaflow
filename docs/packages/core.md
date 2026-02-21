# @manaflow/core

Motor base de juego y replay.

## Para que sirve

- Aplicar acciones sobre snapshots (`GameEngine`)
- Navegar frames deterministas (`ReplayEngine`)
- Cargar replay desde JSON/YAML

## Exports clave

- `GameEngine`
- `ReplayEngine`
- `loadReplayFromJson(json)`
- `loadReplayFromYaml(yaml)`
- `JsonLoader`, `YamlLoader`

## Ejemplo

```ts
import { ReplayEngine } from '@manaflow/core';

const replay = ReplayEngine.fromJson(jsonPayload);

replay.stepForward();
replay.seek({ frame: 2 });
const frame = replay.getCurrentFrame();
```

## Notas

- `ReplayEngine` soporta `stepForward`, `stepBack` y `seek({ frame | timestamp })`.
- `toReplayData()` serializa el replay al formato v1.

## Build/Test

```bash
pnpm --filter @manaflow/core build
pnpm --filter @manaflow/core test
```
