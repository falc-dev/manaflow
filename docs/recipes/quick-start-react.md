# Recipe: Reproductor básico en React

En 3 pasos tienes un reproductor funcional.

## 1. Instala las dependencias

```bash
npm install @manaflow/react @manaflow/core
```

## 2. Prepara tu replay

Crea un archivo `replay.json` con el formato de Manaflow:

```json
{
  "schemaVersion": 1,
  "initialState": {
    "id": "mi-partida",
    "players": [
      { "id": "p1", "name": "Jugador 1", "health": 20, "hand": ["c1"], "deck": ["c2"], "discard": [] },
      { "id": "p2", "name": "Jugador 2", "health": 20, "hand": ["c3"], "deck": ["c4"], "discard": [] }
    ],
    "currentPlayer": "p1",
    "turn": 1,
    "entities": {
      "c1": { "id": "c1", "type": "card", "components": [{ "componentType": "CARD", "entityId": "c1", "metadata": { "name": "Dragon", "cost": 5 } }] }
    },
    "zones": { "hand_p1": ["c1"], "hand_p2": ["c3"], "deck_p1": ["c2"], "deck_p2": ["c4"] }
  },
  "events": []
}
```

O usa el demo incluido:

```ts
import { loadDemoReplay } from '@manaflow/react';

const replay = await loadDemoReplay('/demo.replay.json');
```

## 3. Renderiza el reproductor

```tsx
import { ReplayPlayer, createReactReplayStore } from '@manaflow/react';
import '@manaflow/react/styles.css';
import replayData from './replay.json';

const store = createReactReplayStore(replayData);

export function App() {
  return <ReplayPlayer store={store} />;
}
```

## Opciones comunes

| Propósito | Código |
|-----------|--------|
| Con timeline | `<ReplayPlayer store={store} showTimeline />` |
| Velocidad inicial | `<ReplayPlayer store={store} autoplayIntervalMs={500} />` |
| Layout de tablero | `<ReplayPlayer store={store} viewportLayout="board" />` |

## Siguiente paso

- [Personalizar cartas](custom-card-render.md)
- [Personalizar zonas](custom-zones.md)
