# @manaflow/replay-runtime

Framework-agnostic replay controller/store runtime for Manaflow.

This package centralizes deterministic replay navigation and subscription logic so UI frameworks can share the same behavior.

## Install / import

```ts
import { createReplayController, createReplayStore } from '@manaflow/replay-runtime';
```

## Controller API

```ts
import { ReplayEngine } from '@manaflow/core';
import { HtmlRendererAdapter } from '@manaflow/html-visor';
import { createReplayController } from '@manaflow/replay-runtime';

const replay = ReplayEngine.fromJson(payload);
const renderer = new HtmlRendererAdapter();
const controller = createReplayController(replay, { renderer });

controller.render(container);
controller.next();
controller.previous();
controller.seek(0);
controller.destroy();
```

## Store API

```ts
import { createReplayStore } from '@manaflow/replay-runtime';

const store = createReplayStore(replay, { renderer });
const unsubscribe = store.subscribe((state) => {
  console.log(state.currentFrame, state.totalFrames);
});

store.next();
unsubscribe();
store.destroy();
```

## Notes

- `renderer` is optional. You can use the runtime as pure replay state/navigation without DOM rendering.
- If `render(container)` is called with a different container, the previous renderer mount is destroyed and remounted.
