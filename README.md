# Manaflow

Manaflow is a replay-first TCG engine and viewer monorepo.

## Packages

- `@manaflow/types`: Canonical domain model (`Card`, `CardInstance`, `GameSnapshot`, `ReplayEvent`, `RendererAdapter`).
- `@manaflow/core`: Game/replay runtime (`GameEngine`, `ReplayEngine`, YAML/JSON loaders).
- `@manaflow/html-visor`: HTML renderer adapter implementing `RendererAdapter`.
- `@manaflow/phaser-visor`: Phaser-oriented renderer adapter implementing `RendererAdapter`.
- `@manaflow/react`: Thin replay controller helpers for React integrations.
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

## Commands

```bash
pnpm build
pnpm typecheck
pnpm test
```

## Notes

- The source of truth for game/replay contracts is `packages/types/src/index.ts`.
- `ReplayEngine` supports deterministic `stepForward`, `stepBack`, and `seek({ frame | timestamp })`.
- HTML and Phaser renderers consume immutable snapshots and do not mutate game state.
