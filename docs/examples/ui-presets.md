# Presets compartibles de zonas y estilos (Riftbound + Magic)

Este ejemplo propone un formato simple para compartir configuraciones base de UI entre demos, docs y proyectos:

- `*.ui-preset.json`: contrato de zonas/layout/aliases.
- `*.theme.css`: tokens visuales (variables CSS) y clase root.

## Archivos incluidos

- [`./presets/riftbound.ui-preset.json`](./presets/riftbound.ui-preset.json)
- [`./presets/riftbound.theme.css`](./presets/riftbound.theme.css)
- [`./presets/magic.ui-preset.json`](./presets/magic.ui-preset.json)
- [`./presets/magic.theme.css`](./presets/magic.theme.css)

## Contrato recomendado (`*.ui-preset.json`)

```json
{
  "schemaVersion": 1,
  "presetId": "magic-1v1-classic-v1",
  "title": "Magic 1v1 Classic",
  "rulesProfile": "mtg-1v1-v1",
  "viewport": {
    "layout": "board",
    "zones": [{ "id": "stack", "title": "Stack" }]
  },
  "duelLayout": {
    "fieldZoneMap": { "trash": ["discard", "graveyard"] },
    "sharedObjective": { "title": "Battlefields", "zoneIds": ["battlefield_p1", "battlefield_p2"] },
    "table": { "zones": [{ "id": "stack", "title": "Stack" }] }
  },
  "zoneAliases": {
    "deck": ["deck", "library"]
  },
  "styles": {
    "classNames": { "root": "replay-skin-magic" },
    "stylesheet": "./magic.theme.css"
  }
}
```

## Uso rápido en React (`ReplayPlayer`)

```tsx
import { ReplayPlayer } from '@manaflow/react';
import '@manaflow/react/styles.css';
import './magic.theme.css';

const preset = await fetch('/presets/magic.ui-preset.json').then((response) => response.json());

<ReplayPlayer
  store={store}
  viewportLayout={preset.viewport.layout}
  zones={preset.viewport.zones}
  className={preset.styles.classNames.root}
  showTimeline
/>;
```

## Uso rápido en React (`ReplayDuelLayout`)

```tsx
import { ReplayDuelLayout } from '@manaflow/react';

<ReplayDuelLayout
  state={state}
  fieldZoneMap={preset.duelLayout.fieldZoneMap}
  sharedObjectiveProps={preset.duelLayout.sharedObjective}
  tableProps={preset.duelLayout.table}
/>;
```

## Nota de diseño

- Este formato es deliberadamente simple y versionado (`schemaVersion`).
- No reemplaza el schema de replay (`schemaVersion: 1` en el replay). Lo complementa para UI.
- Permite tener presets base por juego (Riftbound/Magic) y evolucionarlos sin romper replays.
