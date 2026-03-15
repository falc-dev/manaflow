# Añadir un Nuevo TCG a Manaflow

Manaflow usa un sistema de **perfiles registrables** que permite soportar múltiples TCGs de forma agnóstica. Esta guía muestra cómo añadir un nuevo juego.

## Arquitectura de Perfiles

El sistema de perfiles permite definir:

- Zonas requeridas por el juego
- Jugadores esperados
- Catálogo de acciones permitidas
- Validadores específicos del juego

## Pasos para Añadir un Nuevo TCG

### 1. Definir el Perfil

Crea un archivo de perfil en tu proyecto o en Manaflow:

```typescript
import { registerProfile, type RulesProfileDefinition } from '@manaflow/core';

const MY_TCG_PROFILE: RulesProfileDefinition = {
  id: 'my-tcg-v1',
  name: 'My TCG',
  description: 'Custom TCG format',
  
  // Zonas requeridas
  requiredZones: [
    { id: 'library', ownerId: 'shared' },
    { id: 'hand_blue', ownerId: 'blue' },
    { id: 'hand_red', ownerId: 'red' },
    { id: 'battlefield', ownerId: 'shared' },
    { id: 'graveyard', ownerId: 'shared' },
  ],
  
  // Jugadores esperados
  requiredPlayers: {
    ids: ['blue', 'red'],
    count: 2
  },
  
  // Catálogo de acciones
  actionCatalog: [
    'SNAPSHOT',
    'MOVE_ENTITY',
    'DRAW_CARD',
    'PLAY_CARD',
    'END_TURN',
    'WIN_GAME'
  ],
  
  // Validador opcional para reglas específicas
  validator: (snapshot) => {
    const issues = [];
    // Validaciones específicas de tu juego
    return issues;
  }
};

registerProfile(MY_TCG_PROFILE);
```

### 2. Definir el Formato (con perfil embebido)

Ahora puedes definir el perfil directamente en el archivo de formato JSON:

```json
{
  "$schema": "../../schemas/format.schema.json",
  "schemaVersion": 1,
  "formatId": "my-tcg-v1",
  "name": "My TCG 1v1",
  "rulesProfile": {
    "id": "my-tcg-v1",
    "name": "My TCG",
    "description": "Custom TCG format",
    "requiredZones": [
      { "id": "library" },
      { "id": "hand" },
      { "id": "battlefield" },
      { "id": "graveyard" }
    ],
    "requiredPlayers": {
      "ids": ["blue", "red"],
      "count": 2
    }
  },
  "players": {
    "ids": ["blue", "red"],
    "count": 2
  },
  "phases": [
    { "id": "DRAW", "label": "Draw Phase" },
    { "id": "MAIN", "label": "Main Phase" },
    { "id": "END", "label": "End Phase" }
  ],
  "zones": {
    "library": {
      "id": "library",
      "ownerId": "shared",
      "kind": "deck",
      "visibility": "hidden"
    },
    "hand_blue": {
      "id": "hand_blue",
      "ownerId": "blue",
      "kind": "hand",
      "visibility": "owner"
    },
    "battlefield": {
      "id": "battlefield",
      "ownerId": "shared",
      "kind": "board",
      "visibility": "public"
    }
  }
}
```

El perfil se registrará automáticamente al cargar el formato.

### Alternativa: Referencia a perfil existente

Si prefieres mantener el perfil separado, puedes usar una referencia por string:

```json
{
  "rulesProfile": "my-tcg-v1"
}
```

Y registrar el perfil en código TypeScript:
```typescript
import { registerProfile } from '@manaflow/core';

registerProfile({
  id: 'my-tcg-v1',
  name: 'My TCG',
  requiredZones: [...],
  requiredPlayers: { ids: ['blue', 'red'], count: 2 },
  actionCatalog: ['SNAPSHOT', 'MOVE_ENTITY', 'END_TURN', 'WIN_GAME']
});
```

### 3. Crear el Replay

```json
{
  "$schema": "../../schemas/replay.schema.json",
  "schemaVersion": 1,
  "formatRef": { "formatId": "my-tcg-v1" },
  "initialState": {
    "id": "match_1",
    "players": [
      { "id": "blue", "name": "Blue Player", "health": 20, "zones": {} },
      { "id": "red", "name": "Red Player", "health": 20, "zones": {} }
    ],
    "currentPhase": "MAIN",
    "currentPlayer": "blue",
    "turn": 1,
    "entities": {},
    "zones": {
      "library": ["c1", "c2", "c3"],
      "hand_blue": [],
      "hand_red": [],
      "battlefield": []
    },
    "metadata": { "rulesProfile": "my-tcg-v1" }
  },
  "events": []
}
```

## Acciones Disponibles

### Genéricas (siempre disponibles)

| Acción | Descripción |
|--------|-------------|
| `MOVE_ENTITY` | Mover entidad entre zonas |
| `END_TURN` | Finalizar turno |
| `WIN_GAME` | Finalizar partida |
| `SNAPSHOT` | Punto de control |

### Específicas de Riftbound

| Acción | Descripción |
|--------|-------------|
| `DRAW_TO_FOUR` | Robar hasta cuatro cartas |
| `BANK_RUNE` | Depositar rune |
| `DEPLOY_UNIT` | Desplegar unidad |
| `CAST_SPELL` | Lanzar hechizo |
| `SCORE_BATTLEFIELDS` | Puntuación de campos de batalla |

Para nuevos TCGs, usa `MOVE_ENTITY` como acción genérica o define acciones custom.

## Validación

### Validación de Esquema (automática)

```typescript
import { validateReplayJson } from '@manaflow/core';

const result = validateReplayJson(replayJson);
if (!result.ok) {
  console.error(result.issues);
}
```

### Validación de Perfil (opt-in)

```typescript
import { validateReplayProfile } from '@manaflow/core';

try {
  validateReplayProfile(replayData);
  console.log('Perfil válido');
} catch (e) {
  console.error(e.message);
}
```

## Ejemplo: Magic: The Gathering

```typescript
const MTG_STANDARD_PROFILE: RulesProfileDefinition = {
  id: 'mtg-standard-v1',
  name: 'Magic: The Gathering Standard',
  requiredZones: [
    { id: 'library' },
    { id: 'hand' },
    { id: 'battlefield' },
    { id: 'graveyard' },
    { id: 'exile' },
    { id: 'command' }
  ],
  requiredPlayers: { ids: ['player1', 'player2'], count: 2 },
  actionCatalog: [
    'SNAPSHOT',
    'MOVE_ENTITY',
    'END_TURN',
    'WIN_GAME'
  ],
  validator: (snapshot) => {
    const issues = [];
    // Validar que no haya más de 7 cartas en mano
    // Validar tierras por turno
    // etc.
    return issues;
  }
};
```

## Siguientes Pasos

- [Referencia del schema de replay](../reference/replay-schema.md)
- [Referencia del schema de formato](../reference/format-schema.md)
