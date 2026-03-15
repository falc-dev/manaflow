# Schema del Replay (v1)

Guia practica del contrato JSON de replay de Manaflow y convenciones recomendadas para modelar acciones.

## Estructura base

```json
{
  "$schema": "../../schemas/replay.schema.json",
  "schemaVersion": 1,
  "formatRef": { "formatId": "riftbound-1v1-v1" },
  "formatOverrides": {
    "zones": {
      "battlefield_mid": {
        "id": "battlefield_mid",
        "ownerId": "shared",
        "kind": "board",
        "visibility": "public",
        "label": "Battlefield Mid"
      }
    }
  },
  "initialState": { "...snapshot..." },
  "events": [
    {
      "event": { "...event + action..." },
      "snapshot": { "...snapshot resultante..." }
    }
  ]
}
```

Campos obligatorios:

- `schemaVersion`: version estable del contrato (`1`).
- `initialState`: estado inicial completo.
- `events[]`: frames ordenados (evento aplicado + snapshot resultante).

Campos opcionales nuevos:

- `formatRef`: referencia a un formato compartido (por `formatId`).
- `formatOverrides`: overrides parciales aplicados sobre el formato base.

## Sistema de Perfiles

Manaflow usa un sistema de **perfiles de reglas** que define la estructura esperada para cada TCG:

- **Registro**: Los perfiles se registran con `profileRegistry.register(profile)`
- **Validación**: `validateReplayProfile()` valida contra el perfil registrado
- **Extensible**: Cualquier TCG puede añadir su propio perfil

Ver [Añadir nuevo TCG](../guide/add-new-tcg.md) para crear perfiles custom.

### Perfil por defecto

El perfil `riftbound-1v1-v1` se registra automáticamente e incluye validaciones específicas para Riftbound.

Reglas adicionales en `schemaVersion: 1` (hardening actual):

- `snapshot.metadata.rulesProfile` es obligatorio.
- Para acciones conocidas (`MOVE_ENTITY`, `CAST_SPELL`, etc.) el payload debe cumplir su contrato tipado.

## Formato separado (zonas/fases)

El formato de juego (zonas, fases, slots de jugadores) puede vivir en un archivo separado con su propio schema. Ver: [Schema del formato (v1)](./format-schema).

Modo hibrido:

- `formatRef` apunta al formato base.
- `formatOverrides` permite agregar o ajustar zonas, fases o jugadores para este replay.
- El replay sigue siendo autocontenido (mantiene `zones` y `zoneMeta`), pero el formato sirve como fuente canonica para la UI/validacion.

### Ejemplo hibrido (replay)

```json
{
  "$schema": "../../schemas/replay.schema.json",
  "schemaVersion": 1,
  "formatRef": { "formatId": "riftbound-1v1-v1", "schemaVersion": 1 },
  "formatOverrides": {
    "zones": {
      "battlefield_mid": {
        "id": "battlefield_mid",
        "ownerId": "shared",
        "kind": "board",
        "visibility": "public",
        "label": "Battlefield Mid"
      }
    }
  },
  "initialState": { "...snapshot..." },
  "events": []
}
```

## Snapshot (resumen)

Cada `snapshot` mantiene estado completo:

- `id`
- `players[]`
- `currentPhase`
- `currentPlayer`
- `turn`
- `entities`
- `zones`
- `zoneMeta` (opcional)
- `metadata`

`metadata` debe incluir como minimo:

- `rulesProfile` (string), por ejemplo `riftbound-1v1-v1`.

Campos opcionales nuevos recomendados:

- `zoneMeta`: metadata por zona (`ownerId`, `visibility`, `kind`, `label`, `capacity`).
- `entity.state`: estado estandar (tapped/exhausted/faceDown, damage, counters, attachments).
- `player.counters`: contadores por jugador (prize, gig dice, puntos).

## Eventos y acciones

Cada frame contiene:

```json
{
  "event": {
    "id": "evt_3",
    "action": {
      "type": "MOVE_ENTITY",
      "playerId": "blue",
      "payload": {
        "cardId": "blue_sniper",
        "from": "battlefield_south",
        "to": "battlefield_north"
      },
      "timestamp": 2500
    },
    "timestamp": 2500,
    "playerId": "blue",
    "metadata": {
      "phase": "MAIN",
      "intent": "pressure-lane",
      "summary": "Blue repositions sniper to north lane"
    }
  },
  "snapshot": { "...estado completo tras aplicar la accion..." }
}
```

`event.metadata` admite campos estandar opcionales para UX (`phase`, `intent`, `summary`) y campos extra de dominio.

Campos UX extra recomendados:

- `focusZones`: array de zonas relevantes al evento (para resaltar).
- `actionWindow`: etiqueta de ventana de acciones (ej. `MAIN`, `COMBAT`, `REACTION`).
- `priorityPlayerId`: jugador con prioridad/turno en esa ventana.

## Simplificación recomendada de acciones

Para mantener replays legibles y reusables entre juegos/perfiles:

- Usa **acciones genéricas** para operaciones universales (`MOVE_ENTITY`).
- Reserva acciones de dominio (`CAST_SPELL`, `BANK_RUNE`) cuando aporten semántica real.
- Mantén campos de payload estables (`cardId`, `from`, `to`) para facilitar timeline, focus zones y animaciones.

### Propuesta mínima

- `MOVE_ENTITY`: mover entidad entre zonas.
- `END_TURN`: cerrar turno.
- `SCORE_BATTLEFIELDS` (o equivalente): aplicar puntuación objetivo.
- `WIN_GAME`: cierre de partida.

Puedes conservar acciones específicas (`DEPLOY_UNIT`, `CAST_SPELL`) como alias semánticos si tu UI las aprovecha.

## Ejemplos cortos

### 1) Movimiento genérico entre zonas

```json
{
  "type": "MOVE_ENTITY",
  "playerId": "blue",
  "payload": {
    "cardId": "blue_sniper",
    "from": "battlefield_south",
    "to": "battlefield_north"
  },
  "timestamp": 2500
}
```

### 2) Acción específica con objetivo

```json
{
  "type": "CAST_SPELL",
  "playerId": "blue",
  "payload": {
    "cardId": "spell_shockblast",
    "from": "hand",
    "to": "trash_blue",
    "targetId": "red_bruiser",
    "targetFrom": "battlefield_north",
    "targetTo": "trash_red"
  },
  "timestamp": 3000
}
```

### 3) Cierre de partida

```json
{
  "type": "WIN_GAME",
  "playerId": "blue",
  "payload": {
    "winnerId": "blue",
    "finalScore": { "blue": 8, "red": 7 },
    "targetScore": 8
  },
  "timestamp": 5000
}
```

## IntelliSense en JSON

Con `"$schema"` y el mapping de `.vscode/settings.json`, VS Code ofrece:

- autocompletado de propiedades
- validación en vivo
- documentación en hover (`description`, `markdownDescription`, `examples`)
