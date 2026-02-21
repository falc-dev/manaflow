# Crear y navegar un replay con @manaflow/core

Este ejemplo crea un replay desde cero, agrega snapshots y navega por frames.

```ts
import { ReplayEngine, createInitialState } from '@manaflow/core';

const initial = createInitialState([
  { id: 'p1', name: 'Alice' },
  { id: 'p2', name: 'Bob' }
]);

const replay = new ReplayEngine(initial);

const afterDraw = {
  ...initial,
  turn: 1,
  currentPhase: 'MAIN',
  zones: {
    ...initial.zones,
    hand: ['card_1']
  }
};

replay.appendSnapshot(afterDraw, {
  id: 'event_draw_1',
  action: {
    type: 'DRAW_CARD',
    playerId: 'p1',
    payload: { cardId: 'card_1' },
    timestamp: 1000
  },
  timestamp: 1000,
  playerId: 'p1'
});

replay.stepForward();
replay.stepBack();
replay.seek({ frame: 1 });

console.log(replay.getCurrentFrame().index); // 1
console.log(replay.getTotalFrames()); // 2
```

## Serializar replay

```ts
const payload = replay.toReplayData();
const json = JSON.stringify(payload, null, 2);
```
