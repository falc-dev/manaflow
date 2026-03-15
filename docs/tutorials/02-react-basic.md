# Tutorial: React Básico

En este tutorial aprenderás a integrar un replay en React. Duración: 15 minutos.

> **🎮 Ejemplo interactivo**: Prueba el reproductor en el [Playground](/?example=05-playground)

## Prerequisites

- Completado: [Tutorial 01: Create Replay](01-create-replay.md)
- Conocimiento básico de React

## Lo que vas a construir

Un componente React que muestra un reproductor de replay funcional.

---

## Paso 1: Instala las dependencias

```bash
npm install @manaflow/react @manaflow/core
```

---

## Paso 2: Crea el store

El store gestiona el estado del replay:

```tsx
import { createReactReplayStore } from '@manaflow/react';
import replayData from './mi-replay.json';

const store = createReactReplayStore(replayData);
```

---

## Paso 3: Renderiza el reproductor

```tsx
import { ReplayPlayer } from '@manaflow/react';
import '@manaflow/react/styles.css';

function ReplayPage() {
  return <ReplayPlayer store={store} />;
}
```

---

## Paso 4: Añade controles adicionales

```tsx
<ReplayPlayer 
  store={store} 
  showTimeline 
  autoplayIntervalMs={500}
  playbackRateOptions={[0.5, 1, 2]}
/>
```

### Visual: Componentes del Reproductor

```
┌─────────────────────────────────────────────────────────────────┐
│  REPLAYER                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ CONTROLS                                                │    │
│  │  ◀◀  ▶/❚❚  ▶▶  ═══════●═══════  [0.5x] [1x] [2x]    │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ TIMELINE (showTimeline)                                  │    │
│  │  ●───────●───────●───────●───────●───────●───────●     │    │
│  │  F1     F2     F3     F4     F5     F6     F7            │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ VIEWPORT                                                │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐               │    │
│  │  │  MANO   │  │ TABLERO │  │  MAZO   │               │    │
│  │  │ [carta] │  │ [carta] │  │ [carta] │               │    │
│  │  └─────────┘  └─────────┘  └─────────┘               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Visual: Diferentes Layouts

| Layout | Apariencia |
|--------|------------|
| `stacked` | Zonas apiladas verticalmente |
| `board` | Tablero con zonas enfrentadas |

```
stacked:              board:
┌─────────┐           ┌─────────┐ ┌─────────┐
│  MANO   │           │  MANO    │ │  MANO    │
├─────────┤           │  (p1)    │ │  (p2)    │
│ TABLERO │           ├──────────┤ ├──────────┤
├─────────┤           │ TABLERO  │ │ TABLERO  │
│  MAZO   │           └──────────┘ └──────────┘
└─────────┘
```

### Opciones comunes

| Prop | Descripción |
|------|-------------|
| `showTimeline` | Muestra la línea de tiempo |
| `autoplayIntervalMs` | Velocidad del autoplay (ms) |
| `viewportLayout` | `stacked` o `board` |

---

## Código completo

```tsx
import { createReactReplayStore, ReplayPlayer } from '@manaflow/react';
import '@manaflow/react/styles.css';
import replayData from './mi-replay.json';

const store = createReactReplayStore(replayData);

export function ReplayPage() {
  return (
    <ReplayPlayer 
      store={store} 
      showTimeline 
      autoplayIntervalMs={700}
    />
  );
}
```

---

## Siguiente paso

Ahora que tienes un reproductor básico, aprende a personalizar la UI:

- [Tutorial: UI Personalizada](03-custom-ui.md)

---

## Referencia

- [Recipe: Quick Start React](../recipes/quick-start-react.md)
- [API: ReplayPlayer props](../packages/react.md#replayplayer-props)
