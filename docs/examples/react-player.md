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

## Timeline por frame reutilizable

```tsx
import { ReplayTimeline, buildReplayMarkers, useReplayStore } from '@manaflow/react';

export function ReplayTimelinePanel({ store, replayPayload }) {
  const state = useReplayStore(store);
  const markers = buildReplayMarkers(replayPayload.events ?? []);

  return <ReplayTimeline state={state} markers={markers} onSeek={(frame) => store.seek(frame)} />;
}
```

Tambien puedes integrarla directamente dentro de `ReplayPlayer`:

```tsx
import { ReplayPlayer, buildReplayMarkers } from '@manaflow/react';

const markers = buildReplayMarkers(replayPayload.events ?? []);

<ReplayPlayer
  store={store}
  showTimeline
  timelineMarkers={markers}
  viewportLayout="board"
  timelinePosition="afterViewport"
  timelineAriaLabel="Frames del replay"
  timelineFramePrefix="Frame "
/>;
```

Para layouts top-vs-bottom por jugador puedes usar helpers headless:

```ts
import { selectPlayerField, selectPlayerFields } from '@manaflow/react';

const current = selectPlayerField(snapshot, snapshot.currentPlayer);
const fields = selectPlayerFields(snapshot);
```

## Props de componentes

### `ReplayPlayer`

| Prop | Tipo | Default | Descripcion |
| --- | --- | --- | --- |
| `store` | `ReactReplayStore` | requerida | Store creado con `createReactReplayStore`. |
| `autoplayIntervalMs` | `number` | `700` | Intervalo de autoplay en milisegundos. |
| `playbackRate` | `number` | `1` | Multiplicador de velocidad (`2` = 2x). |
| `defaultPlaybackRate` | `number` | `1` | Velocidad inicial en modo no controlado. |
| `playbackRateOptions` | `number[]` | `[0.5, 1, 2]` | Presets de velocidad en controles. |
| `loop` | `boolean` | `false` | Reinicia en bucle al llegar al final en vez de parar. |
| `loopRange` | `{ from: number; to: number }` | rango completo | Segmento de frames para loop cuando `loop` esta activo. |
| `playing` | `boolean` | no controlado | Estado de reproduccion en modo controlado. |
| `defaultPlaying` | `boolean` | `false` | Estado inicial en modo no controlado. |
| `onPlayingChange` | `(playing: boolean) => void` | `undefined` | Callback al cambiar play/pause. |
| `onPlaybackRateChange` | `(playbackRate: number) => void` | `undefined` | Callback al cambiar velocidad. |
| `onFrameChange` | `(state: ReactReplayState) => void` | `undefined` | Callback al cambiar frame actual. |
| `onReachEnd` | `(state: ReactReplayState) => void` | `undefined` | Callback al llegar al final en autoplay sin loop. |
| `className` | `string` | `undefined` | Clase extra del contenedor principal. |
| `controlsClassName` | `string` | `undefined` | Clase extra para `ReplayControls`. |
| `timelineClassName` | `string` | `undefined` | Clase extra para la timeline integrada. |
| `viewportClassName` | `string` | `undefined` | Clase extra para `ReplayViewport`. |
| `viewportCardClassName` | `string` | `undefined` | Clase extra para cada card del viewport. |
| `viewportLayout` | `'stacked' \| 'board'` | `stacked` | Preset de layout para distribuir zonas en el viewport. |
| `showTimeline` | `boolean` | `false` | Si renderiza `ReplayTimeline` dentro del player. |
| `timelinePosition` | `'beforeViewport' \| 'afterViewport'` | `'beforeViewport'` | Posicion de la timeline integrada respecto al viewport. |
| `timelineAriaLabel` | `string` | `Replay timeline` | Label accesible para la timeline integrada. |
| `timelineFramePrefix` | `string` | `F` | Prefijo de cada marcador de frame (`F1`, `F2`, ...). |
| `timelineMarkers` | `ReplayTimelineMarker[]` | frames por defecto | Marcadores usados por la timeline integrada. |
| `renderTimelineMarker` | `(context: ReplayTimelineRenderContext) => ReactNode` | renderer por defecto | Render custom de marcadores en timeline. |
| `onTimelineSeek` | `(frame: number) => void` | `undefined` | Callback cuando timeline hace `seek`. |
| `zones` | `ReplayViewportZoneConfig[]` | zonas por defecto | Lista de zonas a renderizar. |
| `timelineFormatter` | `(snapshot: GameSnapshot) => string` | formatter por defecto | Texto de timeline personalizado. |
| `renderCard` | `(context: ReplayViewportCardRenderContext) => ReactNode` | renderer por defecto | Render de carta personalizado. |
| `renderZoneTitle` | `(context: ReplayViewportZoneTitleRenderContext) => ReactNode` | titulo por defecto | Render de titulo de zona personalizado. |

### `ReplayControls`

| Prop | Tipo | Default | Descripcion |
| --- | --- | --- | --- |
| `state` | `ReactReplayState` | requerida | Estado actual del replay. |
| `isPlaying` | `boolean` | requerida | Si se muestra `Play` o `Pause`. |
| `playbackRate` | `number` | `1` | Velocidad activa mostrada en presets. |
| `playbackRateOptions` | `number[]` | `[]` | Presets opcionales de velocidad. |
| `onPrevious` | `() => void` | requerida | Handler del boton `Prev`. |
| `onNext` | `() => void` | requerida | Handler del boton `Next`. |
| `onTogglePlay` | `() => void` | requerida | Handler de `Play/Pause`. |
| `onSeek` | `(frame: number) => void` | requerida | Handler del slider de frames. |
| `onPlaybackRateChange` | `(rate: number) => void` | `undefined` | Handler al elegir preset de velocidad. |
| `className` | `string` | `undefined` | Clase extra del root del control. |

### `ReplayViewport`

| Prop | Tipo | Default | Descripcion |
| --- | --- | --- | --- |
| `state` | `ReactReplayState` | requerida | Estado/frame a renderizar. |
| `zones` | `ReplayViewportZoneConfig[]` | hand/board/graveyard/deck/stack | Configuracion de zonas visibles. |
| `layout` | `'stacked' \| 'board'` | `stacked` | Preset de layout de zonas del viewport. |
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
  const [rate, setRate] = useState(1);

  return (
    <>
      <div className="replay-toolbar">
        <button onClick={() => setPlaying((value) => !value)}>{playing ? 'Pause' : 'Play'}</button>
        <button onClick={() => setIntervalMs((value) => (value === 700 ? 350 : 700))}>
          Velocidad: {intervalMs}ms
        </button>
        <button onClick={() => setRate((value) => (value === 1 ? 2 : 1))}>Rate {rate}x</button>
      </div>
      <ReplayPlayer
        store={store}
        playing={playing}
        onPlayingChange={setPlaying}
        autoplayIntervalMs={intervalMs}
        playbackRate={rate}
        onPlaybackRateChange={setRate}
        loop
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
