# @manaflow/react

React-oriented replay helpers for Manaflow.

## Peer dependencies

- `react >= 18`
- `react-dom >= 18`

## Styles

```ts
import '@manaflow/react/styles.css';
```

## Components (customizable)

```tsx
import { ReplayPlayer } from '@manaflow/react';

<ReplayPlayer
  store={store}
  autoplayIntervalMs={700}
  defaultPlaying={false}
  className="replay-player"
  controlsClassName="replay-player__controls"
  viewportClassName="replay-player__viewport"
/>;
```

### Controlled playback mode

```tsx
import { useState } from 'react';
import { ReplayPlayer } from '@manaflow/react';

function ControlledPlayer({ store }) {
  const [playing, setPlaying] = useState(false);

  return (
    <ReplayPlayer
      store={store}
      playing={playing}
      onPlayingChange={setPlaying}
    />
  );
}
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

## Viewport customization (React render)

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
