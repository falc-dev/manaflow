# Recipe: Personalizar cómo se muestran las cartas

Puedes sobrescribir el render de cada carta usando `renderCard`.

## Ejemplo básico

```tsx
<ReplayPlayer
  store={store}
  renderCard={({ entityId, card, state }) => (
    <div className="mi-carta">
      <span className="coste">{card?.cost ?? '-'}</span>
      <span className="nombre">{card?.name ?? entityId}</span>
    </div>
  )}
/>
```

## Con acceso al snapshot completo

```tsx
<ReplayPlayer
  store={store}
  renderCard={({ entityId, card, state }) => {
    const snapshot = state.frame.snapshot;
    const esTuTurno = snapshot.currentPlayer === snapshot.players[0].id;
    
    return (
      <div className={`carta ${esTuTurno ? 'activa' : ''}`}>
        <div className="nombre">{card?.name}</div>
        {card?.description && <div className="desc">{card.description}</div>}
      </div>
    );
  }}
/>
```

## Tipos disponibles

```ts
interface ReplayViewportCardRenderContext {
  entityId: string;
  zoneId: string;
  card?: Card;
  snapshot: GameSnapshot;
  state: ReactReplayState;
}
```

## Estilos CSS

Las cartas reciben estas clases:

- `replay-player__card` (base)
- `replay-player__card--tapped` (si está girada)
- Clase personalizada vía `viewportCardClassName`

## Siguiente paso

- [Personalizar zonas](custom-zones.md)
- [API completa del viewport](../packages/react.md#replayviewport-props)
