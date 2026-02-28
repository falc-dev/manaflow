# @manaflow/react-demo

Aplicacion demo ejecutable para validar `@manaflow/react` en navegador con una partida inspirada en Riftbound.

## Para que sirve

- Probar controles de replay y viewport en desarrollo
- Ver flujo de partida estilo Riftbound (draw hasta 4, runes, despliegue, scoring por battlefields)
- Validar layout tipo playmat 1v1 con dos grids (arriba/abajo) y banda central de battlefields
- Revisar render personalizado de cartas/zonas, control de lane y explicaciones por frame
- Validar timeline y autoplay/manual step en una secuencia de partida completa
- Probar modo visual guiado/detallado para onboarding
- Verificar skin oficial reusable (`replay-skin-official`) como clase opcional
- Ver errores de validacion de replay por campo en la UI del demo

## Comandos

```bash
pnpm --filter @manaflow/react-demo dev
pnpm --filter @manaflow/react-demo build
pnpm --filter @manaflow/react-demo preview
```

## Notas

- Importa estilos de `@manaflow/react/styles.css` en `src/main.tsx`.
- El CSS local del demo vive en `src/main.css`.
- El demo compone una superficie custom de doble playmat usando `useReplayStore`.
- El replay vive en `public/replay.demo.json` y usa metadata de puntuacion/control para la UI lateral.
- Estructura recomendada del replay Riftbound 1v1: [`/docs/examples/riftbound-replay-format.md`](/examples/riftbound-replay-format).
