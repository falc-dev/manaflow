# Tutorial: Formatos Multiplayer (2v2, 3v3, NvN)

En este tutorial aprenderás a estructurar replays para más de 2 jugadores.

## Prerequisites

- Completado: [Tutorial 01: Create Replay](../01-create-replay.md)
- Entender conceptos de zonas y entidades

## Lo que vas a aprender

- Estructurar zonas para 2v2
- Manejar equipos
- Configurar zonas compartidas
- Usar el layout correcto en React

---

## Formatos Soportados

Manaflow soporta:
- **1v1**: 2 jugadores
- **2v2**: 4 jugadores (2 equipos)
- **3v3**: 6 jugadores (2 equipos)
- **NvN**: N jugadores (equipos variables)

---

## Paso 1: Zonas para 2v2

### Estructura de equipos

Define jugadores con un identificador de equipo:

```json
{
  "players": [
    { "id": "p1", "name": "Equipo A - Jugador 1", "health": 20 },
    { "id": "p2", "name": "Equipo A - Jugador 2", "health": 20 },
    { "id": "p3", "name": "Equipo B - Jugador 1", "health": 20 },
    { "id": "p4", "name": "Equipo B - Jugador 2", "health": 20 }
  ]
}
```

### Zonas por jugador

```json
{
  "zones": {
    "hand_p1": [],
    "hand_p2": [],
    "hand_p3": [],
    "hand_p4": [],
    "board_p1": [],
    "board_p2": [],
    "board_p3": [],
    "board_p4": [],
    "deck_p1": [],
    "deck_p2": [],
    "deck_p3": [],
    "deck_p4": [],
    "shared_center": []
  }
}
```

### Zonas compartidas

Para objetivos o zonas centrales usa `shared`:

```json
{
  "zones": {
    "objective_team_a": {
      "ownerId": "team_a"
    },
    "objective_team_b": {
      "ownerId": "team_b"
    },
    "shared_center": {
      "ownerId": "shared"
    }
  }
}
```

---

## Paso 2: Visibilidad de Zonas

### Tipos de visibilidad

| Tipo | Descripción |
|------|-------------|
| `public` | Visible para todos |
| `owner` | Visible solo para el propietario |
| `hidden` | Oculta para todos |

### Ejemplo con visibilidad

```json
{
  "zones": {
    "hand_p1": {
      "visibility": "owner"
    },
    "board_team_a": {
      "visibility": "public"
    }
  }
}
```

En el snapshot, puedes sobrescribir visibilidad por frame:

```json
{
  "zoneMeta": {
    "hand_p1": {
      "visibility": "owner",
      "ownerId": "p1"
    }
  }
}
```

---

## Paso 3: Metadata para Equipos

### Score por equipo

```json
{
  "metadata": {
    "rulesProfile": "team-2v2-v1",
    "score": {
      "team_a": 5,
      "team_b": 3
    },
    "teams": {
      "team_a": ["p1", "p2"],
      "team_b": ["p3", "p4"]
    }
  }
}
```

---

## Paso 4: Acciones en Contexto de Equipo

### Mover carta entre zonas de equipo

```json
{
  "type": "MOVE_ENTITY",
  "playerId": "p1",
  "payload": {
    "cardId": "carta_1",
    "from": "hand_p1",
    "to": "board_team_a"
  }
}
```

### Acciones de equipo

```json
{
  "type": "SCORE_TEAM_OBJECTIVE",
  "playerId": "p1",
  "payload": {
    "teamId": "team_a",
    "objectiveZone": "objective_team_a",
    "points": 1
  }
}
```

---

## Paso 5: Visualización en React

### Usar ReplayDuelLayout

Para 2v2, usa el layout de mesa compartida:

```tsx
import { ReplayDuelLayout } from '@manaflow/react';

function TeamReplay({ store }) {
  return (
    <ReplayDuelLayout
      store={store}
      sharedObjectiveProps={{
        title: 'Objetivo Central',
        zoneIds: ['shared_center']
      }}
      tableProps={{
        zones: [
          { id: 'board_team_a', title: 'Tablero Equipo A' },
          { id: 'board_team_b', title: 'Tablero Equipo B' }
        ]
      }}
    />
  );
}
```

### Zones por jugador

```tsx
import { ReplayPlayerField } from '@manaflow/react';

function PlayerHand({ store, playerId }) {
  return (
    <ReplayPlayerField
      state={useReplayStore(store)}
      field={selectPlayerField(snapshot, playerId)}
    />
  );
}
```

---

## Ejemplo Completo 2v2

```json
{
  "schemaVersion": 1,
  "initialState": {
    "id": "match-2v2-001",
    "players": [
      { "id": "p1", "name": "Equipo A - J1", "health": 20 },
      { "id": "p2", "name": "Equipo A - J2", "health": 20 },
      { "id": "p3", "name": "Equipo B - J1", "health": 20 },
      { "id": "p4", "name": "Equipo B - J2", "health": 20 }
    ],
    "currentPhase": "MAIN",
    "currentPlayer": "p1",
    "turn": 1,
    "entities": {},
    "zones": {
      "hand_p1": ["c1"],
      "hand_p2": ["c2"],
      "hand_p3": ["c3"],
      "hand_p4": ["c4"],
      "board_team_a": [],
      "board_team_b": [],
      "shared_center": ["obj_1"]
    },
    "metadata": {
      "rulesProfile": "team-2v2-v1",
      "teams": {
        "team_a": ["p1", "p2"],
        "team_b": ["p3", "p4"]
      }
    }
  },
  "events": []
}
```

---

## Siguiente paso

- [Reference: Action Catalog](../reference/action-catalog.md) - Lista completa de acciones
- [Reference: Format Schema](../reference/format-schema.md) - Esquema de formato

---

## Patterns Comunes

### 3v3

```json
{
  "players": [
    { "id": "p1", "name": "Team A - 1" },
    { "id": "p2", "name": "Team A - 2" },
    { "id": "p3", "name": "Team A - 3" },
    { "id": "p4", "name": "Team B - 1" },
    { "id": "p5", "name": "Team B - 2" },
    { "id": "p6", "name": "Team B - 3" }
  ]
}
```

### Free-for-all (todos contra todos)

```json
{
  "metadata": {
    "gameType": "ffa",
    "playersRemaining": ["p1", "p2", "p3", "p4"]
  }
}
```
