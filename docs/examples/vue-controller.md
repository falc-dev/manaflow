# Controlador minimo con @manaflow/vue

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
  <ReplayPlayer :store="store" />
<\/template>`;
</script>

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

## Preview + codigo

<CodePreviewTabs :code="vuePlayerSnippet" language="vue">
  <template #preview>
    <ClientOnly>
      <VueReplayDocDemo />
    </ClientOnly>
  </template>
</CodePreviewTabs>

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
