# Renderizar un player con @manaflow/react

Ejemplo de `ReplayPlayer` con autoplay, estilos y personalizacion de tarjetas.

## Uso rapido

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

## Props de componentes

### `ReplayPlayer`

| Prop | Tipo | Default | Descripcion |
| --- | --- | --- | --- |
| `store` | `ReactReplayStore` | requerida | Store creado con `createReactReplayStore`. |
| `autoplayIntervalMs` | `number` | `700` | Intervalo de autoplay en milisegundos. |
| `playing` | `boolean` | no controlado | Estado de reproduccion en modo controlado. |
| `defaultPlaying` | `boolean` | `false` | Estado inicial en modo no controlado. |
| `onPlayingChange` | `(playing: boolean) => void` | `undefined` | Callback al cambiar play/pause. |
| `className` | `string` | `undefined` | Clase extra del contenedor principal. |
| `controlsClassName` | `string` | `undefined` | Clase extra para `ReplayControls`. |
| `viewportClassName` | `string` | `undefined` | Clase extra para `ReplayViewport`. |
| `viewportCardClassName` | `string` | `undefined` | Clase extra para cada card del viewport. |
| `zones` | `ReplayViewportZoneConfig[]` | zonas por defecto | Lista de zonas a renderizar. |
| `timelineFormatter` | `(snapshot: GameSnapshot) => string` | formatter por defecto | Texto de timeline personalizado. |
| `renderCard` | `(context: ReplayViewportCardRenderContext) => ReactNode` | renderer por defecto | Render de carta personalizado. |
| `renderZoneTitle` | `(context: ReplayViewportZoneTitleRenderContext) => ReactNode` | titulo por defecto | Render de titulo de zona personalizado. |

### `ReplayControls`

| Prop | Tipo | Default | Descripcion |
| --- | --- | --- | --- |
| `state` | `ReactReplayState` | requerida | Estado actual del replay. |
| `isPlaying` | `boolean` | requerida | Si se muestra `Play` o `Pause`. |
| `onPrevious` | `() => void` | requerida | Handler del boton `Prev`. |
| `onNext` | `() => void` | requerida | Handler del boton `Next`. |
| `onTogglePlay` | `() => void` | requerida | Handler de `Play/Pause`. |
| `onSeek` | `(frame: number) => void` | requerida | Handler del slider de frames. |
| `className` | `string` | `undefined` | Clase extra del root del control. |

### `ReplayViewport`

| Prop | Tipo | Default | Descripcion |
| --- | --- | --- | --- |
| `state` | `ReactReplayState` | requerida | Estado/frame a renderizar. |
| `zones` | `ReplayViewportZoneConfig[]` | hand/board/graveyard/deck/stack | Configuracion de zonas visibles. |
| `timelineFormatter` | `(snapshot: GameSnapshot) => string` | formatter por defecto | Texto de timeline personalizado. |
| `renderCard` | `(context: ReplayViewportCardRenderContext) => ReactNode` | renderer por defecto | Render de carta personalizado. |
| `renderZoneTitle` | `(context: ReplayViewportZoneTitleRenderContext) => ReactNode` | titulo por defecto | Render de titulo de zona personalizado. |
| `className` | `string` | `undefined` | Clase extra del viewport. |
| `cardClassName` | `string` | `undefined` | Clase extra para cada card. |

## Mini ejemplos interactivos

### Modo controlado (play/pause externo + velocidad)

```tsx
import { useState } from 'react';
import { ReplayPlayer } from '@manaflow/react';

export function ControlledReplay({ store }) {
  const [playing, setPlaying] = useState(false);
  const [intervalMs, setIntervalMs] = useState(700);

  return (
    <>
      <div className="replay-toolbar">
        <button onClick={() => setPlaying((value) => !value)}>{playing ? 'Pause' : 'Play'}</button>
        <button onClick={() => setIntervalMs((value) => (value === 700 ? 350 : 700))}>
          Velocidad: {intervalMs}ms
        </button>
      </div>
      <ReplayPlayer
        store={store}
        playing={playing}
        onPlayingChange={setPlaying}
        autoplayIntervalMs={intervalMs}
      />
    </>
  );
}
```

### Composicion de bajo nivel (`ReplayControls` + `ReplayViewport`)

```tsx
import { useState } from 'react';
import { ReplayControls, ReplayViewport, useReplayStore } from '@manaflow/react';

export function CustomReplayLayout({ store }) {
  const state = useReplayStore(store);
  const [playing, setPlaying] = useState(false);

  return (
    <section>
      <ReplayControls
        state={state}
        isPlaying={playing}
        onPrevious={() => store.previous()}
        onNext={() => store.next()}
        onTogglePlay={() => setPlaying((value) => !value)}
        onSeek={(frame) => store.seek(frame)}
      />
      <ReplayViewport
        state={state}
        timelineFormatter={(snapshot) => `T${snapshot.turn} · ${snapshot.currentPhase}`}
        renderZoneTitle={({ zone, entityIds }) => `${zone.title} (${entityIds.length})`}
      />
    </section>
  );
}
```
