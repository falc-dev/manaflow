# Ejemplos

Coleccion de ejemplos practicos para integrar Manaflow en distintos niveles.

## Flujo base

- [Guia paso a paso para replay TCG (Riftbound + Magic)](./tcg-replay-step-by-step)
- [Schema del replay (v1)](./replay-schema)
- [Schema del formato (v1)](./format-schema)
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
