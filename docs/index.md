# Manaflow

Motor y visor replay-first para TCGs, organizado como monorepo.

## Paquetes

- `@manaflow/types`: contratos de dominio canónicos.
- `@manaflow/core`: runtime de juego/replay y utilidades de carga.
- `@manaflow/replay-runtime`: store/controlador agnóstico de framework.
- `@manaflow/html-visor`: renderer HTML.
- `@manaflow/phaser-visor`: renderer para Phaser.
- `@manaflow/react`: APIs y helpers para React.
- `@manaflow/react-demo`: app de ejemplo ejecutable.
- `@manaflow/vue`: APIs y helpers para Vue.
- `@manaflow/game-logic`: reducers/reglas compartidas.
- `@manaflow/webpack-plugin`: integración de build.

## Desarrollo local

```bash
pnpm install
pnpm docs:dev
```

## Ejemplos

- Ver seccion completa: [Ejemplos](/examples/)
- Quick links:
  - [Core Replay](/examples/core-replay)
  - [Runtime Store](/examples/runtime-store)
  - [React Player](/examples/react-player)
  - [Vue Controller](/examples/vue-controller)
  - [HTML Visor Custom](/examples/html-visor-custom)

## Documentacion por paquete

- Ver seccion completa: [Paquetes](/packages/)
- Quick links:
  - [@manaflow/types](/packages/types)
  - [@manaflow/core](/packages/core)
  - [@manaflow/replay-runtime](/packages/replay-runtime)
  - [@manaflow/html-visor](/packages/html-visor)
  - [@manaflow/phaser-visor](/packages/phaser-visor)
  - [@manaflow/react](/packages/react)
  - [@manaflow/vue](/packages/vue)
