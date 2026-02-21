# Renderer HTML personalizable con @manaflow/html-visor

Ejemplo de personalizacion visual y hooks de ciclo de vida.

```ts
import { HtmlRendererAdapter } from '@manaflow/html-visor';
import '@manaflow/html-visor/styles.css';

const renderer = new HtmlRendererAdapter({
  rootClassName: 'my-replay-root',
  timelineFormatter: (snapshot) => `T${snapshot.turn} · ${snapshot.currentPhase}`,
  renderZone: ({ zone, titleElement, entityIds }) => {
    titleElement.textContent = `${zone.title} (${entityIds.length})`;
  },
  onCardMount: ({ entityId }) => {
    console.log('mounted', entityId);
  },
  onCardUnmount: ({ entityId }) => {
    console.log('unmounted', entityId);
  }
});

renderer.mount(container);
renderer.render(snapshot);
```

```css
.my-replay-root {
  --replay-player-bg: linear-gradient(180deg, #1b2735 0%, #090a0f 100%);
  --replay-player-text: #f8fbff;
}
```
