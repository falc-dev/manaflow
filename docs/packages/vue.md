# @manaflow/vue

Helpers de integracion para Vue sobre el runtime de replay.

## Export clave

- `createVueReplayController(replay, { renderer?, htmlRendererOptions? })`

## API resultante

El controlador Vue expone:

- `frame()`
- `next()`
- `previous()`
- `mount(container)`
- `destroy()`

## Ejemplo

```ts
import { ReplayEngine } from '@manaflow/core';
import { createVueReplayController } from '@manaflow/vue';

const replay = ReplayEngine.fromJson(jsonPayload);
const controller = createVueReplayController(replay);

controller.mount(container);
controller.next();
```

## Notas

- Si no se pasa `renderer`, crea por defecto `HtmlRendererAdapter`.
- Se puede personalizar ese renderer con `htmlRendererOptions`.

## Build

```bash
pnpm --filter @manaflow/vue build
```

## Ejemplos relacionados

- [Vue Controller](/examples/vue-controller)
- [Core Replay](/examples/core-replay)
