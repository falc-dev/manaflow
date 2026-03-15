# Troubleshooting

Guía para resolver problemas comunes al usar Manaflow.

## Errores de Validación

### "zones is required"

**Problema**: El snapshot no tiene la propiedad `zones`.

**Solución**: Asegúrate de que cada snapshot tenga un objeto `zones`:

```json
{
  "zones": {
    "hand_p1": [],
    "board_p1": []
  }
}
```

---

### "rulesProfile is required"

**Problema**: Falta `metadata.rulesProfile`.

**Solución**: Añade el perfil de reglas:

```json
{
  "metadata": {
    "rulesProfile": "basic-1v1-v1"
  }
}
```

Perfiles disponibles:
- `basic-1v1-v1` - Genérico 1v1
- `riftbound-1v1-v1` - Riftbound
- `team-2v2-v1` - 2v2 equipo

---

### "Invalid action type"

**Problema**: El tipo de acción no está en el catálogo.

**Solución**: Usa acciones del catálogo conocido:

```json
{
  "type": "MOVE_ENTITY"
}
```

O usa una acción personalizada:

```json
{
  "type": "MI_ACCION_PERSONALIZADA"
}
```

---

### "missing_keys" en Zod

**Problema**: Faltan propiedades requeridas en el snapshot.

**Solución**: Verifica que el snapshot tenga todos los campos obligatorios:

```json
{
  "id": "partida-001",
  "players": [],
  "currentPhase": "MAIN",
  "currentPlayer": "p1",
  "turn": 1,
  "entities": {},
  "zones": {},
  "metadata": {}
}
```

---

## Problemas de Rendering

### Las cartas no se muestran

**Causa 1**: Las entidades no tienen el componente `CARD`.

**Solución**:

```json
{
  "entities": {
    "carta_1": {
      "id": "carta_1",
      "type": "card",
      "components": [
        {
          "componentType": "CARD",
          "entityId": "carta_1",
          "metadata": { "name": "Mi Carta" }
        }
      ]
    }
  }
}
```

**Causa 2**: Las cartas no están en ninguna zona.

**Solución**: Asegúrate de que los entityIds estén en `zones`:

```json
{
  "zones": {
    "hand_p1": ["carta_1"]
  }
}
```

---

### View transitions no funcionan

**Problema**: Las animaciones de transición no aparecen.

**Causa**: View transitions solo funcionan en Chrome/Edge.

**Solución**: El replay funciona sin animaciones en otros navegadores.

Para deshabilitar explícitamente:

```tsx
<ReplayPlayer store={store} viewTransitions={false} />
```

---

### Zonas no aparecen en el viewport

**Causa**: Las zonas no coinciden entre el replay y la configuración del visor.

**Solución**: Especifica las zonas en el componente:

```tsx
<ReplayPlayer 
  store={store} 
  zones={[
    { id: 'hand_p1', title: 'Mi Mano' },
    { id: 'board_p1', title: 'Mi Tablero' }
  ]}
/>
```

---

## Problemas de Types

### "Cannot find module '@manaflow/core'"

**Solución**: Asegúrate de que el paquete esté instalado:

```bash
npm install @manaflow/core
```

Y que tu `tsconfig.json` tenga:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

---

### Duplicate exports (TS2484)

**Error:** `Duplicate identifier 'Foo'`

**Causa:** Usar tanto `export interface Foo` como `export type { Foo }`.

**Solución:** Usar solo una forma:

```ts
// ✅ Correcto
export interface Foo {}

// ❌ Evitar
export type { Foo };
```

---

### Boolean type inference

**Error:** TypeScript infiere `string | boolean`.

**Solución:** Usar `!!` para forzar boolean:

```ts
const hidden = visibility === 'hidden' || !!isOwnerHidden;
```

---

## Problemas de Build

### Build completo limpio

```bash
# Eliminar dist y cache
rm -rf packages/*/dist packages/*/tsconfig.tsbuildinfo

# Reconstruir todo
pnpm -r build
```

### Ver qué paquete falla

```bash
pnpm -r build 2>&1 | grep -E "(error|failed|ERR_)"
```

### Missing symlinks en workspace

**Error:** Paquete no se resuelve.

**Solución:** Añadir dependencia explícitamente:

```bash
pnpm add @manaflow/types -w
```

---

## Problemas de React

### "Store is not defined"

**Causa**: Olvidaste pasar el store al componente.

**Solución**:

```tsx
import { createReactReplayStore } from '@manaflow/react';

const store = createReactReplayStore(replayData);

function App() {
  return <ReplayPlayer store={store} />;
}
```

---

### El componente no se actualiza

**Causa**: Usando el store incorrectamente.

**Solución**: Usa el hook `useReplayStore`:

```tsx
import { useReplayStore } from '@manaflow/react';

function MyComponent({ store }) {
  const state = useReplayStore(store);
  // Ahora el componente se actualiza con los cambios
}
```

---

## Problemas de Performance

### Replay lento con muchas cartas

**Solución**: Usa memoización en los componentes:

```tsx
const Card = memo(function Card({ entity }) {
  return <div>{entity.name}</div>;
});
```

---

### Memory leak al unmount

**Causa**: No se limpió el store.

**Solución**: Limpia en el cleanup del efecto:

```tsx
useEffect(() => {
  const unsubscribe = store.subscribe(handleChange);
  return () => unsubscribe();
}, [store]);
```

---

## Debugging

### Cómo validar tu replay

```ts
import { validateReplayJson } from '@manaflow/core';

const result = validateReplayJson(jsonString, {
  normalizeRiftboundAliases: true
});

if (!result.ok) {
  console.log('Errores:', result.issues);
}
```

### Cómo inspeccionar el estado

```tsx
import { useReplayStore } from '@manaflow/react';

function DebugPanel({ store }) {
  const state = useReplayStore(store);
  
  return (
    <pre>
      {JSON.stringify(state, null, 2)}
    </pre>
  );
}
```

---

## Obtener ayuda

Si el problema persiste:

1. Busca en [issues de GitHub](https://github.com/anomalyco/manaflow/issues)
2. Revisa los ejemplos en `packages/react-demo/src/examples/`
3. Consulta la [documentación de referencia](../reference/index.md)
