# Manaflow

Manaflow es una librería para visualizar repeticiones de juegos de cartas (TCGs). En 30 segundos puedes tener un reproductor funcional.

## Quick start

```bash
npm install @manaflow/react @manaflow/core
```

```tsx
import { ReplayPlayer, createReactReplayStore } from '@manaflow/react';
import '@manaflow/react/styles.css';
import replayData from './mi-replay.json';

const store = createReactReplayStore(replayData);

<ReplayPlayer store={store} />
```

**[Ver demo interactiva](https://manaflow.dev/demo)** · **[Guía de inicio](docs/guide/getting-started.md)** · **[Ejemplos](docs/examples/index.md)**

---

## Paquetes

- `@manaflow/types`: Canonical domain model (`Card`, `CardInstance`, `GameSnapshot`, `ReplayEvent`, `RendererAdapter`).
- `@manaflow/core`: Game/replay runtime (`GameEngine`, `ReplayEngine`, YAML/JSON loaders).
- `@manaflow/replay-runtime`: Framework-agnostic replay controller/store runtime.
- `@manaflow/html-visor`: HTML renderer adapter implementing `RendererAdapter`.
- `@manaflow/phaser-visor`: Phaser-oriented renderer adapter implementing `RendererAdapter`.
- `@manaflow/react`: Thin replay controller helpers for React integrations.
- `@manaflow/react-demo`: Executable browser demo for replay controls.
- `@manaflow/vue`: Thin replay controller helpers for Vue integrations.
- `@manaflow/game-logic`: Shared reducer helpers for rules/action processing.
- `@manaflow/webpack-plugin`: Build-time integration plugin scaffold.

## Replay format (v1)

```json
{
  "schemaVersion": 1,
  "initialState": { "...": "GameSnapshot" },
  "events": [
    {
      "event": { "id": "event_1", "action": { "...": "GameAction" }, "timestamp": 1000, "playerId": "player1" },
      "snapshot": { "...": "GameSnapshot" }
    }
  ]
}
```

## Arquitectura

```
[Replay JSON] → ReplayEngine → ReplayStore → [React/Vue] → Visor → UI
                      ↓                                    ↓
               [GameSnapshot]                    [ReplayPlayer/Viewport]
```

## Comandos

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm docs:dev
pnpm docs:build
```

## Notes

- The source of truth for game/replay contracts is `packages/types/src/index.ts`.
- `ReplayEngine` supports deterministic `stepForward`, `stepBack`, and `seek({ frame | timestamp })`.
- HTML and Phaser renderers consume immutable snapshots and do not mutate game state.
- Documentation is built with VitePress from `docs/` and deployed via `.github/workflows/deploy-docs.yml`.
