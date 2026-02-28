# @manaflow/react-demo

Executable browser demo that replays a Riftbound-style match using `@manaflow/react` headless store + UI components.

## What this demo showcases

- Quickstart-inspired match flow: draw to four, bank runes, deploy units, end-turn battlefield scoring.
- Two stacked playmats (top/bottom) plus a shared battlefield band for 1v1.
- Official-skin visual tokens via optional `replay-skin-official` class.
- Guided vs detailed visual mode toggle for onboarding.
- Controlled playback with `ReplayControls` + `useReplayStore`.
- `useReplayStore` for frame-by-frame rule explanations and scoreboard updates.
- `ReplayTimeline` + `buildReplayMarkers` for direct frame navigation.
- Custom zone and card rendering (`renderZoneTitle`, `renderCard`) including battlefield control chips.
- Score race metadata (`targetScore`, lane control state) rendered in a side panel.
- Replay validation on load with field-level issues surfaced in UI when JSON is invalid.

## Layout architecture

1. One `demo-dual-playmat` surface renders two playmat grids (top and bottom) without visual rotation.
2. A central battlefield band visualizes contested lanes and control state.
3. `ReplayControls` + `useReplayStore` drive deterministic frame playback.

## Styling

The demo imports default package styles in `src/main.tsx`:

```ts
import '@manaflow/react/styles.css';
```

`src/main.css` contains demo-specific presentation and motion.

## Replay structure (Riftbound 1v1)

See the format guide: [`docs/examples/riftbound-replay-format.md`](../../docs/examples/riftbound-replay-format.md).

## Run

```bash
pnpm --filter @manaflow/react-demo dev
```

## Build

```bash
pnpm --filter @manaflow/react-demo build
```
