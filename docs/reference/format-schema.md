# Schema del Formato (v1)

Contrato JSON para definir el **formato de juego** fuera del replay (zonas, fases y slots de jugador). Este archivo es la base para el modelo hibrido: el replay referencia el formato y solo trae overrides puntuales.

## Perfiles de Reglas

Manaflow usa un sistema de **perfiles registrables** que define:
- Zonas requeridas
- Jugadores esperados
- Catálogo de acciones permitidas
- Validadores específicos

### Enfoque 1: Perfil embebido en el formato (recomendado)

Define el perfil directamente en el JSON del formato:

```json
{
  "formatId": "mi-juego-v1",
  "rulesProfile": {
    "id": "mi-juego-v1",
    "name": "Mi Juego",
    "requiredZones": [
      { "id": "library" },
      { "id": "hand" },
      { "id": "battlefield" }
    ],
    "requiredPlayers": { "ids": ["blue", "red"], "count": 2 }
  }
}
```

El perfil se registra automáticamente al cargar el formato.

### Enfoque 2: Referencia por string

Si prefieres registrar el perfil en código TypeScript:

```json
{
  "formatId": "mi-juego-v1",
  "rulesProfile": "mi-juego-v1"
}
```

```typescript
import { registerProfile } from '@manaflow/core';

registerProfile({
  id: 'mi-juego-v1',
  requiredZones: [...],
  actionCatalog: ['SNAPSHOT', 'MOVE_ENTITY', 'END_TURN', 'WIN_GAME']
});
```

Ver [Añadir nuevo TCG](../guide/add-new-tcg.md) para crear perfiles custom.

### Perfil por defecto: riftbound-1v1-v1

```json
{
  "formatId": "riftbound-1v1-v1",
  "rulesProfile": "riftbound-1v1-v1"
}
```

## Estructura base

```json
{
  "$schema": "../../schemas/format.schema.json",
  "schemaVersion": 1,
  "formatId": "riftbound-1v1-v1",
  "name": "Riftbound 1v1",
  "rulesProfile": "riftbound-1v1-v1",
  "players": {
    "ids": ["blue", "red"],
    "count": 2,
    "seatOrder": ["blue", "red"],
    "labels": {
      "blue": "Blue",
      "red": "Red"
    }
  },
  "phases": [
    { "id": "DRAW", "label": "Draw" },
    { "id": "MAIN", "label": "Main" },
    { "id": "COMBAT", "label": "Combat" },
    { "id": "END", "label": "End" }
  ],
  "zones": {
    "deck_blue": {
      "id": "deck_blue",
      "ownerId": "blue",
      "kind": "deck",
      "visibility": "owner",
      "ordered": true,
      "label": "Deck (Blue)"
    },
    "battlefield_north": {
      "id": "battlefield_north",
      "ownerId": "shared",
      "kind": "board",
      "visibility": "public",
      "label": "Battlefield North",
      "tags": ["battlefield"]
    }
  },
  "zoneOrder": ["battlefield_north", "deck_blue"],
  "zoneGroups": [
    {
      "id": "battlefields",
      "label": "Battlefields",
      "zoneIds": ["battlefield_north"],
      "tags": ["shared"]
    }
  ]
}
```

Campos obligatorios:

- `schemaVersion`: version estable del contrato (`1`).
- `formatId`: id estable del formato (referenciable por replays).
- `rulesProfile`: perfil de reglas usado por snapshots.
- `players`: slots y orden de jugadores.
- `phases`: fases de turno permitidas en `currentPhase`.
- `zones`: definicion completa de zonas por id.

## Zonas

Cada zona define metadata compartida por todas las partidas del formato:

- `ownerId`: id de jugador o `shared`.
- `kind`: tipo semantico (deck, hand, board, etc.).
- `visibility`: public/owner/hidden.
- `ordered`: si el orden interno importa.
- `capacity`: limite opcional.
- `label`, `tags`, `metadata`: señalizacion adicional.

## Fases

`phases[]` declara el orden y las ids validas para `currentPhase` en snapshots:

- `id`: etiqueta canonica (ej. `DRAW`, `MAIN`).
- `label`: etiqueta friendly opcional.
- `tags`/`metadata`: extensiones de UX o reglas.

## Jugadores

`players` describe los slots del formato:

- `ids`: ids validos esperados en snapshots.
- `seatOrder`: orden sugerido (turnos o layout).
- `labels`: alias de display.

## Notas para el modelo hibrido

- El replay puede incluir `formatRef` para apuntar al formato base.
- `formatOverrides` aplica cambios puntuales sobre el formato base.
- Semantica recomendada:
  - `zones`: merge por id (nuevas zonas o cambios sobre existentes).
  - `players`, `phases`, `zoneOrder`, `zoneGroups`: reemplazo completo si se incluyen.
  - `rulesProfile`: solo si se necesita un override explicito; normalmente vive en el formato.
- El replay sigue llevando `zones` y `zoneMeta` en snapshots; el formato es la fuente canonica para UI/validacion y presets.

## Validacion cruzada (opcional)

En `@manaflow/core` puedes resolver el formato y validar consistencia:

```ts
import { loadReplayWithFormat, resolveReplayFormat, validateReplayFormat, validateGameFormat } from '@manaflow/core';

const resolved = resolveReplayFormat(replay, formatPayload);
const result = validateReplayFormat(replay, formatPayload);
const formatCheck = validateGameFormat(formatPayload);

const loaded = loadReplayWithFormat(replayPayload, formatPayload);
```

## Compatibilidad con zoneMeta

`snapshot.zoneMeta` sigue siendo por-snapshot y no sustituye el formato. Usa `zoneMeta` para overrides de visibilidad o labels puntuales en un frame concreto.

## Ejemplo hibrido (formato + replay)

Formato:

```json
{
  "$schema": "../../schemas/format.schema.json",
  "schemaVersion": 1,
  "formatId": "riftbound-1v1-v1",
  "rulesProfile": "riftbound-1v1-v1",
  "players": { "ids": ["blue", "red"], "count": 2 },
  "phases": [{ "id": "DRAW" }, { "id": "MAIN" }],
  "zones": { "battlefield_north": { "id": "battlefield_north", "ownerId": "shared", "kind": "board" } }
}
```

Replay:

```json
{
  "$schema": "../../schemas/replay.schema.json",
  "schemaVersion": 1,
  "formatRef": { "formatId": "riftbound-1v1-v1" },
  "formatOverrides": { "zones": { "battlefield_mid": { "id": "battlefield_mid", "kind": "board" } } },
  "initialState": { "...snapshot..." },
  "events": []
}
```
