# Manaflow Agent Instructions

## Project Overview

Manaflow is a TypeScript library for visualizing TCG (Trading Card Game) plays and matches. It provides an agnostic and customizable library to render step-by-step plays defined by config files.

### Package Ecosystem
- `@manaflow/types`: Core type definitions (Card, GameSnapshot, ReplayAction, etc.)
- `@manaflow/core`: Game state management, serialization, validation
- `@manaflow/game-logic`: Game reducers (tcgReplayReducer)
- `@manaflow/replay-runtime`: Replay controller & store (createReplayController, createReplayStore)
- `@manaflow/phaser-visor`: Phaser.js visualization
- `@manaflow/html-visor`: HTML/CSS visualization
- `@manaflow/react`: React wrapper components
- `@manaflow/vue`: Vue wrapper components
- `@manaflow/react-demo`: Demo application

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

- Manaflow React is designed for **replay visualization**, not real-time game logic.
- Prefer controlled state flow and explicit props over hidden internal mutations.
- Keep components small and composable (`ReplayPlayer`, `ReplayControls`, `ReplayViewport`).
- Use `useSyncExternalStore` for store subscriptions.
- Ensure `getSnapshot` is referentially stable when state does not change.
- Always clean up effects (timers, subscriptions).
- Keep rendering logic separate from data loading logic.

### Replay-Specific Patterns
- Step forward/backward through frames
- Seek to specific timestamp or frame index
- Autoplay with variable speed (0.5x, 1x, 2x, etc.)
- State is immutable - snapshots are replaced, not mutated
- Use selectors for optimized re-renders

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
├── packages/types/            # Core type definitions (Card, GameSnapshot, ReplayAction, etc.)
├── packages/game-logic/       # Game reducers (tcgReplayReducer)
├── packages/replay-runtime/  # Replay controller & store (createReplayController, createReplayStore)
├── packages/phaser-visor/     # Phaser.js visualization
├── packages/html-visor/       # HTML/CSS visualization
├── packages/react/            # React wrapper components
├── packages/react-demo/       # Demo application
├── packages/vue/              # Vue wrapper components
└── packages/webpack-plugin/   # Build tool integration
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
interface GameSnapshot {
    id: string;
    players: PlayerState[];
    currentPlayer: string;
    turn: number;
    entities: Record<string, GameEntity>;
    zones: Record<string, string[]>;
    metadata: SnapshotMetadata;
}

interface PlayerState {
    id: string;
    name: string;
    health: number;
    resources?: ResourceState[];
    hand: string[];
    deck: string[];
    discard: string[];
    zones: Record<string, string[]>;
    metadata?: Record<string, unknown>;
}

interface ResourceState {
    type: string;
    amount: number;
    max?: number;
}

interface SnapshotMetadata extends Record<string, unknown> {
    rulesProfile: string;
    currentPhase?: string;
}
}
```

### Card System Implementation
```typescript
interface Card {
    id: string;
    name: string;
    description: string;
    cost: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    imageUrl?: string;
    metadata?: Record<string, unknown>;
}

type EntityType = 'card' | 'player' | 'marker' | 'token';

interface CardInstance {
    id: string;
    cardId: string;
    ownerId: string;
    controllerId: string;
    tapped?: boolean;
    counters?: Record<string, number>;
    metadata?: Record<string, unknown>;
}

interface GameComponent {
    componentType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
}

interface GameEntity {
    id: string;
    type: EntityType;
    components: GameComponent[];
    owner?: string;
    metadata?: Record<string, unknown>;
}
```

### Replay Action Types
```typescript
type GameAction =
    | { type: 'DRAW_TO_FOUR'; playerId: string; payload: { cardId: string; from: string; to: string; targetHandSize: number } }
    | { type: 'BANK_RUNE'; playerId: string; payload: { cardId: string; runeId: string; from: string; to: string; resourceDelta: number } }
    | { type: 'DEPLOY_UNIT'; playerId: string; payload: { cardId: string; from: string; to: string } }
    | { type: 'MOVE_ENTITY'; playerId: string; payload: { cardId: string; from: string; to: string } }
    | { type: 'REPOSITION_UNIT'; playerId: string; payload: { cardId: string; from: string; to: string } }
    | { type: 'RETREAT_UNIT'; playerId: string; payload: { cardId: string; from: string; to: string } }
    | { type: 'CAST_SPELL'; playerId: string; payload: { cardId: string; from: string; to: string; targetId?: string } }
    | { type: 'END_TURN'; playerId: string; payload: { reason?: string } }
    | { type: 'SCORE_BATTLEFIELDS'; playerId: string; payload: { controlledBattlefields: string[]; pointsGained: number } }
    | { type: 'WIN_GAME'; playerId: string; payload: { winnerId: string; finalScore: Record<string, number> } };
```

### Rule Engine Configuration
- Game phases follow sequence: draw → main → combat → end
- Players alternate turns after END_TURN action
- Cards move from hand/board based on game actions

### Event System Documentation
- Actions dispatched via `gameEngine.dispatch(action)`
- State changes propagate to visualization layers
- Custom events can be added through GameEngine extensions

### Replay Data Structure
```typescript
interface ReplayEvent {
    id: string;
    action: GameAction;
    timestamp: number;
    playerId: string;
    tags?: string[];
    metadata?: {
        phase?: string;
        intent?: string;
        summary?: string;
    };
}

interface ReplayFrame {
    index: number;
    event?: ReplayEvent;
    snapshot: GameSnapshot;
}

