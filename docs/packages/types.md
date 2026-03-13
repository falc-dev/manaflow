# @manaflow/types

Contratos canonicos compartidos por todos los paquetes.

## Para que sirve

Define el modelo de dominio (snapshots, eventos, entidades, zonas y renderer adapters).

## Exports clave

- Tipos de dominio: `Card`, `CardInstance`, `GameEntity`, `GameSnapshot`, `PlayerState`
- Replay: `ReplayEvent`, `ReplayFrame`, `ReplayData`, `ReplayFrameInput`
- Replay formato hibrido: `ReplayFormatRef`, `ReplayFormatOverrides`
- Formato: `GameFormat`, `GameFormatPlayers`, `GameFormatPhase`, `GameFormatZone`, `GameFormatZoneGroup`
- Contrato de renderer: `RendererAdapter`
- Helpers: `createCardComponent`, `createSnapshotId`

## Uso rapido

```ts
import type { GameSnapshot, RendererAdapter } from '@manaflow/types';

function renderSnapshot(renderer: RendererAdapter, container: HTMLElement, snapshot: GameSnapshot) {
  renderer.mount(container);
  renderer.render(snapshot);
}
```

## Build

```bash
pnpm --filter @manaflow/types build
```
