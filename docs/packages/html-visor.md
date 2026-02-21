# @manaflow/html-visor

Renderer HTML/CSS para snapshots de replay.

## Para que sirve

Renderiza un `GameSnapshot` en DOM usando clases BEM y opciones de personalizacion.

## Exports clave

- `HtmlRendererAdapter`
- Tipos de opciones/contextos (`HtmlRendererAdapterOptions`, `RenderCardContext`, etc.)
- CSS default: `@manaflow/html-visor/styles.css`

## Ejemplo

```ts
import { HtmlRendererAdapter } from '@manaflow/html-visor';
import '@manaflow/html-visor/styles.css';

const renderer = new HtmlRendererAdapter({
  timelineFormatter: (snapshot) => `T${snapshot.turn} · ${snapshot.currentPhase}`
});

renderer.mount(container);
renderer.render(snapshot);
renderer.highlight('event_42');
```

## Personalizacion

- Layout de zonas: `zones`
- Clase raiz/tarjeta: `rootClassName`, `cardClassName`
- Render avanzado: `renderCard`, `renderCardUpdate`, `renderZone`, `renderTimeline`
- Hooks de ciclo de vida: `onCardMount`, `onCardUnmount`
- Web components: `cardTagName`

## Build

```bash
pnpm --filter @manaflow/html-visor build
```
