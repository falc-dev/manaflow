# Usar store agnostico con @manaflow/replay-runtime

`createReplayStore` simplifica subscripcion de estado y comandos de navegacion.

```ts
import { ReplayEngine } from '@manaflow/core';
import { createReplayStore } from '@manaflow/replay-runtime';

const replay = ReplayEngine.fromJson(jsonPayload);
const store = createReplayStore(replay);

const unsubscribe = store.subscribe((state) => {
  console.log('frame', state.currentFrame, '/', state.totalFrames - 1);
  console.log('canStepBack', state.canStepBack);
  console.log('canStepForward', state.canStepForward);
});

store.next();
store.next();
store.seek(0);

unsubscribe();
store.destroy();
```

## Con renderer opcional

```ts
import { HtmlRendererAdapter } from '@manaflow/html-visor';

const renderer = new HtmlRendererAdapter();
const store = createReplayStore(replay, { renderer });

store.render(containerElement);
store.next();
```
