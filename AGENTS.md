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

---

# Manaflow Instruction Guide

Manaflow is a Typescript library for visualizing plays and matches of TCGs. The objective is having an agnostic and customizable library to render a step-by-step play defined by one or multiple config files.

## 1. Core Concepts

### Architecture Philosophy
Manaflow follows a decoupled architecture separating game logic from visualization layers:
- **Core Package**: Handles game state, rules, and business logic
- **Visor Packages**: Render game state using different technologies (Phaser, HTML)
- **Wrapper Packages**: Provide framework-specific components (React, Vue)

### Package Ecosystem Map
```
manaflow/
├── packages/core/          # Game engine & state management
├── packages/phaser-visor/  # Phaser.js visualization
├── packages/html-visor/    # HTML/CSS visualization
├── packages/react/         # React wrapper components
├── packages/vue/           # Vue wrapper components
└── packages/webpack-plugin/ # Build tool integration
```

### Data Flow Diagram
```
[GameEngine] → (GameState) → [Visor] → [DOM/UI]
     ↑                              ↓
[GameActions] ← [User Input] ← [Wrapper Components]
```

## 2. Core Package

### Game State Management API
```typescript
interface GameState {
    players: Player[];
    currentPlayer: number;
    phase: 'draw' | 'main' | 'combat' | 'end';
    turn: number;
}

interface Player {
    id: string;
    name: string;
    health: number;
    mana: { current: number; max: number };
    hand: Card[];
    deck: Card[];
    board: Card[];
}

class GameEngine {
    constructor(initialState: GameState)
    getState(): GameState
    dispatch(action: GameAction): void
}
```

### Card System Implementation
```typescript
interface Card {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: 'unit' | 'spell' | 'artifact';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    abilities: string[];
}

type GameAction =
    | { type: 'DRAW_CARD'; playerId: string }
    | { type: 'PLAY_CARD'; playerId: string; cardId: string }
    | { type: 'END_TURN' };
```

### Rule Engine Configuration
- Game phases follow sequence: draw → main → combat → end
- Players alternate turns after END_TURN action
- Cards move from hand/board based on game actions

### Event System Documentation
- Actions dispatched via `gameEngine.dispatch(action)`
- State changes propagate to visualization layers
- Custom events can be added through GameEngine extensions

## 3. Visualization Layers (Visors)

### Phaser Visor
```typescript
class PhaserVisualization {
    constructor(scene: Phaser.Scene)
    renderCard(card: Card, x: number, y: number): void
    removeCard(cardId: string): void
    updateCardPosition(cardId: string, x: number, y: number): void
    destroy(): void
}
```

**Scene Configuration:**
- Initialize with `new PhaserVisualization(scene)`
- Card sprites use 'card' texture (100x140px default)
- Position updates handled via `updateCardPosition`

**Custom Asset Pipeline:**
- Add card textures to Phaser loader
- Extend `PhaserCard` interface for custom properties

**Animation System:**
- Position animations handled by Phaser tweens
- Custom effects can be added to sprite objects

### HTML Visor
```typescript
class HTMLVisualization {
    constructor(container: HTMLElement)
    renderCard(card: Card, x: number, y: number): void
    removeCard(cardId: string): void
    updateCardPosition(cardId: string, x: number, y: number): void
    destroy(): void
}
```

**CSS Customization Guide:**
- Override `.manaflow-card` styles for theme customization
- Rarity colors: common(#888), rare(#00f), epic(#a0f), legendary(#f80)
- Card dimensions: 100px width × 140px height

**Dynamic Templating:**
- Card content rendered via innerHTML
- Custom templates can be implemented in wrapper packages

**Performance Optimization:**
- Cards use absolute positioning
- Container needs `position: relative`
- Destroy visor when unmounting to prevent memory leaks

## 4. Framework Integration (Wrappers)

### React Component Lifecycle
```typescript
const ManaflowGame: React.FC<ManaflowProps> = ({ gameState, onCardClick }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visualization, setVisualization] = useState<HTMLVisualization | null>(null);

    useEffect(() => {
        if (containerRef.current && !visualization) {
            const visor = new HTMLVisualization(containerRef.current);
            setVisualization(visor);
        }
    }, [containerRef, visualization]);

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '800px' }}>
            {/* Game UI elements */}
        </div>
    );
};
```

### Vue Reactive Bindings
- Initialize visor in `onMounted` hook
- Watch for `gameState` changes to update visualization
- Clean up in `onBeforeUnmount`

### State Synchronization Patterns
- Visor expects complete game state on updates
- Hand cards positioned at y=500 with 120px spacing
- Board cards positioned at y=300 with 120px spacing
- Always rebuild visualization on state change

## 5. Build System

### Webpack Plugin Configuration
```typescript
// Basic usage
new ManaflowWebpackPlugin({
  visor: 'phaser' // or 'html'
})
```

### Production Optimization Flags
- Core package uses tsup for tree-shaking
- Visor packages use Vite for code splitting
- Enable `minimize: true` in Vite config

### Custom Bundle Profiles
- `phaser` bundle includes Phaser.js (~800KB)
- `html` bundle is lightweight (~10KB)
- Wrapper packages bundle framework-specific code

## 6. Development Workflows

### Monorepo Management (pnpm)
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build

# Development server
pnpm --filter phaser-visor dev

# Test all packages
pnpm -r test
```

### Testing Matrix
- Core: Vitest with unit tests
- Wrappers: React Testing Library/Vue Test Utils
- Visors: jsdom environment for DOM tests

### Live Debugging Techniques
- Log game actions via `console.log` in GameEngine
- Inspect visor state with `visualization.getState()`
- Use React DevTools for wrapper debugging

## 7. API Reference

### Type Definitions Catalog
```typescript
// Core types (from @manaflow/core)
Card, GameState, Player, GameAction, GameEngine

// Visor types  
PhaserCard, PhaserVisualization, HTMLVisualization

// Wrapper types
ManaflowGameProps, ManaflowCardProps
```

### Extension Points
- Override `GameEngine.dispatch()` for custom rules
- Extend visor classes for custom rendering
- Add new card types through type augmentation

## 8. Contributions

### Architecture Decision Records
- Decoupled visualization allows multiple rendering backends
- Immutable state propagation for predictable updates
- Component-based architecture for maintainability

### Performance Benchmarks
- HTML Visor: ~1000 cards at 60fps
- Phaser Visor: ~500 cards at 60fps
- React Wrapper: ~16ms render time for full state

### Visual Regression Testing
- Use Percy or similar for screenshot comparisons
- Test across different viewport sizes
- Validate card rendering at different zoom levels