# Renderizar un player con @manaflow/react

Ejemplo de `ReplayPlayer` con autoplay, estilos y personalizacion de tarjetas.

```tsx
import { ReplayPlayer, createReactReplayStore } from '@manaflow/react';
import '@manaflow/react/styles.css';

const store = createReactReplayStore(replay);

export function ReplayPage() {
  return (
    <ReplayPlayer
      store={store}
      autoplayIntervalMs={600}
      defaultPlaying={false}
      timelineFormatter={(snapshot) =>
        `Turn ${snapshot.turn} · ${snapshot.currentPhase} · ${snapshot.currentPlayer}`
      }
      renderCard={({ card, entityId }) => (
        <>
          <strong>{card?.name ?? entityId}</strong>
          <small>Cost {card?.cost ?? '-'}</small>
        </>
      )}
      renderZoneTitle={({ zone, entityIds }) => `${zone.title} (${entityIds.length})`}
    />
  );
}
```

## Modo controlado (play/pause externo)

```tsx
import { useState } from 'react';
import { ReplayPlayer } from '@manaflow/react';

export function ControlledReplay({ store }) {
  const [playing, setPlaying] = useState(false);

  return (
    <ReplayPlayer
      store={store}
      playing={playing}
      onPlayingChange={setPlaying}
    />
  );
}
```
