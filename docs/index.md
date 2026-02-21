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
