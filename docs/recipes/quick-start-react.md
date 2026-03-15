# Recipe: Reproductor básico en React

En 3 pasos tienes un reproductor funcional.

## 1. Instala las dependencias

```bash
npm install @manaflow/react @manaflow/core
```

## 2. Prepara tu replay

### Opción A: Genera datos de prueba automáticamente

```ts
import { createDemoReplay, ReplayEngine } from '@manaflow/core';
import { createReactReplayStore } from '@manaflow/react';

const replayData = createDemoReplay({ players: 2, cardsPerHand: 3, turns: 3 });
const store = createReactReplayStore(replayData);
```

### Opción B: Usa el demo incluido

```ts
import { loadDemoReplay } from '@manaflow/react';

const replay = await loadDemoReplay('/demo.replay.json');
```

### Opción C: Carga tu propio archivo

Crea un archivo `replay.json` con el formato de Manaflow:

```json
{
  "schemaVersion": 1,
  "initialState": {
    "id": "mi-partida",
    "players": [
      { "id": "blue", "name": "Blue", "health": 20, "zones": {} },
      { "id": "red", "name": "Red", "health": 20, "zones": {} }
    ],
    "currentPlayer": "blue",
    "turn": 1,
    "currentPhase": "MAIN",
    "entities": {
      "c1": { "id": "c1", "type": "card", "components": [{ "componentType": "CARD", "entityId": "c1", "metadata": { "name": "Dragon", "cost": 5, "rarity": "legendary" } }] }
    },
    "zones": {
      "hand_blue": ["c1"],
      "hand_red": ["c2"],
      "deck_blue": ["c3"],
      "deck_red": ["c4"]
    },
    "metadata": { "rulesProfile": "riftbound-1v1-v1" }
  },
  "events": []
}
```

> **Nota:** El perfil `riftbound-1v1-v1` se registra automáticamente al importar `@manaflow/core`. Para usar tu propio TCG, consulta [Añadir un nuevo TCG](../guide/add-new-tcg.md).

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
