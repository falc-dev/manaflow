# Ejemplos

Coleccion de ejemplos practicos para integrar Manaflow en distintos niveles.

## Flujo base

- [Crear y navegar un replay con @manaflow/core](./core-replay)
- [Usar store agnostico con @manaflow/replay-runtime](./runtime-store)

## UI e integraciones

- [Renderizar un player con @manaflow/react](./react-player)
- [Player y controlador con @manaflow/vue](./vue-controller)
- [Renderer HTML personalizable con @manaflow/html-visor](./html-visor-custom)

### Variantes recomendadas en React

- Modo simple: `ReplayPlayer` con `showTimeline` para tener controles + timeline + viewport en un solo componente.
- Modo duelo: `ReplayDuelLayout` para top/bottom players + objetivo central + stack configurable.
- Modo avanzado: composicion `ReplayControls` + `ReplayTimeline` + `ReplayViewport` para layout totalmente custom.
