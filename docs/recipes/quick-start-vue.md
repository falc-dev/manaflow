# Recipe: Reproductor básico en Vue

En 3 pasos tienes un reproductor funcional.

## 1. Instala las dependencias

```bash
npm install @manaflow/vue @manaflow/core
```

## 2. Prepara tu replay

### Opción A: Genera datos de prueba automáticamente

```ts
import { createDemoReplay } from '@manaflow/core';
import { createVueReplayStore } from '@manaflow/vue';

const replayData = createDemoReplay({ players: 2, cardsPerHand: 3, turns: 3 });
const store = createVueReplayStore(replayData);
```

### Opción B: Carga tu propio archivo

```ts
import { ReplayEngine } from '@manaflow/core';
import { createVueReplayStore } from '@manaflow/vue';

const response = await fetch('/mi-replay.json');
const json = await response.json();
const replay = ReplayEngine.fromJson(JSON.stringify(json));
const store = createVueReplayStore(replay);
```

## 3. Renderiza el reproductor

```vue
<template>
  <ReplayPlayer 
    :store="store" 
    :show-timeline="true"
    :viewport-layout="'board'"
  />
</template>

<script setup lang="ts">
import { createVueReplayStore, ReplayPlayer } from '@manaflow/vue';
import { createDemoReplay } from '@manaflow/core';

const replayData = createDemoReplay({ players: 2, cardsPerHand: 3, turns: 3 });
const store = createVueReplayStore(replayData);
</script>

<style>
@import '@manaflow/vue/styles.css';
</style>
```

## Opciones comunes

| Propósito | Código |
|-----------|--------|
| Con timeline | `<ReplayPlayer :store="store" :show-timeline="true" />` |
| Velocidad inicial | `<ReplayPlayer :store="store" :autoplay-interval-ms="500" />` |
| Layout de tablero | `<ReplayPlayer :store="store" :viewport-layout="'board'" />` |
| Controlado | `<ReplayPlayer :store="store" :playing="isPlaying" @playing-change="setPlaying" />` |

## Componentes disponibles

| Componente | Descripción |
|------------|-------------|
| `ReplayPlayer` | Reproductor completo con controles |
| `ReplayControls` | Solo controles de reproducción |
| `ReplayViewport` | Solo visualización del estado |
| `ReplayTimeline` | Timeline con marcadores |
| `ReplayPlayerField` | Campo de un jugador |
| `ReplayTable` | Mesa completa para 2 jugadores |
| `ReplayDuelLayout` | Layout de duelo con zona central |
| `ReplayOnboardingLegend` | Leyenda de onboarding |

## Ejemplo con componentes sueltos

```vue
<template>
  <div class="mi-reproductor">
    <ReplayControls
      :state="state"
      :is-playing="playing"
      :playback-rate="rate"
      :playback-rate-options="[0.5, 1, 2]"
      @previous="store.previous()"
      @next="store.next()"
      @toggle-play="togglePlay"
      @seek="store.seek($event)"
      @playback-rate-change="rate = $event"
    />
    <ReplayTimeline
      :state="state"
      :markers="markers"
      @seek="store.seek($event)"
    />
    <ReplayViewport
      :state="state"
      :timeline-formatter="formatTimeline"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { createVueReplayStore, useReplayStore, ReplayControls, ReplayTimeline, ReplayViewport, buildReplayMarkers } from '@manaflow/vue';
import { createDemoReplay } from '@manaflow/core';

const replayData = createDemoReplay();
const store = createVueReplayStore(replayData);
const state = useReplayStore(store);

const playing = ref(false);
const rate = ref(1);

const markers = computed(() => buildReplayMarkers(replayData.events ?? []));

const formatTimeline = (snapshot: any) => `Turn ${snapshot.turn} · ${snapshot.currentPhase}`;

const togglePlay = () => { playing.value = !playing.value };
</script>
```

## Siguiente paso

- [Personalizar cartas](custom-card-render.md)
- [Personalizar zonas](custom-zones.md)
- [Ejemplo completo de Vue](examples/vue-controller.md)
