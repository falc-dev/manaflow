# @manaflow/vue

<script setup lang="ts">
import CodePreviewTabs from '../.vitepress/components/CodePreviewTabs.vue';
import VueReplayDocDemo from '../.vitepress/components/VueReplayDocDemo.vue';

const vuePlayerSnippet = `<script setup lang="ts">
import { ReplayEngine } from '@manaflow/core';
import { ReplayPlayer, createVueReplayStore } from '@manaflow/vue';
import '@manaflow/vue/styles.css';

const replay = ReplayEngine.fromJson(jsonPayload);
const store = createVueReplayStore(replay);
<\/script>

<template>
  <ReplayPlayer :store="store" :autoplay-interval-ms="900" />
<\/template>`;
</script>

Integracion para Vue con dos capas:

- APIs headless (`controller`, `store`, composable).
- Componentes Vue reutilizables (`ReplayPlayer`, `ReplayControls`, `ReplayViewport`).

## Export clave

- `createVueReplayController(replay, { renderer? })`
- `createVueReplayStore(replay, { renderer? })`
- `useReplayStore(store, selector?)`
- `ReplayPlayer`, `ReplayControls`, `ReplayViewport`

## API resultante

El controlador/store usan `@manaflow/replay-runtime` por debajo:

- `getFrame()`
- `next()`
- `previous()`
- `seek(frame)`
- `render(container)` (si pasas `renderer`)
- `destroy()`
- `subscribe(listener)` (en store)
- `getState()` (en store)

## Ejemplo

```ts
import { ReplayEngine } from '@manaflow/core';
import { createVueReplayStore, ReplayPlayer } from '@manaflow/vue';
import '@manaflow/vue/styles.css';

const replay = ReplayEngine.fromJson(jsonPayload);
const store = createVueReplayStore(replay);

// en un SFC Vue:
// <ReplayPlayer :store="store" />
```

## Ejemplo interactivo

<CodePreviewTabs :code="vuePlayerSnippet" language="vue">
  <template #preview>
    <ClientOnly>
      <VueReplayDocDemo />
    </ClientOnly>
  </template>
</CodePreviewTabs>

## Notas

- `@manaflow/vue` es headless por defecto; no depende de `@manaflow/html-visor`.
- Si quieres renderer imperativo, pasa `renderer` explícitamente (por ejemplo `HtmlRendererAdapter`).

## Build

```bash
pnpm --filter @manaflow/vue build
```

## Ejemplos relacionados

- [Vue Controller](/examples/vue-controller)
- [Core Replay](/examples/core-replay)
