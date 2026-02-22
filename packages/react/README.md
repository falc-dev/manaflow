# @manaflow/react

React-oriented replay helpers for Manaflow.

## Peer dependencies

- `react >= 18`
- `react-dom >= 18`

## Styles

```ts
import '@manaflow/react/styles.css';
```

## Quick start

```tsx
import { ReplayPlayer, createReactReplayStore } from '@manaflow/react';
import '@manaflow/react/styles.css';

const store = createReactReplayStore(replay);

export function ReplayPage() {
  return <ReplayPlayer store={store} defaultPlaying={false} autoplayIntervalMs={700} />;
}
```

## ReplayPlayer props

```tsx
import type { ReplayPlayerProps } from '@manaflow/react';
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `store` | `ReactReplayStore` | required | Replay store instance created with `createReactReplayStore`. |
| `autoplayIntervalMs` | `number` | `700` | Autoplay interval in milliseconds. |
| `playbackRate` | `number` | `1` | Playback speed multiplier (`2` is 2x faster, `0.5` is slower). |
| `defaultPlaybackRate` | `number` | `1` | Initial playback speed in uncontrolled mode. |
| `playbackRateOptions` | `number[]` | `[0.5, 1, 2]` | Speed buttons rendered in `ReplayControls`. |
| `loop` | `boolean` | `false` | Rewinds playback instead of stopping when reaching the end. |
| `loopRange` | `{ from: number; to: number }` | full replay range | Loop segment boundaries when `loop` is enabled. |
| `playing` | `boolean` | uncontrolled | Controlled playback state. |
| `defaultPlaying` | `boolean` | `false` | Initial playback state for uncontrolled mode. |
| `onPlayingChange` | `(playing: boolean) => void` | `undefined` | Called when play/pause changes. |
| `onPlaybackRateChange` | `(playbackRate: number) => void` | `undefined` | Called when speed changes from controls. |
| `onFrameChange` | `(state: ReactReplayState) => void` | `undefined` | Called when current frame changes. |
| `onReachEnd` | `(state: ReactReplayState) => void` | `undefined` | Called when autoplay reaches replay end in non-loop mode. |
| `className` | `string` | `undefined` | Root container class (`replay-player`). |
| `controlsClassName` | `string` | `undefined` | Extra class for `ReplayControls`. |
| `timelineClassName` | `string` | `undefined` | Extra class for integrated `ReplayTimeline` when enabled. |
| `viewportClassName` | `string` | `undefined` | Extra class for `ReplayViewport`. |
| `viewportCardClassName` | `string` | `undefined` | Extra class for each viewport card. |
| `viewportLayout` | `'stacked' \| 'board'` | `stacked` | Layout preset forwarded to `ReplayViewport`. |
| `showTimeline` | `boolean` | `false` | Renders integrated `ReplayTimeline` inside `ReplayPlayer`. |
| `timelinePosition` | `'beforeViewport' \| 'afterViewport'` | `'beforeViewport'` | Controls where integrated timeline is rendered. |
| `timelineAriaLabel` | `string` | `Replay timeline` | Accessible label for integrated timeline list. |
| `timelineFramePrefix` | `string` | `F` | Prefix used for frame chip labels (`F1`, `F2`, ...). |
| `timelineMarkers` | `ReplayTimelineMarker[]` | generated from total frames | Marker list used by integrated timeline. |
| `renderTimelineMarker` | `(context: ReplayTimelineRenderContext) => ReactNode` | built-in marker | Override marker UI in integrated timeline. |
| `onTimelineSeek` | `(frame: number) => void` | `undefined` | Called after integrated timeline seeks a frame. |
| `zones` | `ReplayViewportZoneConfig[]` | built-in zones | Zone list rendered in viewport. |
| `timelineFormatter` | `(snapshot: GameSnapshot) => string` | built-in formatter | Timeline text renderer. |
| `renderCard` | `(context: ReplayViewportCardRenderContext) => ReactNode` | built-in card | Card content renderer override. |
| `renderZoneTitle` | `(context: ReplayViewportZoneTitleRenderContext) => ReactNode` | zone title | Zone title renderer override. |

## ReplayControls props

```tsx
import type { ReplayControlsProps } from '@manaflow/react';
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `state` | `ReactReplayState` | required | Snapshot of replay state (`currentFrame`, `totalFrames`, etc.). |
| `isPlaying` | `boolean` | required | Current playback status for the play button label. |
| `playbackRate` | `number` | `1` | Active playback speed. |
| `playbackRateOptions` | `number[]` | `[]` | Optional speed preset buttons. |
| `onPrevious` | `() => void` | required | Called when user clicks `Prev`. |
| `onNext` | `() => void` | required | Called when user clicks `Next`. |
| `onTogglePlay` | `() => void` | required | Called when user clicks `Play/Pause`. |
| `onSeek` | `(frame: number) => void` | required | Called when user moves the frame slider. |
| `onPlaybackRateChange` | `(rate: number) => void` | `undefined` | Called when a speed preset is selected. |
| `className` | `string` | `undefined` | Extra class for controls root element. |

