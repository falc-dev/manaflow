# @manaflow/react-demo

Executable browser demo for replay controls built with `@manaflow/react` components.

## What this demo showcases

- Controlled `ReplayPlayer` playback (`playing` / `onPlayingChange`)
- `useReplayStore` to render frame-by-frame explanations
- Custom card + zone rendering via `renderCard` / `renderZoneTitle`
- Transition-focused replay events:
  - `hand -> board` (`PLAY_CARD`)
  - `deck -> hand` (`DRAW_CARD`)
  - `board -> graveyard` (`DESTROY_CARD`)

## Styling

The demo imports the default React package styles in `src/main.tsx`:

```ts
import '@manaflow/react/styles.css';
```

`src/main.css` is only used for demo-shell layout and page-level presentation.

## Run

```bash
pnpm --filter @manaflow/react-demo dev
```

## Build

```bash
pnpm --filter @manaflow/react-demo build
```
