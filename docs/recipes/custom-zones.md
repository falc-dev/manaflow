# Recipe: Personalizar zonas

Las zonas definen dónde aparecen las cartas (mano, tablero, cementerio, etc.).

## Zonas por defecto

```tsx
const zonasPorDefecto = [
  { id: 'hand', title: 'Mano' },
  { id: 'board', title: 'Tablero' },
  { id: 'graveyard', title: 'Cementerio' },
  { id: 'deck', title: 'Mazo' },
  { id: 'stack', title: 'Pila' }
];
```

## Personalizar títulos

```tsx
<ReplayPlayer
  store={store}
  zones={[
    { id: 'hand_p1', title: 'Mi Mano' },
    { id: 'hand_p2', title: 'Mano Enemiga' },
    { id: 'board', title: 'Campo de Batalla' },
    { id: 'graveyard', title: 'Cementerio' }
  ]}
/>
```

## Personalizar render de título

```tsx
<ReplayPlayer
  store={store}
  renderZoneTitle={({ zone, entityIds, snapshot }) => (
    <div className="zona">
      <span>{zone.title}</span>
      <span className="contador">({entityIds.length})</span>
    </div>
  )}
/>
```

## Layouts predefinidos

| Layout | Descripción |
|--------|-------------|
| `stacked` | Zonas apiladas verticalmente (por defecto) |
| `board` | Tablero con zonas de jugador a cada lado |

```tsx
<ReplayPlayer store={store} viewportLayout="board" />
```

## Posiciones personalizadas

Para control total, usa la configuración avanzada del visor HTML directamente:

```ts
import { HtmlRendererAdapter } from '@manaflow/html-visor';

const visor = new HtmlRendererAdapter({
  zones: [
    { id: 'hand', title: 'Mano', top: 600 },
    { id: 'board', title: 'Tablero', top: 300 },
    { id: 'graveyard', title: 'Cementerio', top: 100 }
  ]
});
```

## Siguiente paso

- [Agregar un nuevo juego](add-new-game.md)
- [UI predefinida por juego](../examples/ui-presets.md)
