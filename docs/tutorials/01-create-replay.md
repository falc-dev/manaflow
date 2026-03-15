# Tutorial: Crear un Replay Mínimo

En este tutorial crearás tu primer archivo de replay JSON. Duración: 10 minutos.

> **🎮 Ejemplo interactivo**: Prueba el editor JSON en el [Playground](/?example=05-playground) - editable en tiempo real!

## Prerequisites

- Ninguno. Este tutorial cubre todo desde cero.

## Lo que vas a construir

Un archivo JSON que representa una partida mínima de 1v1 con:
- 2 jugadores
- 1 acción (mover una carta)
- Estructura válida para Manaflow

---

## Paso 1: Estructura básica

Crea un archivo llamado `mi-replay.json`:

```json
{
  "schemaVersion": 1,
  "initialState": {
    "id": "partida-001",
    "players": [],
    "currentPhase": "MAIN",
    "currentPlayer": "p1",
    "turn": 1,
    "entities": {},
    "zones": {},
    "metadata": {}
  },
  "events": []
}
```

### Visual: Estructura del replay

```
┌─────────────────────────────────────────┐
│  replay.json                            │
├─────────────────────────────────────────┤
│  schemaVersion: 1                      │
│  ┌─────────────────────────────────┐    │
│  │ initialState                    │    │
│  │   - id                          │    │
│  │   - players                     │    │
│  │   - currentPhase                │    │
│  │   - currentPlayer               │    │
│  │   - turn                        │    │
│  │   - entities                    │    │
│  │   - zones                       │    │
│  │   - metadata                    │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ events[]                        │    │
│  │   [0] event + snapshot          │    │
│  │   [1] event + snapshot          │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

Esta es la **plantilla mínima**. Todos los campos son obligatorios.

---

## Paso 2: Añade jugadores

Edita la sección `players`:

```json
"players": [
  {
    "id": "p1",
    "name": "Jugador 1",
    "health": 20
  },
  {
    "id": "p2", 
    "name": "Jugador 2",
    "health": 20
  }
]
```

---

## Paso 3: Añade zonas

Las zonas son donde están las cartas. Para 1v1 mínimo:

```json
"zones": {
  "hand_p1": ["carta_1"],
  "hand_p2": ["carta_2"],
  "board_p1": [],
  "board_p2": [],
  "deck_p1": ["carta_3"],
  "deck_p2": ["carta_4"]
}
```

::: info Visual: Zonas en el tablero
<div style="display: flex; gap: 16px; flex-wrap: wrap;">
  <DocZoneDemo title="Mano P1" :cards="3" emoji="👤" />
  <DocZoneDemo title="Tablero P1" :cards="2" emoji="⚔️" />
  <DocZoneDemo title="Mazo P1" :cards="5" emoji="📚" />
</div>
:::

Consejo: El prefijo indica el jugador (hand_p1 = mano del jugador 1).

---

## Paso 4: Añade entidades (cartas)

Las entidades son las cartas y objetos del juego:

```json
"entities": {
  "carta_1": {
    "id": "carta_1",
    "type": "card",
    "components": [
      {
        "componentType": "CARD",
        "entityId": "carta_1",
        "metadata": {
          "name": "Dragon Rojo",
          "cost": 5
        }
      }
    ]
  },
  "carta_2": { "...": "otra carta" }
}
```

### Visual: Componente de carta

::: info
<DocCardDemo name="Dragon Rojo" :cost="5" rarity="legendary" type="unit" />
:::

```tsx
// Estructura en código
{
  id: "carta_1",
  type: "card",
  components: [{
    componentType: "CARD",
    entityId: "carta_1",
    metadata: {
      name: "Dragon Rojo",
      cost: 5,
      rarity: "legendary"
    }
  }]
}
```

---

## Paso 5: Añade metadata

El perfil de reglas es obligatorio:

```json
"metadata": {
  "rulesProfile": "basic-1v1-v1"
}
```

---

## Paso 6: Añade el primer evento

Un evento tiene la acción y el resultado:

```json
"events": [
  {
    "event": {
      "id": "evt_1",
      "action": {
        "type": "MOVE_ENTITY",
        "playerId": "p1",
        "payload": {
          "cardId": "carta_1",
          "from": "hand_p1",
          "to": "board_p1"
        },
        "timestamp": 1000
      },
      "timestamp": 1000,
      "playerId": "p1"
    },
    "snapshot": {
      "id": "partida-001",
      "players": [...],
      "currentPhase": "MAIN",
      "currentPlayer": "p1",
      "turn": 1,
      "entities": { ... },
      "zones": {
        "hand_p1": [],
        "hand_p2": ["carta_2"],
        "board_p1": ["carta_1"],
        "board_p2": []
      },
      "metadata": { "rulesProfile": "basic-1v1-v1" }
    }
  }
]
```

### Visual: Flujo de un evento

```
┌─────────────────────────────────────────────────────────────┐
│  BEFORE (initialState)          AFTER (snapshot)           │
│  ┌─────────────────┐          ┌─────────────────┐        │
│  │ hand_p1: [c1]   │  MOVE    │ hand_p1: []      │        │
│  │ board_p1: []    │ ──────►  │ board_p1: [c1]   │        │
│  └─────────────────┘          └─────────────────┘        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ event: { type: "MOVE_ENTITY", playerId: "p1" }    │   │
│  │         { cardId: "c1", from: "hand", to: "board"}│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

Importante: El `snapshot` debe reflejar el estado **después** de aplicar la acción.

---

## Archivo completo

Aquí tienes el ejemplo completo:

```json
{
  "schemaVersion": 1,
  "initialState": {
    "id": "partida-001",
    "players": [
      { "id": "p1", "name": "Jugador 1", "health": 20 },
      { "id": "p2", "name": "Jugador 2", "health": 20 }
    ],
    "currentPhase": "MAIN",
    "currentPlayer": "p1",
    "turn": 1,
    "entities": {
      "carta_1": {
        "id": "carta_1",
        "type": "card",
        "components": [
          { "componentType": "CARD", "entityId": "carta_1", "metadata": { "name": "Dragon Rojo", "cost": 5 } }
        ]
      }
    },
    "zones": {
      "hand_p1": ["carta_1"],
      "hand_p2": [],
      "board_p1": [],
      "board_p2": []
    },
    "metadata": { "rulesProfile": "basic-1v1-v1" }
  },
  "events": []
}
```

---

## Cómo validar tu replay

```ts
import { validateReplayJson } from '@manaflow/core';

const result = validateReplayJson TuJsonString);

if (!result.ok) {
  console.error(result.issues);
}
```

---

## Siguiente paso

Ahora que sabes crear un replay, aprende a visualizarlo en React:

- [Tutorial: React básico](02-react-basic.md)

---

## Referencia

- [Schema del replay](../reference/replay-schema.md)
- [Catálogo de acciones](../reference/action-catalog.md)
