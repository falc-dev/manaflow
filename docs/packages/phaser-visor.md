# @manaflow/phaser-visor

Adapter de render para Phaser.

## Para que sirve

Permite usar snapshots de Manaflow dentro de una escena Phaser-like a traves del contrato `RendererAdapter`.

## Export clave

- `PhaserRendererAdapter`

## Ejemplo

```ts
import { PhaserRendererAdapter } from '@manaflow/phaser-visor';

const renderer = new PhaserRendererAdapter(scene);
renderer.mount(container);
renderer.render(snapshot);
renderer.highlight('event_1');
renderer.destroy();
```

## Notas

- Si `scene.add.text` no existe, escribe un fallback textual en el contenedor.
- Renderiza timeline y conteo por zonas (`hand`, `board`, `graveyard`, `deck`, `stack`).

## Build

```bash
pnpm --filter @manaflow/phaser-visor build
```
