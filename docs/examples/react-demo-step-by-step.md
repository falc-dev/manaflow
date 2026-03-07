# React Demo: guias paso a paso

Esta guia explica como construir los ejemplos progresivos de `@manaflow/react-demo` que estan en `packages/react-demo/src/examples`.

## Preparacion

1. Instala dependencias en la raiz del monorepo.

```bash
pnpm install
```

2. Lanza el demo de React.

```bash
pnpm --filter @manaflow/react-demo dev
```

3. Abre cada ejemplo por query param:
- `/?example=01-basic-controls`
- `/?example=02-custom-render`
- `/?example=03-timeline-markers`
- `/?example=04-advanced-riftbound`

4. Usa estos archivos como base durante la construccion:
- `packages/react-demo/src/hooks/use-demo-replay.ts`
- `packages/react-demo/src/main.tsx`
- `packages/react-demo/src/examples/riftbound-zones.ts`

## Ejemplo 01: Basic Controls

Archivo de referencia: `packages/react-demo/src/examples/example-01-basic-controls.tsx`

1. Carga el replay JSON con `useDemoReplay('/demo.replay.json')`.
2. Envuelve la UI con `ReplayBootstrapBoundary` para cubrir `loading`, `error`, validacion y `store`.
3. En el render prop de `ReplayBootstrapBoundary`, monta `ReplayPlayer` con:
- `store`
- `zones` (preset de zonas)
- `playbackRateOptions`
4. Verifica que tengas controles + viewport sin codigo adicional.

Resultado: integracion minima de alto nivel con `ReplayPlayer`.

## Ejemplo 02: Custom Render

Archivo de referencia: `packages/react-demo/src/examples/example-02-custom-render.tsx`

1. Reusa el bootstrap del ejemplo 01 (`useDemoReplay` + `ReplayBootstrapBoundary`).
2. Envuelve el arbol en `ManaflowProvider store={store}` para evitar pasar `store` por props en cada componente conectado.
3. Monta `ConnectedReplayControls` para play/pause, step y velocidad.
4. Monta `ConnectedReplayViewport` con `zones`.
5. Personaliza `renderZoneTitle` para mostrar nombre + contador de cartas.
6. Personaliza `renderCard` para tu tarjeta visual (nombre, coste, metadata).

Resultado: estado headless con render totalmente personalizable para zonas/cartas.

## Ejemplo 03: Timeline Markers

Archivo de referencia: `packages/react-demo/src/examples/example-03-timeline-markers.tsx`

1. Reusa la misma base (`ReplayBootstrapBoundary` + `ManaflowProvider`).
2. Obtiene `frameMarkers` desde `useDemoReplay`.
3. Monta `ConnectedReplayTimeline markers={frameMarkers}`.
4. Implementa `renderMarker` para pintar icono, frame y etiqueta semantica.
5. Usa helpers derivados (`getActionGlyph`, `getActionTone`) para consistencia visual.
6. Mantiene `ConnectedReplayControls` y `ConnectedReplayViewport` para controlar y observar el replay.

Resultado: timeline enriquecido con marcadores semanticos y navegacion por frame.

## Ejemplo 04: Advanced Riftbound

Archivo de referencia: `packages/react-demo/src/examples/example-04-advanced-riftbound.tsx`

1. Reusa bootstrap + provider como en ejemplos anteriores.
2. Crea un contenedor de experiencia (`DemoExperience`) para separar layout de carga de datos.
3. Usa `useReplayPlaybackController(store)` para manejar:
- `playing` / `setPlaying`
- `playbackRate` / `setPlaybackRate`
- `state` actual
4. Calcula datos derivados por frame (movimiento, puntuacion, control de battlefields, explicacion de evento) desde utilidades de `replay-derived.ts`.
5. Construye el layout dual playmat:
- zonas del jugador superior
- banda central de battlefields
- zonas del jugador inferior
6. Renderiza tarjetas y zonas con reglas visuales propias (tipos, faccion, origen/destino, carta activa).
7. Anade panel lateral con:
- estado del frame
- score race
- timeline custom
- reglas resumidas
- selector de modo visual
8. Anade onboarding con `ReplayOnboardingLegend` y cierre manual.
9. Conecta controles inferiores con `ConnectedReplayControls` en modo controlado usando el estado de `useReplayPlaybackController`.

Resultado: composicion completa de UI personalizada, manteniendo store y playback deterministas.

## Ruta recomendada de implementacion

1. Implementa primero el ejemplo 01 para validar bootstrap y carga de replay.
2. Migra al ejemplo 02 para introducir provider y callbacks de render.
3. Agrega el ejemplo 03 para timeline semantico y UX de navegacion.
4. Escala al ejemplo 04 cuando necesites layout de producto (playmat, panel, onboarding, score).

## Checklist de calidad

- `ReplayBootstrapBoundary` siempre cubre loading/error/validacion.
- `ManaflowProvider` solo cuando uses componentes conectados.
- Efectos con timers limpios en `useEffect`.
- Toda personalizacion visual en clases CSS, no en estilos inline.
- Mantener separadas: carga de replay, estado derivado, render UI.
