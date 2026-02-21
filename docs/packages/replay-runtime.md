# @manaflow/replay-runtime

Controlador/store agnostico de framework para navegar replays.

## Para que sirve

Unifica la logica de navegacion y subscripcion para React, Vue u otros UIs.

## Exports clave

- `createReplayController(replay, { renderer? })`
- `createReplayStore(replay, { renderer? })`
- Tipos: `ReplayController`, `ReplayStore`, `ReplayStoreState`

## Controller

```ts
import { createReplayController } from '@manaflow/replay-runtime';

const controller = createReplayController(replay, { renderer });
controller.render(container);
controller.next();
controller.previous();
controller.seek(0);
controller.destroy();
```

## Store

```ts
import { createReplayStore } from '@manaflow/replay-runtime';

const store = createReplayStore(replay, { renderer });
const unsubscribe = store.subscribe((state) => {
  console.log(state.currentFrame, state.totalFrames);
});

store.next();
unsubscribe();
```

## Build/Test

```bash
pnpm --filter @manaflow/replay-runtime build
pnpm --filter @manaflow/replay-runtime test
```

## Ejemplos relacionados

- [Runtime Store](/examples/runtime-store)
- [Core Replay](/examples/core-replay)
