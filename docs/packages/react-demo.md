# @manaflow/react-demo

Aplicacion demo ejecutable para validar el paquete `@manaflow/react` en navegador.

## Para que sirve

- Probar controles de replay y viewport en desarrollo
- Ver estilos y comportamiento de autoplay/manual step
- Revisar render personalizado de cartas/zonas y explicaciones por frame
- Validar transiciones visuales de zonas (`hand -> board`, `deck -> hand`, `board -> graveyard`)

## Comandos

```bash
pnpm --filter @manaflow/react-demo dev
pnpm --filter @manaflow/react-demo build
pnpm --filter @manaflow/react-demo preview
```

## Notas

- Importa estilos de `@manaflow/react/styles.css` en `src/main.tsx`.
- El CSS local del demo vive en `src/main.css`.
