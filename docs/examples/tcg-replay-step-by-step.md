# Guia paso a paso: crear un replay TCG (Riftbound + Magic)

Esta guia enseña un flujo completo para:

1. Modelar un replay con el schema estable de Manaflow (`schemaVersion: 1`).
2. Validarlo.
3. Renderizarlo en React con un visor adecuado para cada juego.

Usaremos dos referencias:

- Riftbound (mismo enfoque que la demo oficial).
- Magic: The Gathering (adaptando zonas y acciones comunes).

## Paso 1: Define el tipo de replay que vas a grabar

Antes de escribir JSON, define:

- Formato de zonas (`zones`).
- Metadatos de reglas (`metadata.rulesProfile`).
- Tipos de accion (`event.action.type`).

Recomendacion:

- Riftbound 1v1: sigue el perfil `riftbound-1v1-v1` de [Formato de replay Riftbound](./riftbound-replay-format).
- Magic: usa un perfil propio (por ejemplo `mtg-1v1-v1`) y manten el mismo schema base.

## Paso 2: Crea el archivo replay JSON base

Plantilla minima:

```json
{
  "schemaVersion": 1,
  "initialState": {
    "id": "my_match_001",
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

## Paso 3: Modela `initialState` para tu TCG

### Riftbound (demo-like)

Usa zonas canónicas del perfil:

- `battlefield_north`, `battlefield_south`
- `champion_blue`, `champion_red`
- `runes_blue`, `runes_red`
- `deck_blue`, `deck_red`
- `trash_blue`, `trash_red`
- `stack`

Y metadata de partida:

```json
{
  "rulesProfile": "riftbound-1v1-v1",
  "battlefieldCount": 2,
  "targetScore": 8,
  "score": { "blue": 0, "red": 0 },
  "control": {
    "battlefield_north": "neutral",
    "battlefield_south": "neutral"
  }
}
```

> **Nota:** El perfil `riftbound-1v1-v1` se registra automáticamente. Si quieres un formato completo con validación, consulta [Formato de replay Riftbound](./riftbound-replay-format).

### Magic: The Gathering (sugerido)

Para Magic, puedes crear un perfil propio y usarlo en el formato:

**1. Crea un perfil en código:**

```typescript
import { registerProfile } from '@manaflow/core';

registerProfile({
  id: 'mtg-1v1-v1',
  name: 'Magic: The Gathering 1v1',
  requiredZones: [
    { id: 'library' },
    { id: 'hand' },
    { id: 'battlefield' },
    { id: 'graveyard' },
    { id: 'exile' },
    { id: 'stack' }
  ],
  requiredPlayers: { ids: ['p1', 'p2'], count: 2 },
  actionCatalog: ['SNAPSHOT', 'MOVE_ENTITY', 'END_TURN', 'WIN_GAME']
});
```

**2. O usa perfil embebido en formato:**

```json
{
  "formatId": "mtg-1v1-v1",
  "rulesProfile": {
    "id": "mtg-1v1-v1",
    "requiredZones": [
      { "id": "library" },
      { "id": "hand" },
      { "id": "battlefield" },
      { "id": "graveyard" }
    ],
    "requiredPlayers": { "ids": ["p1", "p2"], "count": 2 }
  }
}
```

**Zona map sugerido:**

- `library_p1`, `library_p2`
- `hand_p1`, `hand_p2`
- `battlefield_p1`, `battlefield_p2`
- `graveyard_p1`, `graveyard_p2`
- `exile`
- `stack`
- `command` (si Commander)

**Metadata sugerido:**

```json
{
  "rulesProfile": "mtg-1v1-v1",
  "format": "modern",
  "life": { "p1": 20, "p2": 20 }
}
```

## Paso 4: Agrega eventos con snapshots completos

Cada entrada en `events[]` debe incluir:

- `event` (accion resuelta).
- `snapshot` (estado completo despues de resolverla).

Ejemplo Riftbound:

```json
{
  "event": {
    "id": "evt_7",
    "action": {
      "type": "DEPLOY_UNIT",
      "playerId": "blue",
      "payload": {
        "cardId": "blue_sniper",
        "from": "champion_blue",
        "to": "battlefield_north"
      },
      "timestamp": 1710000007000
    },
    "timestamp": 1710000007000,
    "playerId": "blue"
  },
  "snapshot": {
    "...": "estado completo post-evento"
  }
}
```

Ejemplo MTG:

```json
{
  "event": {
    "id": "evt_12",
    "action": {
      "type": "CAST_SPELL",
      "playerId": "p1",
      "payload": {
        "cardId": "lightning_bolt_1",
        "from": "hand_p1",
        "to": "stack",
        "targetId": "creature_p2_4"
      },
      "timestamp": 1710000012000
    },
    "timestamp": 1710000012000,
    "playerId": "p1"
  },
  "snapshot": {
    "...": "estado completo post-evento"
  }
}
```

## Paso 5: Valida el replay antes de renderizar

```ts
import { validateReplayJson } from '@manaflow/react';

