# Controlador minimo con @manaflow/vue

Ejemplo basico para montar replay en una app Vue usando el controlador del paquete.

```ts
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { ReplayEngine } from '@manaflow/core';
import { createVueReplayController } from '@manaflow/vue';

const containerRef = ref<HTMLElement | null>(null);
const replay = ReplayEngine.fromJson(jsonPayload);
const controller = createVueReplayController(replay);

onMounted(() => {
  if (containerRef.value) {
    controller.mount(containerRef.value);
  }
});

function next() {
  controller.next();
}

function previous() {
  controller.previous();
}

onBeforeUnmount(() => {
  controller.destroy();
});
```

## Con opciones del renderer HTML por defecto

```ts
const controller = createVueReplayController(replay, {
  htmlRendererOptions: {
    timelineFormatter: (snapshot) => `T${snapshot.turn} · ${snapshot.currentPhase}`
  }
});
```