interface ReplayData {
    schemaVersion: 1;
    initialState: GameSnapshot;
    events: ReplayFrame[];
}
```

**Rules Profiles:**
- `riftbound-1v1-v1`: Default profile for 1v1 TCG matches
- Custom profiles can be defined via `ACTION_CATALOG_BY_PROFILE`

**JSON Schema:**
- Full schema available at `schemas/replay.schema.json`
- Schema version: `1`

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
// Core types (from @manaflow/types)
Card, CardInstance, GameEntity, GameComponent
GameSnapshot, GameState, PlayerState
GameAction, ReplayAction, KnownReplayActionType
Phase, EntityType, ZoneId, ResourceState
ReplayEvent, ReplayFrame, ReplayData
RulesProfile, SnapshotMetadata

// Replay Runtime (from @manaflow/replay-runtime)
ReplayController, ReplayStore
createReplayController, createReplayStore

// Game Logic (from @manaflow/game-logic)
Reducer, tcgReplayReducer

// Visor types
PhaserVisualization, HTMLVisualization, RendererAdapter

// Helper functions
createReplayAction, getActionCatalog, createCardComponent, createSnapshotId
```

### Extension Points
- Override `GameEngine.dispatch()` for custom rules
- Extend visor classes for custom rendering
- Add new card types through type augmentation
- Implement custom `RendererAdapter` for alternative rendering backends

## 8. Documentation Tools

### VitePress
- Documentation built with VitePress
- Dev server: `pnpm docs:dev`
- Build: `pnpm docs:build`
- Preview: `pnpm docs:preview`

### Documentation Structure
```
docs/
├── guide/         # Getting started guides
├── examples/      # Code examples
├── adr/           # Architecture Decision Records
├── packages/      # Package-specific docs
└── index.md       # Main documentation entry
```

### JSON Schema
- Replay schema at `schemas/replay.schema.json`
- Version: `1` (stable contract)

## Documentation Guidelines

### Folder Structure

```
docs/
├── guide/         # Conceptual guides (architecture, getting started, troubleshooting)
├── tutorials/     # Step-by-step tutorials for newcomers (progressive complexity)
├── reference/    # Technical references (schemas, APIs, catalogs)
├── examples/     # Complete working code examples
├── recipes/      # Practical solutions to common problems
└── packages/    # Per-package documentation
```

### Writing Guidelines

**guide/** - Conceptual explanations
- Why and how things work
- Architecture decisions
- Troubleshooting

**tutorials/** - Progressive learning path
- Start with minimal example
- Build complexity step by step
- Each tutorial should be completable in 10-15 minutes
- Include copy-pasteable code

**reference/** - Technical documentation
- Schemas (JSON/YAML)
- API signatures
- Type definitions
- Keep minimal explanation, maximize precision

**examples/** - Working code
- Complete, runnable examples
- Show real-world integration patterns

**recipes/** - Problem-solution format
- Specific problems users face
- Clear solutions with code

### Naming Conventions

- Use kebab-case: `multiplayer-zones.md`
- Use descriptive titles: `01-create-replay.md` (tutorials)
- Include context in titles: `replay-schema.md` not `schema.md`

### Tutorial Path

Tutorials must follow this progression:
1. `01-create-replay.md` - Create minimal JSON replay (1v1)
2. `02-react-basic.md` - Integrate replay in React
3. `03-custom-ui.md` - Customize cards and zones
4. `04-multiplayer.md` - Handle 2v2, 3v3, NvN formats

### Content Rules

- Each tutorial: max 100 lines + code blocks
- Include prerequisites at top
- Always show complete code snippet user can copy
- End with "Next step" linking to next tutorial
- Reference `reference/` for detailed structure

### Links

- Tutorial to tutorial: `[Tutorial name](01-filename.md)`
- Tutorial to reference: `[Reference name](../reference/filename.md)`
- Any to guide: `[Guide name](../guide/troubleshooting.md)`

## 9. Contributions

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

## 10. Common Build Issues and Solutions

### TypeScript Errors

**Duplicate exports**: Don't use both `export interface Foo` and `export type { Foo }` for the same type - this causes TS2484. Use only the interface export.

**Zod error codes**: Error codes like `missing_keys`, `unrecognized_keys` may vary by Zod version. Check the actual Zod types in `node_modules/zod` rather than assuming specific codes exist.

**CompressionStream types**: The TypeScript lib definitions for `CompressionStream`/`DecompressionStream` may not match browser reality. Use `as any` cast if needed: `new CompressionStream(format as any)`.

**Boolean type inference**: When combining conditions with `&&`, TypeScript may infer `string | boolean` instead of `boolean`. Use `!!` to coerce: `const hidden = visibility === 'hidden' || !!isOwnerHidden`.

### pnpm Workspace Quirks

**Missing symlinks**: If a workspace package fails to resolve, ensure the dependent package explicitly lists it in its own `dependencies`, not just as a transitive dependency. Add missing `workspace:*` dependencies explicitly.

**Stale build artifacts**: If `dist` folder exists but is empty/incomplete, delete it and rebuild: `rm -rf dist && pnpm build`.

**TypeScript caching**: If changes don't appear to take effect, remove `tsconfig.tsbuildinfo`: `rm packages/*/tsconfig.tsbuildinfo`.

### Build Commands

```bash
# Full clean build
rm -rf packages/*/dist packages/*/tsconfig.tsbuildinfo && pnpm -r build

# Check which package is failing
pnpm -r build 2>&1 | grep -E "(error|failed|ERR_)"
```