const result = validateReplayJson(replayPayload, {
  normalizeRiftboundAliases: true
});

if (!result.ok) {
  console.error(result.issues); // [{ path, message, source }]
}
```

`normalizeRiftboundAliases` te ayuda si aun tienes ids legacy como `battlefield_top`.

## Paso 6: Carga el replay y crea el store React

```tsx
import { useEffect, useMemo, useState } from 'react';
import { ReplayEngine } from '@manaflow/core';
import { createReactReplayStore } from '@manaflow/react';

export function useReplayStoreFromUrl(url: string) {
  const [engine, setEngine] = useState<ReplayEngine | null>(null);

  useEffect(() => {
    fetch(url)
      .then((response) => response.text())
      .then((jsonText) => setEngine(ReplayEngine.fromJson(jsonText)))
      .catch((error) => console.error('Replay load error', error));
  }, [url]);

  return useMemo(
    () => (engine ? createReactReplayStore(engine) : null),
    [engine]
  );
}
```

## Paso 7: Muestra el replay en el visor adecuado

### Riftbound: layout 1v1 tipo playmat (recomendado)

```tsx
import { ReplayDuelLayout, useReplayStore } from '@manaflow/react';

export function RiftboundBoard({ store }) {
  const state = useReplayStore(store);

  return (
    <ReplayDuelLayout
      state={state}
      tableProps={{ zones: [{ id: 'stack', title: 'Stack' }] }}
      sharedObjectiveProps={{
        title: 'Battlefields',
        zoneIds: ['battlefield_north', 'battlefield_south']
      }}
    />
  );
}
```

### Magic: visor general con zonas custom

```tsx
import { ReplayPlayer } from '@manaflow/react';
import '@manaflow/react/styles.css';

const mtgZones = [
  { id: 'battlefield_p1', title: 'Battlefield P1' },
  { id: 'battlefield_p2', title: 'Battlefield P2' },
  { id: 'stack', title: 'Stack' },
  { id: 'graveyard_p1', title: 'Graveyard P1' },
  { id: 'graveyard_p2', title: 'Graveyard P2' },
  { id: 'exile', title: 'Exile' }
] as const;

export function MtgReplayPlayer({ store }) {
  return (
    <ReplayPlayer
      store={store}
      zones={[...mtgZones]}
      showTimeline
      viewportLayout="board"
      timelinePosition="afterViewport"
      timelineFormatter={(snapshot) =>
        `Turn ${snapshot.turn} · ${snapshot.currentPhase} · ${snapshot.currentPlayer}`
      }
    />
  );
}
```

## Checklist final para nuevos usuarios

- El replay sigue `schemaVersion: 1`.
- Cada evento tiene un snapshot completo post-evento.
- Las zonas estan alineadas con las reglas de tu TCG.
- `validateReplayJson` no devuelve errores.
- El visor elegido coincide con tu layout:
  - Riftbound: `ReplayDuelLayout`.
  - MTG u otros TCG: `ReplayPlayer` con `zones` custom o composicion manual.

## Referencias

- [Presets compartibles de zonas y estilos (Riftbound + Magic)](./ui-presets)
- [Formato de replay Riftbound 1v1](./riftbound-replay-format)
- [Renderizar un player con React](./react-player)
- [Documentacion de @manaflow/react-demo](/packages/react-demo)
