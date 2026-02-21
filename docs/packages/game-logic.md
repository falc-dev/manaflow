# @manaflow/game-logic

Reducers de reglas de juego compartidas.

## Para que sirve

Encapsula transiciones de estado puras para aplicar acciones sobre `GameSnapshot`.

## Exports clave

- `Reducer`
- `tcgReplayReducer`

## Ejemplo

```ts
import { GameEngine } from '@manaflow/core';
import { tcgReplayReducer } from '@manaflow/game-logic';

const engine = new GameEngine(initialSnapshot, tcgReplayReducer);
engine.apply(action);
```

## Comportamiento actual

- `END_TURN` rota `currentPlayer`, incrementa `turn` y fija fase `DRAW`.

## Build

```bash
pnpm --filter @manaflow/game-logic build
```
