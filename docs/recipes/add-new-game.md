# Recipe: Agregar un nuevo juego

Manaflow es agnóstico al juego. Puedes usarlo para cualquier TCG.

## 1. Define el formato del replay

Crea un archivo de esquema o simplemente usa el formato genérico:

```json
{
  "schemaVersion": 1,
  "initialState": {
    "id": "mi-juego-1v1",
    "players": [
      { "id": "p1", "name": "Alice", "health": 30, "hand": [], "deck": [], "discard": [] },
      { "id": "p2", "name": "Bob", "health": 30, "hand": [], "deck": [], "discard": [] }
    ],
    "currentPlayer": "p1",
    "turn": 1,
    "entities": {},
    "zones": { "hand_p1": [], "hand_p2": [], "board_p1": [], "board_p2": [] }
  },
  "events": []
}
```

## 2. Define acciones de tu juego

Las acciones definen qué puede pasar en tu juego:

```ts
type MiJuegoAction =
  | { type: 'DRAW_CARD'; playerId: string; cardId: string }
  | { type: 'PLAY_CARD'; playerId: string; cardId: string; from: string; to: string }
  | { type: 'ATTACK'; attackerId: string; targetId: string; damage: number }
  | { type: 'END_TURN'; playerId: string };
```

## 3. Registra el juego (opcional)

Si quieres validación automática:

```ts
import { registerGameProfile, ACTION_CATALOG_BY_PROFILE } from '@manaflow/core';

registerGameProfile('mi-juego-v1', {
  actions: ['DRAW_CARD', 'PLAY_CARD', 'ATTACK', 'END_TURN'],
  zones: ['hand', 'board', 'deck', 'discard']
});
```

## 4. Personaliza el UI

Usa las props de `ReplayPlayer` para adaptar la interfaz:

```tsx
<ReplayPlayer
  store={store}
  zones={[
    { id: 'hand_p1', title: 'Mi Mano' },
    { id: 'board_p1', title: 'Mi Campo' },
    { id: 'board_p2', title: 'Campo Enemigo' },
    { id: 'hand_p2', title: 'Mano Enemiga' }
  ]}
  viewportLayout="board"
  timelineFormatter={(s) => `Turno ${s.turn}`}
/>
```

## Ejemplo completo

```tsx
import { ReplayPlayer, createReactReplayStore } from '@manaflow/react';
import miJuegoData from './mi-juego.json';

const store = createReactReplayStore(miJuegoData);

export function MiJuegoViewer() {
  return (
    <ReplayPlayer
      store={store}
      viewportLayout="board"
      zones={[
        { id: 'hand_p1', title: 'Mi Mano' },
        { id: 'board_p1', title: 'Mi Campo' },
        { id: 'objective', title: 'Objetivo' },
        { id: 'board_p2', title: 'Campo Rival' },
        { id: 'hand_p2', title: 'Mano Rival' }
      ]}
    />
  );
}
```

## Recursos

- [Formato de replay completo](../reference/replay-schema.md)
- [Ejemplo Riftbound](../examples/riftbound-replay-format.md)
