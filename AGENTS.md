# Manaflow Agent Instructions

## Product Direction for React Packages

Use a dual API strategy:

1. Headless foundation in `@manaflow/react`
- Expose replay state/store/hooks as the core contract.
- Keep logic deterministic and UI-agnostic.
- Avoid imperative DOM UI builders as primary public API.

2. UI layer as reusable components
- Provide installable React components that consume the headless APIs.
- Components must be customizable through props (`className`, callbacks, optional render overrides).
- Keep advanced use-cases possible by exposing hooks/state in parallel.

## Package Boundaries

- `@manaflow/react`: headless APIs + optional thin React hook helpers.
- `@manaflow/react-demo`: example app only. No library-specific business logic should live exclusively here.
- If UI grows, consider a dedicated package (`@manaflow/react-ui`) instead of bloating `@manaflow/react`.

## React Best Practices

- Prefer controlled state flow and explicit props over hidden internal mutations.
- Keep components small and composable (`ReplayPlayer`, `ReplayControls`, `ReplayViewport`).
- Use `useSyncExternalStore` for store subscriptions.
- Ensure `getSnapshot` is referentially stable when state does not change.
- Always clean up effects (timers, subscriptions).
- Keep rendering logic separate from data loading logic.

## CSS Conventions (BEM)

- Do not rely on inline styles for production components.
- Use CSS classes with BEM naming:
  - Block: `replay-player`
  - Elements: `replay-player__controls`, `replay-player__slider`
  - Modifiers: `replay-player--loading`, `replay-controls__button--active`
- Keep CSS colocated with component modules when possible.

## API Design Rules

- Stable API surface:
  - `createReactReplayStore`
  - `useReplayStore`
  - serialization/loading helpers
- Advanced/low-level APIs can remain exported but clearly documented as such.
- Preserve backwards compatibility where feasible; document breaking changes explicitly.

## Testing Expectations

- Headless layer: unit tests for state transitions, seek/step behavior, selector stability.
- Component layer: integration tests for controls, autoplay, and cleanup.
- Demo app: smoke-level checks; avoid treating demo as source of truth for core behavior.

## Documentation Expectations

- Keep `packages/react/README.md` focused on library consumers.
- Keep `packages/react-demo/README.md` focused on running/extending the demo.
- Include examples for both:
  - quick default usage (components)
  - advanced usage (hooks + custom UI)
