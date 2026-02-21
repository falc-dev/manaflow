# @manaflow/webpack-plugin

Plugin base para integraciones de build con Webpack.

## Export

- `ManaflowPlugin`
- `ManaflowPluginOptions`

## Ejemplo

```ts
import { ManaflowPlugin } from '@manaflow/webpack-plugin';

export default {
  plugins: [new ManaflowPlugin({ replayPath: 'replays/demo.json' })]
};
```

## Notas

- Actualmente reporta configuracion via `compilation.warnings` durante `processAssets`.
- Es un scaffold para evolucionar integraciones de pipeline.

## Build

```bash
pnpm --filter @manaflow/webpack-plugin build
```
