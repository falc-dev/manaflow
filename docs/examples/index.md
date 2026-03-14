# Ejemplos

Coleccion de ejemplos practicos para integrar Manaflow en distintos niveles.

## Para comenzar

**Nuevo en Manaflow?** Empieza aquí:

- [Tutorial: Crear un replay](/tutorials/01-create-replay.md)
- [Tutorial: React básico](/tutorials/02-react-basic.md)
- [Troubleshooting](/guide/troubleshooting.md)

## Flujo base

- [Guia paso a paso para replay TCG (Riftbound + Magic)](./tcg-replay-step-by-step)
- [Referencia: Replay Schema](/reference/replay-schema.md)
- [Referencia: Format Schema](/reference/format-schema.md)
- [Crear y navegar un replay con @manaflow/core](./core-replay)
- [Usar store agnostico con @manaflow/replay-runtime](./runtime-store)

## UI e integraciones

- [Renderizar un player con @manaflow/react](./react-player)
- [Construir ejemplos progresivos de @manaflow/react-demo](./react-demo-step-by-step)
- [Formato de replay para Riftbound 1v1](./riftbound-replay-format)
- [Presets compartibles de zonas y estilos (Riftbound + Magic)](./ui-presets)
- [Player y controlador con @manaflow/vue](./vue-controller)
- [Renderer HTML personalizable con @manaflow/html-visor](./html-visor-custom)

### Variantes recomendadas en React

- Modo simple: `ReplayPlayer` con `showTimeline` para tener controles + timeline + viewport en un solo componente.
- Modo playmat 1v1: composicion custom con dos grids (tapete superior/inferior) y banda central de battlefields.
- Modo avanzado: composicion `ReplayControls` + `ReplayTimeline` + `ReplayViewport` para layout totalmente custom.
