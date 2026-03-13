# Arquitectura de Manaflow

Esta guía explica el flujo de datos y cómo los paquetes se conectan para construir un reproductor de repeticiones.

## Flujo de datos

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Replay JSON  │ ──► │   ReplayEngine   │ ──► │  GameSnapshot  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│      UI         │ ◄── │   React/Vue      │ ◄── │   ReplayStore   │
│  (ReplayPlayer) │     │   Components     │     └─────────────────┘
└─────────────────┘     └──────────────────┘              │
                            │                              │
                            ▼                              ▼
                     ┌──────────────────┐         ┌─────────────────┐
                     │      Visor       │         │  HTML/Phaser    │
                     │  (RendererAdapter)│         │    Renderer    │
                     └──────────────────┘         └─────────────────┘
```

## Paquetes y sus responsabilidades

| Paquete | Responsabilidad |
|---------|----------------|
| `@manaflow/types` | Define los tipos centrales: `Card`, `GameSnapshot`, `ReplayEvent`, `RendererAdapter` |
| `@manaflow/core` | Carga, valida y navega repeticiones (`ReplayEngine`) |
| `@manaflow/replay-runtime` | Store/controlador agnóstico de framework para estado y suscripción |
| `@manaflow/react` | Componentes React: `ReplayPlayer`, `ReplayViewport`, `ReplayControls` |
| `@manaflow/vue` | Componentes Vue equivalentes |
| `@manaflow/html-visor` | Renderizador HTML/CSS |
| `@manaflow/phaser-visor` | Renderizador Phaser.js |

## Conceptos clave

### GameSnapshot

Estado inmutable del juego en un momento específico:

```ts
interface GameSnapshot {
  id: string;
  players: PlayerState[];
  currentPlayer: string;
  turn: number;
  entities: Record<string, GameEntity>;
  zones: Record<string, string[]>;
  metadata: SnapshotMetadata;
}
```

### ReplayFrame

Un frame contiene el snapshot más el evento que lo generó:

```ts
interface ReplayFrame {
  index: number;
  event?: ReplayEvent;
  snapshot: GameSnapshot;
}
```

### RendererAdapter

Interfaz que los visores implementan para renderizar snapshots:

```ts
interface RendererAdapter {
  mount(container: HTMLElement): void;
  render(snapshot: GameSnapshot): void;
  highlight(eventId: string): void;
  destroy(): void;
}
```

## Guía de decisión

| Necesidad | Paquete a usar |
|-----------|----------------|
| Cargar un replay desde JSON/YAML | `@manaflow/core` |
| Navegar entre frames (next/back/seek) | `@manaflow/replay-runtime` |
| UI completa con controles | `@manaflow/react` |
| UI personalizada con componentes | `@manaflow/react` (hooks + componentes sueltos) |
| Renderizado HTML personalizado | `@manaflow/html-visor` |
| Renderizado Phaser | `@manaflow/phaser-visor` |
| Integración Vue | `@manaflow/vue` |

## Siguiente paso

- [Quick start en React](guide/getting-started.md)
- [Ejemplos de código](examples/index.md)
