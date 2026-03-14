# @manaflow/react

> **Navegación**: [Inicio](https://manaflow.dev) · [Guía](docs/guide/getting-started.md) · [Recipes](docs/recipes/quick-start-react.md)

React-oriented replay helpers for Manaflow.

## Installation

```bash
npm install @manaflow/react
# or
pnpm add @manaflow/react
```

## Peer dependencies

- `react >= 18`
- `react-dom >= 18`

## What is Manaflow?

Manaflow is a library for visualizing TCG (Trading Card Game) replays. It renders game state snapshots frame-by-frame, allowing users to navigate through a game's history with play/pause controls, timeline, and step forward/backward buttons.

## Basic Concepts

- **Replay**: A recorded game session consisting of frames (snapshots)
- **Frame**: A complete game state at a specific point in time
- **Store**: Manages replay state and navigation (next, previous, seek)
- **Viewport**: Renders the visual representation of cards and zones

## What does replay data look like?

A replay consists of an initial state and a series of events:

```ts
interface ReplayData {
  schemaVersion: 1;
  initialState: GameSnapshot;
  events: ReplayFrame[];
}

interface GameSnapshot {
  id: string;
  players: PlayerState[];
  currentPlayer: string;
  turn: number;
  entities: Record<string, GameEntity>;
  zones: Record<string, string[]>;
  metadata: { rulesProfile: string };
}
```

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

## Quick start from URL

```tsx
import { ReplayPlayer, useReplayBootstrap } from '@manaflow/react';
import '@manaflow/react/styles.css';

export function ReplayPage() {
  const { loading, error, store } = useReplayBootstrap('/demo.replay.json', {
    normalizeRiftboundAliases: true
  });

  if (loading) return <p>Loading replay…</p>;
  if (error || !store) return <p>Unable to load replay</p>;
  return <ReplayPlayer store={store} showTimeline />;
}
```

## Context-first composition (optional)

```tsx
import {
  ConnectedReplayControls,
  ConnectedReplayTimeline,
  ConnectedReplayViewport,
  ManaflowProvider,
  ReplayBootstrapBoundary,
  useReplayBootstrap
} from '@manaflow/react';

export function ReplayPage() {
  const replay = useReplayBootstrap('/demo.replay.json');

  return (
    <ReplayBootstrapBoundary
      loading={replay.loading}
      error={replay.error}
      validationIssues={replay.validationIssues}
      store={replay.store}
    >
      {(store) => (
        <ManaflowProvider store={store}>
          <ConnectedReplayControls playbackRateOptions={[0.5, 1, 2]} />
          <ConnectedReplayTimeline markers={replay.frameMarkers} />
          <ConnectedReplayViewport />
        </ManaflowProvider>
      )}
    </ReplayBootstrapBoundary>
  );
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
| `viewTransitions` | `boolean` | `true` | Wraps replay frame changes in `document.startViewTransition` when available. |

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
| `labels` | `ReplayControlsLabels` | defaults | Optional accessibility labels (`previous`, `next`, `play`, `pause`, `frameSlider`). |

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
| `viewTransitions` | `boolean` | `true` | Assigns stable `view-transition-name` values to cards so zone moves animate. |

### Related viewport types

- `ReplayViewportZoneConfig`: `{ id: ZoneId; title: string }`
- `ReplayViewportCardRenderContext`: `{ entityId; zoneId; snapshot; card; state }`
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

### 5) Optional onboarding legend (`ReplayOnboardingLegend`)

```tsx
import { ReplayOnboardingLegend } from '@manaflow/react';

function BoardLegend() {
  return (
    <ReplayOnboardingLegend
      title="Board guide"
      description="Quick legend for first-time users."
      onDismiss={() => console.log('dismissed')}
      items={[
        { id: 'battlefield', label: 'Battlefields', tone: 'battlefield' },
        { id: 'rune', label: 'Runes', tone: 'rune' },
        { id: 'control-blue', label: 'Control Blue', tone: 'control-blue' }
      ]}
    />
  );
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

## Shared utilities

```ts
import { joinClassNames, getCardMetadata, ZoneRenderer } from '@manaflow/react';
```

- `joinClassNames`: Joins class name parts, filtering out undefined values
- `getCardMetadata`: Extracts card metadata from a game entity
- `ZoneRenderer`: Reusable component for rendering zones with cards

### ZoneRenderer usage

```tsx
import { ZoneRenderer, type ZoneRendererProps } from '@manaflow/react';

interface MyZone {
  id: string;
  title: string;
}

function MyComponent({ snapshot }) {
  const zones: MyZone[] = [
    { id: 'hand', title: 'Hand' },
    { id: 'board', title: 'Board' }
  ];

  return (
    <ZoneRenderer
      zones={zones}
      snapshot={snapshot}
      getEntityIds={(zone) => snapshot.zones[zone.id] ?? []}
      renderCard={({ entityId, card }) => (
        <div>{card?.name ?? entityId}</div>
      )}
    />
  );
}
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

const mappedField = selectPlayerField(snapshot, snapshot.currentPlayer, {
  zoneMap: {
    hand: ['reserve', 'hand'],
    trash: ['discard_pile', 'graveyard', 'trash']
  }
});
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

Si tu juego tiene una zona central de objetivos (distinta de una mesa compartida clasica), usa `ReplaySharedObjective` o el preset `ReplayDuelLayout`:

```tsx
import { ReplayDuelLayout, useReplayStore } from '@manaflow/react';

function DuelTable({ store }) {
  const state = useReplayStore(store);

  return (
    <ReplayDuelLayout
      state={state}
      fieldZoneMap={{ trash: ['discard', 'graveyard', 'trash'] }}
      sharedObjectiveProps={{
        title: 'Center Objective',
        zoneIds: ['objective', 'board']
      }}
      tableProps={{
        zones: [{ id: 'stack', title: 'Stack' }]
      }}
    />
  );
}
```

## Store API

The store manages replay state and provides navigation methods:

```ts
import { createReactReplayStore, type ReactReplayStore } from '@manaflow/react';

// Create a store from replay data
const store = createReactReplayStore(replayData);

// Subscribe to state changes
const unsubscribe = store.subscribe((state) => {
  console.log(state.currentFrame, state.totalFrames);
});

// Navigation methods
store.next();       // Go to next frame
store.previous();   // Go to previous frame
store.seek(5);      // Jump to frame 5
store.seek(0);      // Jump to start
store.seek(store.getState().totalFrames - 1); // Jump to end

// Cleanup
unsubscribe();
store.destroy();
```

### ReactReplayStore interface

```ts
interface ReactReplayStore {
  subscribe(listener: (state: ReactReplayState) => void): () => void;
  getState(): ReactReplayState;
  next(): void;
  previous(): void;
  seek(frame: number): void;
  destroy(): void;
}
```

### ReactReplayState interface

```ts
interface ReactReplayState {
  frame: ReplayFrame;
  currentFrame: number;
  totalFrames: number;
  canStepBack: boolean;
  canStepForward: boolean;
}
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

const replay = await loadDemoReplay('/demo.replay.json');
// `loadDemoReplay` autodetects json/jsonc/yaml/ndjson payloads.

// Optional: reuse an already fetched payload to avoid a second network request.
const replayFromPayload = await loadDemoReplay('/demo.replay.json', {
  payload: replayJsonString
});
```

## Hook (recommended)

The `useReplayStore` hook subscribes to store changes and returns the current state:

```ts
import { useReplayStore } from '@manaflow/react';

// Get the entire state
const state = useReplayStore(store);

// Get a specific value with a selector
const currentFrame = useReplayStore(store, (state) => state.currentFrame);
const isPlaying = useReplayStore(store, (state) => state.canStepForward);
```

The selector function is memoized for performance - it only causes re-renders when the selected value changes.

## Replay config hook

```ts
import { useReplayConfig } from '@manaflow/react';

function CustomPlayer({ store }) {
  const {
    state,
    playing,
    playbackRate,
    togglePlaying,
    setPlaying,
    setPlaybackRate,
    stepForward,
    stepBackward,
    seek
  } = useReplayConfig(store, {
    autoplayIntervalMs: 700,
    defaultPlaying: false,
    defaultPlaybackRate: 1,
    loop: false,
    viewTransitions: true
  });

  return (
    <div>
      <button onClick={stepBackward} disabled={!state.canStepBack}>Prev</button>
      <button onClick={togglePlaying}>{playing ? 'Pause' : 'Play'}</button>
      <button onClick={stepForward} disabled={!state.canStepForward}>Next</button>
      <span>Frame {state.currentFrame + 1}/{state.totalFrames}</span>
    </div>
  );
}
```

Use `createReplayConfig()` to create a reusable config factory:

```ts
const usePlayerControls = createReplayConfig({
  autoplayIntervalMs: 500,
  loop: true
});

// Then use in multiple components
function ControlsA({ store }) {
  const { togglePlaying, seek } = usePlayerControls(store);
  // ...
}

function ControlsB({ store }) {
  const { togglePlaying, seek } = usePlayerControls(store);
  // ...
}
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

## Troubleshooting

### Cards not rendering

Make sure your `GameSnapshot` entities have a `CARD` component:

```ts
const snapshot = {
  // ...
  entities: {
    'card_1': {
      id: 'card_1',
      type: 'card',
      components: [
        { componentType: 'CARD', metadata: { name: 'Fireball', cost: 3 } }
      ]
    }
  }
};
```

### View transitions not working

View transitions require browser support. They work automatically in Chrome/Edge. For other browsers, the replay will still function but without smooth animations.

### Types not found

Ensure you have TypeScript configured:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}
```

### CSS not loading

Make sure the CSS import is at the top of your entry file:

```ts
// main.tsx or App.tsx
import '@manaflow/react/styles.css';
import React from 'react';
import ReactDOM from 'react-dom';
// ...
```
