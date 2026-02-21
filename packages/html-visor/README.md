# @manaflow/html-visor

Lightweight HTML renderer adapter for Manaflow replays.

This package is headless-friendly and framework-agnostic:
- deterministic rendering from `GameSnapshot`
- CSS/BEM based customization
- optional hooks for custom DOM rendering
- optional Web Components integration

## Install / import

```ts
import { HtmlRendererAdapter } from '@manaflow/html-visor';
import '@manaflow/html-visor/styles.css';
```

## Basic usage

```ts
import { HtmlRendererAdapter } from '@manaflow/html-visor';
import type { RendererAdapter } from '@manaflow/types';
import '@manaflow/html-visor/styles.css';

const renderer: RendererAdapter = new HtmlRendererAdapter();
renderer.mount(containerElement);
renderer.render(snapshot);
renderer.highlight('event_42');
renderer.destroy();
```

## Configuration API

```ts
import { HtmlRendererAdapter } from '@manaflow/html-visor';

const renderer = new HtmlRendererAdapter({
  minHeight: '820px',
  rootClassName: 'my-replay-root',
  cardClassName: 'my-card',
  timelineFormatter: (snapshot) => `T${snapshot.turn} · ${snapshot.currentPhase}`,
  zones: [
    { id: 'stack', title: 'Stack', top: 40 },
    { id: 'board', title: 'Board', top: 300 },
    { id: 'hand', title: 'Hand', top: 520 }
  ]
});
```

## Styling (BEM + CSS variables)

Main BEM classes:
- `replay-player`
- `replay-player__timeline`
- `replay-player__timeline--highlighted`
- `replay-player__zone`
- `replay-player__zone-title`
- `replay-player__zone-rail`
- `replay-player__card`
- `replay-player__card-name`
- `replay-player__card-cost`

Useful CSS variables:
- `--replay-player-min-height`
- `--replay-player-bg`
- `--replay-player-text`
- `--replay-player-card-bg`
- `--replay-player-card-border`

```css
.my-replay-root {
  --replay-player-bg: linear-gradient(180deg, #24243e 0%, #141e30 100%);
  --replay-player-text: #f5f7ff;
  --replay-player-card-bg: #fffaf0;
}
```

## Advanced customization

### `renderCard` (full control per card)

```ts
const renderer = new HtmlRendererAdapter({
  renderCard: ({ entityId, card, defaultRender }) => {
    if (!card) {
      return defaultRender();
    }

    const el = document.createElement('article');
    el.className = 'replay-player__card custom-card';
    el.innerHTML = `<h4>${card.name}</h4><p>Cost ${card.cost}</p><small>${entityId}</small>`;
    return el;
  }
});
```

### `renderCardUpdate` (incremental update for custom cards)

Use this together with `renderCard` to avoid remounting card nodes on each frame.

```ts
const renderer = new HtmlRendererAdapter({
  renderCard: ({ entityId, card }) => {
    const el = document.createElement('div');
    el.className = 'replay-player__card';
    el.textContent = `${entityId}:${card?.cost ?? '-'}`;
    return el;
  },
  renderCardUpdate: ({ element, entityId, card }) => {
    element.textContent = `${entityId}:${card?.cost ?? '-'}`;
  }
});
```

### Web Components (`cardTagName`)

```ts
const renderer = new HtmlRendererAdapter({
  cardTagName: 'mf-card'
});
```

When using `cardTagName`, each card element receives:
- `element.entityId`
- `element.snapshot`
- `element.card`

### Render hooks for timeline and zones

```ts
const renderer = new HtmlRendererAdapter({
  renderTimeline: ({ element, defaultText }) => {
    element.textContent = `[Replay] ${defaultText}`;
  },
  renderZone: ({ zone, titleElement, entityIds }) => {
    titleElement.textContent = `${zone.title} (${entityIds.length})`;
  }
});
```

### Card lifecycle hooks

```ts
const renderer = new HtmlRendererAdapter({
  onCardMount: ({ entityId }) => {
    console.log('mounted', entityId);
  },
  onCardUnmount: ({ entityId }) => {
    console.log('unmounted', entityId);
  }
});
```

## Rendering precedence

Card rendering follows this order:
1. `renderCard` (+ optional `renderCardUpdate`)
2. `cardTagName` (Web Component)
3. built-in default card template