## ReplayTimeline props

```tsx
import type { ReplayTimelineProps } from '@manaflow/react';
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `state` | `ReactReplayState` | required | Replay state used to resolve active marker and frame bounds. |
| `onSeek` | `(frame: number) => void` | required | Called when the user clicks a marker. |
| `markers` | `ReplayTimelineMarker[]` | generated from total frames | Markers to render (`frame`, `label`, `actionType`). |
| `className` | `string` | `undefined` | Extra class for timeline root. |
| `ariaLabel` | `string` | `Replay timeline` | Accessible label for timeline list. |
| `framePrefix` | `string` | `F` | Prefix used for frame chip labels (`F1`, `F2`, ...). |
| `renderMarker` | `(context: ReplayTimelineRenderContext) => ReactNode` | built-in marker | Override marker content rendering. |

## ReplayViewport props

```tsx
import type { ReplayViewportProps } from '@manaflow/react';
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `state` | `ReactReplayState` | required | Replay frame/state to render. |
| `zones` | `ReplayViewportZoneConfig[]` | hand/board/graveyard/deck/stack | Visible zones and labels. |
| `layout` | `'stacked' \| 'board'` | `stacked` | Layout preset for zone arrangement. |
| `timelineFormatter` | `(snapshot: GameSnapshot) => string` | built-in formatter | Timeline text renderer. |
| `renderCard` | `(context: ReplayViewportCardRenderContext) => ReactNode` | built-in card | Card renderer override. |
| `renderZoneTitle` | `(context: ReplayViewportZoneTitleRenderContext) => ReactNode` | zone title | Zone title renderer override. |
| `className` | `string` | `undefined` | Extra class for viewport root element. |
| `cardClassName` | `string` | `undefined` | Extra class for every card node. |

### Related viewport types

- `ReplayViewportZoneConfig`: `{ id: ZoneId; title: string }`
- `ReplayViewportCardRenderContext`: `{ entityId; zoneId; snapshot; card }`
- `ReplayViewportZoneTitleRenderContext`: `{ zone; snapshot; entityIds }`

## Mini interactive examples

### 1) Controlled `ReplayPlayer` with external toggles

```tsx
import { useState } from 'react';
import { ReplayPlayer } from '@manaflow/react';

function ControlledPlayer({ store }) {
  const [playing, setPlaying] = useState(false);
  const [intervalMs, setIntervalMs] = useState(700);
  const [rate, setRate] = useState(1);

  return (
    <>
      <div className="replay-toolbar">
        <button onClick={() => setPlaying((value) => !value)}>
          {playing ? 'Pause from parent' : 'Play from parent'}
        </button>
        <button onClick={() => setIntervalMs((value) => (value === 700 ? 350 : 700))}>
          Toggle speed ({intervalMs}ms)
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

### 2) `ReplayPlayer` with integrated timeline

```tsx
import { ReplayPlayer, buildReplayMarkers } from '@manaflow/react';

const markers = buildReplayMarkers(replayPayload.events ?? []);

function PlayerWithTimeline({ store }) {
  return (
    <ReplayPlayer
      store={store}
      showTimeline
      timelineMarkers={markers}
      viewportLayout="board"
      timelinePosition="afterViewport"
      timelineAriaLabel="Replay frames"
      timelineFramePrefix="Frame "
    />
  );
}
```

### 3) Compose `ReplayControls` + `ReplayViewport`

```tsx
import { useState } from 'react';
import { ReplayControls, ReplayViewport, useReplayStore } from '@manaflow/react';

