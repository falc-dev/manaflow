# @manaflow/react

React-oriented replay helpers for Manaflow.

## Peer dependencies

- `react >= 18`
- `react-dom >= 18`

## Styles

```ts
import '@manaflow/react/styles.css';
```

## Quick start

```tsx
import { ReplayPlayer, createReactReplayStore } from '@manaflow/react';
import '@manaflow/react/styles.css';

const store = createReactReplayStore(replay);

export function ReplayPage() {
  return <ReplayPlayer store={store} defaultPlaying={false} autoplayIntervalMs={700} />;
}
```

## ReplayPlayer props

```tsx
import type { ReplayPlayerProps } from '@manaflow/react';
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `store` | `ReactReplayStore` | required | Replay store instance created with `createReactReplayStore`. |
| `autoplayIntervalMs` | `number` | `700` | Autoplay interval in milliseconds. |
| `playing` | `boolean` | uncontrolled | Controlled playback state. |
| `defaultPlaying` | `boolean` | `false` | Initial playback state for uncontrolled mode. |
| `onPlayingChange` | `(playing: boolean) => void` | `undefined` | Called when play/pause changes. |
| `className` | `string` | `undefined` | Root container class (`replay-player`). |
| `controlsClassName` | `string` | `undefined` | Extra class for `ReplayControls`. |
| `viewportClassName` | `string` | `undefined` | Extra class for `ReplayViewport`. |
| `viewportCardClassName` | `string` | `undefined` | Extra class for each viewport card. |
| `zones` | `ReplayViewportZoneConfig[]` | built-in zones | Zone list rendered in viewport. |
| `timelineFormatter` | `(snapshot: GameSnapshot) => string` | built-in formatter | Timeline text renderer. |
| `renderCard` | `(context: ReplayViewportCardRenderContext) => ReactNode` | built-in card | Card content renderer override. |
| `renderZoneTitle` | `(context: ReplayViewportZoneTitleRenderContext) => ReactNode` | zone title | Zone title renderer override. |

## ReplayControls props

```tsx
import type { ReplayControlsProps } from '@manaflow/react';
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `state` | `ReactReplayState` | required | Snapshot of replay state (`currentFrame`, `totalFrames`, etc.). |
| `isPlaying` | `boolean` | required | Current playback status for the play button label. |
| `onPrevious` | `() => void` | required | Called when user clicks `Prev`. |
| `onNext` | `() => void` | required | Called when user clicks `Next`. |
| `onTogglePlay` | `() => void` | required | Called when user clicks `Play/Pause`. |
| `onSeek` | `(frame: number) => void` | required | Called when user moves the frame slider. |
| `className` | `string` | `undefined` | Extra class for controls root element. |

## ReplayViewport props

```tsx
import type { ReplayViewportProps } from '@manaflow/react';
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `state` | `ReactReplayState` | required | Replay frame/state to render. |
| `zones` | `ReplayViewportZoneConfig[]` | hand/board/graveyard/deck/stack | Visible zones and labels. |
| `timelineFormatter` | `(snapshot: GameSnapshot) => string` | built-in formatter | Timeline text renderer. |
| `renderCard` | `(context: ReplayViewportCardRenderContext) => ReactNode` | built-in card | Card renderer override. |
| `renderZoneTitle` | `(context: ReplayViewportZoneTitleRenderContext) => ReactNode` | zone title | Zone title renderer override. |
| `className` | `string` | `undefined` | Extra class for viewport root element. |
| `cardClassName` | `string` | `undefined` | Extra class for every card node. |

### Related viewport types

- `ReplayViewportZoneConfig`: `{ id: ZoneId; title: string }`
- `ReplayViewportCardRenderContext`: `{ entityId; snapshot; card }`
- `ReplayViewportZoneTitleRenderContext`: `{ zone; snapshot; entityIds }`

## Mini interactive examples

### 1) Controlled `ReplayPlayer` with external toggles

```tsx
import { useState } from 'react';
import { ReplayPlayer } from '@manaflow/react';

