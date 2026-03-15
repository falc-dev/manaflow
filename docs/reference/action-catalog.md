# Catálogo de Acciones

Lista de acciones disponibles en Manaflow para definir eventos en replays.

## Acciones Genéricas

Estas acciones están disponibles para cualquier TCG:

| Acción | Descripción | Payload típico |
|--------|-------------|----------------|
| `SNAPSHOT` | Punto de control/sincronización | (vacío) |
| `MOVE_ENTITY` | Mover entidad entre zonas | `{ cardId, from, to }` |
| `END_TURN` | Finalizar turno | `{ reason? }` |
| `WIN_GAME` | Finalizar partida | `{ winnerId, finalScore, targetScore }` |

## Acciones de Riftbound

Estas acciones son específicas del perfil `riftbound-1v1-v1`:

| Acción | Descripción | Payload típico |
|--------|-------------|----------------|
| `DRAW_TO_FOUR` | Robar cartas hasta tener cuatro | `{ cardId, from, to, targetHandSize }` |
| `BANK_RUNE` | Depositar rune | `{ cardId, runeId, from, to, resourceDelta }` |
| `DEPLOY_UNIT` | Desplegar unidad (alias semántico) | `{ cardId, from, to }` |
| `CAST_SPELL` | Lanzar hechizo | `{ cardId, from, to, targetId?, targetFrom?, targetTo? }` |
| `SCORE_BATTLEFIELDS` | Puntuación de battlefields | `{ controlledBattlefields, pointsGained, fromScore, toScore, targetScore }` |

## Definir Acciones Custom

Para crear acciones para tu propio TCG, usa el tipo genérico:

```typescript
import { createReplayAction } from '@manaflow/types';

const action = createReplayAction({
  type: 'MI_ACCION_CUSTOM',
  playerId: 'player1',
  payload: {
    cardId: 'card_1',
    from: 'hand',
    to: 'board'
  }
});
```

O define el tipo formalmente:

```typescript
import type { ReplayActionBase } from '@manaflow/types';

interface MiAccionPayload {
  cardId: string;
  from: string;
  to: string;
}

type MiAccion = ReplayActionBase<'MI_ACCION_CUSTOM', MiAccionPayload>;
```

## Ver también

- [Schema del replay](./replay-schema.md)
- [Schema del formato](./format-schema.md)
- [Añadir un nuevo TCG](../guide/add-new-tcg.md)
