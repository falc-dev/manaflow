# @manaflow/react-demo

> **Navegación**: [Inicio](https://manaflow.dev) · [Guía](docs/guide/getting-started.md) · [React](packages/react/README.md)

Executable browser demo that includes progressive examples for `@manaflow/react`, from basic usage to advanced custom UI.

## Progressive examples

1. `01-basic-controls`: `ReplayPlayer` with minimal setup.
2. `02-custom-render`: headless state (`useReplayStore`) + custom `ReplayViewport` rendering.
3. `03-timeline-markers`: timeline markers and autoplay controls.
4. `04-advanced-riftbound`: full Riftbound experience with side panel, guided mode, custom board and score race.

Example selection is available in-app and also by query param:

`/?example=01-basic-controls`
`/?example=02-custom-render`
`/?example=03-timeline-markers`
`/?example=04-advanced-riftbound`

## Advanced layout architecture (example 04)

1. One `demo-dual-playmat` surface renders two playmat grids (top and bottom) without visual rotation.
2. A central battlefield band visualizes contested lanes and control state.
3. `ReplayControls` + `useReplayStore` drive deterministic frame playback.
4. Replay loading/bootstrap uses `useReplayBootstrap` from `@manaflow/react` via `src/hooks/use-demo-replay.ts`.

## Styling

The demo imports default package styles in `src/main.tsx`:

```ts
import '@manaflow/react/styles.css';
```

`src/main.css` contains demo-specific presentation and motion.

## Replay structure (Riftbound 1v1)

See the format guide: [`docs/examples/riftbound-replay-format.md`](../../docs/examples/riftbound-replay-format.md).
Step-by-step build guide for all progressive examples: [`docs/examples/react-demo-step-by-step.md`](../../docs/examples/react-demo-step-by-step.md).

Reusable UI presets (zones + theme) are available at [`public/presets`](./public/presets):
- `riftbound.ui-preset.json` + `riftbound.theme.css`
- `magic.ui-preset.json` + `magic.theme.css`

## Run

```bash
pnpm --filter @manaflow/react-demo dev
```

## Build

```bash
pnpm --filter @manaflow/react-demo build
```
