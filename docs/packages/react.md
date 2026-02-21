# @manaflow/react

Capa React para consumir replay runtime y renderizar componentes reutilizables.

## Peer dependencies

- `react >= 18`
- `react-dom >= 18`

## Exports clave

- Estado/control: `createReactReplayController`, `createReactReplayStore`
- Hooks: `useReplayStore`, `createUseReplayStore`
- Componentes: `ReplayPlayer`, `ReplayControls`, `ReplayViewport`
- Utilidades: `loadDemoReplay`
- Legacy: `mountReplayDemo` (deprecado)

## Uso rapido

```tsx
import { ReplayPlayer, createReactReplayStore } from '@manaflow/react';
import '@manaflow/react/styles.css';

const store = createReactReplayStore(replay);

<ReplayPlayer store={store} defaultPlaying={false} autoplayIntervalMs={700} />;
```

## Modo controlado

```tsx
import { useState } from 'react';
import { ReplayPlayer } from '@manaflow/react';

function ControlledPlayer({ store }) {
  const [playing, setPlaying] = useState(false);
  return <ReplayPlayer store={store} playing={playing} onPlayingChange={setPlaying} />;
}
```

## Personalizacion de viewport

```tsx
<ReplayPlayer
  store={store}
  timelineFormatter={(snapshot) => `T${snapshot.turn} · ${snapshot.currentPhase}`}
  renderZoneTitle={({ zone, entityIds }) => `${zone.title} (${entityIds.length})`}
  renderCard={({ card, entityId }) => <strong>{card?.name ?? entityId}</strong>}
/>;
```

## Build/Test

```bash
pnpm --filter @manaflow/react build
pnpm --filter @manaflow/react test
```
