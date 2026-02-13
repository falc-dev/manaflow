# @manaflow/react

React-oriented replay helpers for Manaflow.

## Peer dependencies

- `react >= 18`
- `react-dom >= 18`

## Components (customizable)

```tsx
import { ReplayPlayer } from '@manaflow/react';

<ReplayPlayer
  store={store}
  autoplayIntervalMs={700}
  className="replay-player"
  controlsClassName="replay-player__controls"
  viewportClassName="replay-player__viewport"
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