function CustomLayout({ store }) {
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
        timelineFormatter={(snapshot) => `Turn ${snapshot.turn} · ${snapshot.currentPhase}`}
        renderZoneTitle={({ zone, entityIds }) => `${zone.title} (${entityIds.length})`}
      />
    </section>
  );
}
```

### 4) Compose `ReplayTimeline` with marker helper

```tsx
import { ReplayTimeline, buildReplayMarkers, useReplayStore } from '@manaflow/react';

function TimelineSection({ store, replayPayload }) {
  const state = useReplayStore(store);
  const markers = buildReplayMarkers(replayPayload.events ?? []);

  return <ReplayTimeline state={state} markers={markers} onSeek={(frame) => store.seek(frame)} />;
}
```

### 5) Viewport customization (cards + zones)

```tsx
import { ReplayPlayer } from '@manaflow/react';

<ReplayPlayer
  store={store}
  timelineFormatter={(snapshot) => `T${snapshot.turn} · ${snapshot.currentPhase}`}
  renderZoneTitle={({ zone, entityIds }) => `${zone.title} (${entityIds.length})`}
  renderCard={({ entityId, card }) => (
    <>
      <strong>{card?.name ?? entityId}</strong>
      <small>Cost {card?.cost ?? '-'}</small>
    </>
  )}
/>;
```

## Replay marker helpers

```ts
import { buildReplayMarkers, getReplayActionLabel } from '@manaflow/react';

const markers = buildReplayMarkers(payload.events ?? [], {
  actionLabels: {
    PLAY_CARD: 'Hand -> Battle'
  }
});

const fallback = getReplayActionLabel('CUSTOM_ACTION');
```

## Player field helpers

```ts
import { selectPlayerField, selectPlayerFields } from '@manaflow/react';

const currentPlayerField = selectPlayerField(snapshot, snapshot.currentPlayer);
const allFields = selectPlayerFields(snapshot);
```

`selectPlayerField` / `selectPlayerFields` expose player-centric `hand` / `deck` / `trash` data, useful for top-vs-bottom battlefield layouts.

## Player field & table components

```tsx
import { ReplayPlayerField, ReplayTable, selectPlayerFields, useReplayStore } from '@manaflow/react';

function TwoSidedTable({ store }) {
  const state = useReplayStore(store);
  const fields = selectPlayerFields(state.frame.snapshot);

  return (
    <section>
      <ReplayPlayerField state={state} field={fields[0]} />
      <ReplayTable state={state} />
      <ReplayPlayerField state={state} field={fields[1]} />
    </section>
  );
}
```

## Store API

```ts
import { createReactReplayStore } from '@manaflow/react';

const store = createReactReplayStore(replayEngine);
const unsubscribe = store.subscribe((state) => {
  console.log(state.currentFrame, state.totalFrames);
});

store.next();
store.seek(0);
unsubscribe();
store.destroy();
```

## Optional external renderer integration

```ts
import { createReactReplayStore } from '@manaflow/react';
import { HtmlRendererAdapter } from '@manaflow/html-visor';

const store = createReactReplayStore(replayEngine, {
  renderer: new HtmlRendererAdapter({
    timelineFormatter: (snapshot) => `T${snapshot.turn} · ${snapshot.currentPhase}`
  })
});
```

`@manaflow/react` no longer creates `HtmlRendererAdapter` by default. Pass a `renderer` explicitly if needed.

## Loading replays

```ts
import { loadDemoReplay } from '@manaflow/react';

const replay = await loadDemoReplay('/replay.demo.json');
```

## Hook (recommended)

```ts
import { useReplayStore } from '@manaflow/react';

const currentFrame = useReplayStore(store, (state) => state.currentFrame);
```

## Hook bridge (`useSyncExternalStore`)

```ts
import { createUseReplayStore } from '@manaflow/react';
import { useSyncExternalStore } from 'react';

const useReplayStore = createUseReplayStore(useSyncExternalStore);
const currentFrame = useReplayStore(store, (state) => state.currentFrame);
```

## Legacy API

`mountReplayDemo(...)` is deprecated and kept only for backwards compatibility.
Use `ReplayPlayer` + `createReactReplayStore` / `useReplayStore` for new code.
