# Primeros pasos

Esta guia te lleva desde cero hasta renderizar tu primer replay y entender el flujo recomendado en Manaflow.

## Requisitos

- Node.js 18 o superior.
- pnpm.

## 1) Instala y arranca el entorno

```bash
pnpm install
pnpm build
pnpm test
pnpm docs:dev
```

Para abrir la demo React local:

```bash
pnpm --filter @manaflow/react-demo dev
```

## 2) Entiende la arquitectura minima

- `@manaflow/core`: carga/validacion/navegacion de replay.
- `@manaflow/replay-runtime`: store/controlador framework-agnostico.
- `@manaflow/react` o `@manaflow/vue`: capa UI para aplicaciones.

Regla practica: modela replay y reglas en `core`; deja el render en los wrappers/visors.

## 3) Carga un replay en `@manaflow/core`

```ts
import { ReplayEngine } from '@manaflow/core';

const replay = ReplayEngine.fromJson(jsonPayload);
replay.stepForward();
const frame = replay.getCurrentFrame();
```

Tambien puedes cargar por formato:

```ts
import { loadReplay } from '@manaflow/core';

const replay = loadReplay(serializedPayload); // autodetect: json/jsonc/yaml/ndjson
```

## 4) Formatos soportados

- JSON: formato canonico recomendado para intercambio/runtime.
- YAML: legible para edicion manual.
- JSONC: JSON con comentarios y trailing commas (util para presets/docs).
- NDJSON: una linea por evento (util para replay grande/streaming).

Para validar antes de renderizar:

```ts
import { validateReplayJson, validateReplayJsonc, validateReplayNdjson, validateReplayYaml } from '@manaflow/core';
```

Cada issue de validacion incluye `path`, `message` y `source`, donde `source` puede ser:
`schema`, `profile`, `json`, `jsonc`, `ndjson` o `yaml`.

## 5) Renderiza rapido en React

```tsx
import { ReplayPlayer, createReactReplayStore } from '@manaflow/react';
import '@manaflow/react/styles.css';

const store = createReactReplayStore(replay);

export function ReplayPage() {
  return <ReplayPlayer store={store} defaultPlaying={false} showTimeline />;
}
```

## 6) Usa presets compartibles de UI (zonas + tema)

Si quieres arrancar con layout base por juego (Riftbound/Magic), revisa:

- [Presets compartibles de zonas y estilos](/examples/ui-presets)

## 7) Siguientes pasos recomendados

- [Guia TCG paso a paso (Riftbound + Magic)](/examples/tcg-replay-step-by-step)
- [React Player](/examples/react-player)
- [@manaflow/core](/packages/core)
- [@manaflow/react](/packages/react)

## Publicacion en GitHub Pages

El workflow `deploy-docs.yml` construye VitePress y publica en GitHub Pages en cada push a `main`.
