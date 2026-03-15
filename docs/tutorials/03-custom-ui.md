# Tutorial: UI Personalizada

En este tutorial aprenderás a personalizar cómo se muestran las cartas y zonas.

> **🎮 Ejemplo interactivo**: Prueba personalizaciones en el [Playground](/?example=05-playground)

## Prerequisites

- Completado: [Tutorial 02: React Básico](02-react-basic.md)

## Lo que vas a aprender

- Personalizar el render de cartas
- Personalizar títulos de zonas
- Añadir clases CSS personalizadas

---

## Paso 1: Personalizar cartas

Usa `renderCard` para sobrescribir cómo se muestra cada carta:

```tsx
<ReplayPlayer
  store={store}
  renderCard={({ entityId, card }) => (
    <div className="mi-carta">
      <span className="coste">{card?.cost}</span>
      <span className="nombre">{card?.name}</span>
    </div>
  )}
/>
```

### Visual: Carta por defecto vs personalizada

::: info
<DiagramCardComparison />
:::

### Contexto disponible

```ts
interface CardRenderContext {
  entityId: string;    // ID de la entidad
  zoneId: string;      // Zona donde está la carta
  card?: Card;         // Metadatos de la carta
  state?: EntityState;  // Estado (tapped, damage, etc.)
}
```

---

## Paso 2: Personalizar títulos de zonas

Usa `renderZoneTitle` para cambiar cómo se muestran los títulos:

```tsx
<ReplayPlayer
  store={store}
  renderZoneTitle={({ zone, entityIds }) => (
    <span>
      {zone.title} ({entityIds.length} cartas)
    </span>
  )}
/>
```

### Visual: Zonas personalizadas

```
ANTES:                         DESPUÉS:
┌─────────────┐               ┌─────────────────────┐
│ 👤 Jugador  │               │ 👤 Jugador (3 cartas)│
├─────────────┤               ├─────────────────────┤
│ [carta]     │               │ [carta] [carta]     │
│ [carta]     │               │ [carta]             │
└─────────────┘               └─────────────────────┘

Con emoji + contador           Con clase personalizada
```

---

## Paso 3: Añadir clases CSS

### Clase global para el viewport

```tsx
<ReplayPlayer
  store={store}
  viewportClassName="mi-viewport"
/>
```

### Clase para cada carta

```tsx
<ReplayPlayer
  store={store}
  cardClassName="mi-carta"
/>
```

---

## Ejemplo completo

```tsx
<ReplayPlayer
  store={store}
  renderCard={({ entityId, card, state }) => (
    <div className={`carta ${state?.tapped ? 'tapped' : ''}`}>
      <div className="coste">{card?.cost}</div>
      <div className="nombre">{card?.name}</div>
      {state?.damage && <div className="damage">{state.damage}</div>}
    </div>
  )}
  renderZoneTitle={({ zone, entityIds }) => (
    <strong>{zone.title} ({entityIds.length})</strong>
  )}
  viewportClassName="mi-partida"
  cardClassName="carta-personalizada"
/>
```

---

## CSS personalizado

```css
.mi-partida .carta-personalizada {
  border: 2px solid gold;
  border-radius: 8px;
}

.mi-partida .carta-personalizada.tapped {
  transform: rotate(90deg);
}
```

---

## Siguiente paso

Ahora aprende a manejar formatos multiplayer:

- [Tutorial: Multiplayer](04-multiplayer.md)

---

## Referencia

- [Recipe: Custom Card Render](../recipes/custom-card-render.md)
- [Recipe: Custom Zones](../recipes/custom-zones.md)
- [API: ReplayViewport props](../packages/react.md#replayviewport-props)
