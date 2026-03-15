# @manaflow/vue

> **Navegación**: [Inicio](https://manaflow.dev) · [Guía](docs/guide/getting-started.md) · [Recipes](docs/recipes/quick-start-vue.md)

Vue 3 composition API helpers for Manaflow.

## Peer dependencies

- `vue >= 3`

## Styles

```ts
import '@manaflow/vue/styles.css';
```

## Quick start

```vue
<template>
  <ReplayPlayer :store="store" show-timeline />
</template>

<script setup lang="ts">
import { createVueReplayStore, ReplayPlayer } from '@manaflow/vue';
import { createDemoReplay } from '@manaflow/core';

const replay = createDemoReplay();
const store = createVueReplayStore(replay);
</script>

<style>
@import '@manaflow/vue/styles.css';
</style>
```

## Components

| Component | Description |
|-----------|-------------|
| `ReplayPlayer` | Full player with controls and viewport |
| `ReplayControls` | Playback controls only |
| `ReplayViewport` | Game state visualization |
| `ReplayTimeline` | Timeline with markers |
| `ReplayOnboardingLegend` | Onboarding legend |
| `ReplayPlayerField` | Single player field |
| `ReplayTable` | Two-player table |
| `ReplayDuelLayout` | Duel layout with center objective |

## Store API

```ts
import { createVueReplayStore, useReplayStore } from '@manaflow/vue';

const store = createVueReplayStore(replayEngine);
const state = useReplayStore(store);

store.next();
store.previous();
store.seek(0);
store.destroy();
```

## Examples

See [Vue quick-start recipe](../recipes/quick-start-vue.md) for full examples.