function ControlledPlayer({ store }) {
  const [playing, setPlaying] = useState(false);
  const [intervalMs, setIntervalMs] = useState(700);

  return (
    <>
      <div className="replay-toolbar">
        <button onClick={() => setPlaying((value) => !value)}>
          {playing ? 'Pause from parent' : 'Play from parent'}
        </button>
        <button onClick={() => setIntervalMs((value) => (value === 700 ? 350 : 700))}>
          Toggle speed ({intervalMs}ms)
        </button>
      </div>
      <ReplayPlayer
        store={store}
        playing={playing}
        onPlayingChange={setPlaying}
        autoplayIntervalMs={intervalMs}
      />
    </>
  );
}
```

### 2) Compose `ReplayControls` + `ReplayViewport`

```tsx
import { useState } from 'react';
import { ReplayControls, ReplayViewport, useReplayStore } from '@manaflow/react';

function CustomLayout({ store }) {
  const state = useReplayStore(store);
  const [playing, setPlaying] = useState(false);

  return (
    <section>
      <ReplayControls
        state={state}
        isPlaying={playing}
        onPrevious={() => store.previous()}
        onNext={() => store.next()}
        onTogglePlay={() => setPlaying((value) => !value)}
        onSeek={(frame) => store.seek(frame)}
      />
      <ReplayViewport
        state={state}
        timelineFormatter={(snapshot) => `Turn ${snapshot.turn} · ${snapshot.currentPhase}`}
        renderZoneTitle={({ zone, entityIds }) => `${zone.title} (${entityIds.length})`}
      />
    </section>
  );
}
```

### 3) Viewport customization (cards + zones)

```tsx
import { ReplayPlayer } from '@manaflow/react';

<ReplayPlayer
  store={store}
  timelineFormatter={(snapshot) => `T${snapshot.turn} · ${snapshot.currentPhase}`}
  renderZoneTitle={({ zone, entityIds }) => `${zone.title} (${entityIds.length})`}
  renderCard={({ entityId, card }) => (
    <>
      <strong>{card?.name ?? entityId}</strong>
      <small>Cost {card?.cost ?? '-'}</small>
    </>
  )}
/>;
```

## Store API

```ts
import { createReactReplayStore } from '@manaflow/react';

const store = createReactReplayStore(replayEngine);
const unsubscribe = store.subscribe((state) => {
  console.log(state.currentFrame, state.totalFrames);
});

store.next();
store.seek(0);
unsubscribe();
store.destroy();
```

## Optional external renderer integration

```ts
import { createReactReplayStore } from '@manaflow/react';
import { HtmlRendererAdapter } from '@manaflow/html-visor';

const store = createReactReplayStore(replayEngine, {
  renderer: new HtmlRendererAdapter({
    timelineFormatter: (snapshot) => `T${snapshot.turn} · ${snapshot.currentPhase}`
  })
});
```

`@manaflow/react` no longer creates `HtmlRendererAdapter` by default. Pass a `renderer` explicitly if needed.

## Loading replays

```ts
import { loadDemoReplay } from '@manaflow/react';

const replay = await loadDemoReplay('/replay.demo.json');
```

## Hook (recommended)

```ts
import { useReplayStore } from '@manaflow/react';

const currentFrame = useReplayStore(store, (state) => state.currentFrame);
```

## Hook bridge (`useSyncExternalStore`)

```ts
import { createUseReplayStore } from '@manaflow/react';
import { useSyncExternalStore } from 'react';

const useReplayStore = createUseReplayStore(useSyncExternalStore);
const currentFrame = useReplayStore(store, (state) => state.currentFrame);
```

## Legacy API

`mountReplayDemo(...)` is deprecated and kept only for backwards compatibility.
Use `ReplayPlayer` + `createReactReplayStore` / `useReplayStore` for new code.
