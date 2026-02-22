# Controlador minimo con @manaflow/vue

Ejemplo base en Vue usando store + componentes del paquete (sin `html-visor`).

```vue
<script setup lang="ts">
import { ReplayEngine } from '@manaflow/core';
import { ReplayPlayer, createVueReplayStore } from '@manaflow/vue';
import '@manaflow/vue/styles.css';

const replay = ReplayEngine.fromJson(jsonPayload);
const store = createVueReplayStore(replay);
</script>

<template>
  <ReplayPlayer :store="store" />
</template>
```

## Con renderer imperativo opcional (Html Visor)

```ts
import { createVueReplayController } from '@manaflow/vue';
import { HtmlRendererAdapter } from '@manaflow/html-visor';
import '@manaflow/html-visor/styles.css';

const controller = createVueReplayController(replay, {
  renderer: new HtmlRendererAdapter()
});

controller.render(containerElement);
controller.next();
```
