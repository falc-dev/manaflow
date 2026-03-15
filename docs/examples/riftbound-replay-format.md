# Formato de Replay para Riftbound (1v1)

Este documento define una convencion recomendada para modelar partidas de Riftbound sobre el esquema base de replay de Manaflow.

## Decisión de diseño

- Mantener **estable** el esquema base (`schemaVersion: 1`) de Manaflow.
- Encapsular especificidad de Riftbound en `snapshot.metadata` y en convenciones de `zones`.
- Para 1v1, usar **2 battlefields** como estructura principal.

## Esquema base (obligatorio)

El archivo sigue el formato comun:

```json
{
  "schemaVersion": 1,
  "initialState": { "...GameSnapshot..." },
  "events": [
    {
      "event": { "...ReplayEvent..." },
      "snapshot": { "...GameSnapshot..." }
    }
  ]
}
```

Campos de `GameSnapshot` usados por el runtime:

- `id`
- `players[]`
- `currentPhase`
- `currentPlayer`
- `turn`
- `entities`
- `zones`
- `metadata`

## Perfil recomendado: `riftbound-1v1-v1`

Riftbound viene con un perfil predefinido que se registra automáticamente. Tienes dos opciones:

### Opción 1: Perfil embebido en formato (recomendado)

Crea un archivo de formato:

```json
{
  "$schema": "../../schemas/format.schema.json",
  "schemaVersion": 1,
  "formatId": "riftbound-1v1-v1",
  "name": "Riftbound 1v1",
  "rulesProfile": {
    "id": "riftbound-1v1-v1",
    "name": "Riftbound 1v1",
    "description": "Default profile for Riftbound 1v1 matches",
    "requiredZones": [
      { "id": "battlefield_north" },
      { "id": "battlefield_south" },
      { "id": "champion_blue" },
      { "id": "champion_red" },
      { "id": "deck_blue" },
      { "id": "deck_red" }
    ],
    "requiredPlayers": { "ids": ["blue", "red"], "count": 2 }
  },
  "players": {
    "ids": ["blue", "red"],
    "count": 2
  },
  "phases": [
    { "id": "DRAW", "label": "Draw" },
    { "id": "MAIN", "label": "Main" },
    { "id": "COMBAT", "label": "Combat" },
    { "id": "END", "label": "End" }
  ],
  "zones": {
    "battlefield_north": { "id": "battlefield_north", "ownerId": "shared", "kind": "board" },
    "battlefield_south": { "id": "battlefield_south", "ownerId": "shared", "kind": "board" }
  }
}
```

### Opción 2: Solo referencia en el replay

En el replay, define solo `metadata`:

```json
{
  "rulesProfile": "riftbound-1v1-v1",
  "battlefieldCount": 2,
  "targetScore": 8,
  "score": { "blue": 0, "red": 0 },
  "control": {
    "battlefield_north": "blue",
    "battlefield_south": "red"
  }
}
```

### Convencion de zonas (1v1)

`snapshot.zones` recomendado:

- `battlefield_north`
- `battlefield_south`
- `champion_blue`, `champion_red`
- `runes_blue`, `runes_red`
- `rune_deck_blue`, `rune_deck_red`
- `deck_blue`, `deck_red`
- `trash_blue`, `trash_red`
- `stack`

Nota: puedes mantener alias legacy (`battlefield_top`, `battlefield_bot`, etc.) en UI durante migracion, pero el perfil validado en core exige los ids canonicos anteriores.
En los loaders de core, esos aliases legacy se normalizan automaticamente si usas `JsonLoader`/`YamlLoader` (o `parseReplayJson(..., { normalizeRiftboundAliases: true })`).

## Convencion de eventos (recomendado)

Acciones tipicas:

- `DRAW_TO_FOUR`
- `BANK_RUNE`
- `MOVE_ENTITY` (generica, recomendada para traslados entre zonas)
- `DEPLOY_UNIT`
- `CAST_SPELL`
- `END_TURN`
- `SCORE_BATTLEFIELDS`
- `WIN_GAME`

Payload recomendado para movimientos:

```json
{
  "cardId": "card_123",
  "from": "deck_blue",
  "to": "base_blue"
}
```

`DEPLOY_UNIT` puede mantenerse como alias semantico de despliegue inicial (por ejemplo, desde `hand`), pero para movimientos internos entre zonas se recomienda `MOVE_ENTITY`.

Para resoluciones con objetivo:

```json
{
  "cardId": "spell_1",
  "from": "base_blue",
  "to": "trash_blue",
  "targetId": "unit_9",
  "targetFrom": "battlefield_north",
  "targetTo": "trash_red"
}
```

## Compatibilidad y migración

- No romper `schemaVersion: 1`.
- Mantener `metadata.rulesProfile` en todos los snapshots (obligatorio en validación v1 actual).
- En UI, soportar aliases por un tiempo (`zoneMap`) para no romper replays viejos.

## Validación de esquema y perfil

El proyecto valida replay en dos capas:

1. **Validación de esquema** (`ReplaySchema`): estructura base del replay
2. **Validación de perfil** (`riftbound-1v1-v1`): reglas específicas del juego

El perfil `riftbound-1v1-v1` se registra automáticamente al importar `@manaflow/core`. Si usas el perfil embebido en un formato, se registra automáticamente al cargar.

### Validación automática

Los loaders aplican ambas validaciones automáticamente:

```ts
import { loadReplayWithFormat } from '@manaflow/core';

const result = loadReplayWithFormat(replayJson, formatJson);
```

### Validación manual

```ts
import { validateReplayJson } from '@manaflow/core';

const result = validateReplayJson(replayRaw, { normalizeRiftboundAliases: true });
if (!result.ok) {
  console.error(result.issues);
}
```

### Perfil Riftbound requiere:

- `metadata.battlefieldCount === 2`
- `players` exactamente `blue` y `red`
- `currentPlayer` presente en `players`
- zonas requeridas canónicas (battlefields, champion/deck/runes/rune_deck/trash de ambos jugadores y `stack`)
- `metadata.control.battlefield_north|south` con `blue|red|neutral`
