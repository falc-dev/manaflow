# PR Summary: Replay-First Monorepo Foundation

## Scope
This PR establishes a replay-first foundation for Manaflow and organizes the monorepo into consistent package boundaries.

## Commits
- `ed49d4a` feat(core): establish canonical types and replay-first engine foundation
- `a2a34a0` feat(visor): add renderer adapters and framework replay controllers
- `fe75e6e` test(core): add replay loader/navigation coverage and project test wiring
- `517a314` chore(repo): ignore local agent instruction folder

## What Changed

### 1. Canonical Domain Model
- Introduced shared, canonical types in `@manaflow/types`:
  - `Card`, `CardInstance`, `ZoneId`, `Phase`
  - `GameSnapshot`, `ReplayEvent`, `ReplayData`, `RendererAdapter`

### 2. Core Replay Engine and Loaders
- Reworked `@manaflow/core` around replay-first flow:
  - Deterministic timeline navigation: `stepForward`, `stepBack`, `seek`
  - Schema-validated replay format v1 (`schemaVersion`, `initialState`, `events`)
  - JSON/YAML loaders with strict validation

### 3. Renderer API + Implementations
- Added a common adapter contract and concrete implementations:
  - `@manaflow/html-visor`
  - `@manaflow/phaser-visor`

### 4. Framework Integration
- Added thin replay controllers for:
  - `@manaflow/react`
  - `@manaflow/vue`

### 5. Supporting Packages
- Added initial reducer scaffold in `@manaflow/game-logic`
- Added webpack plugin scaffold in `@manaflow/webpack-plugin`

### 6. Tests and Tooling
- Added replay/navigation and loader validation tests in `@manaflow/core`
- Added repo-level test wiring and ignored local agent state folder

## Validation Run
All checks passed locally:

```bash
pnpm build
pnpm typecheck
pnpm test
```

## Push/Publish
When network is available:

```bash
git push origin main
```
