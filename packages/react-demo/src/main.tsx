import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createReactReplayStore,
  loadDemoReplay,
  ReplayPlayer,
  ReplayViewportCardRenderContext,
  ReplayViewportZoneConfig,
  ReactReplayState,
  ReactReplayStore,
  useReplayStore
} from '@manaflow/react';
import '@manaflow/react/styles.css';
import './main.css';

interface MovementInfo {
  cardId: string;
  from: string;
  to: string;
}

const ZONES: ReplayViewportZoneConfig[] = [
  { id: 'hand', title: 'Hand' },
  { id: 'board', title: 'Battle Zone' },
  { id: 'graveyard', title: 'Graveyard' },
  { id: 'deck', title: 'Deck' },
  { id: 'stack', title: 'Stack' }
];

function getPlayerName(state: ReactReplayState, playerId: string | undefined): string {
  if (!playerId) {
    return 'System';
  }
  return state.frame.snapshot.players.find((player) => player.id === playerId)?.name ?? playerId;
}

function getMovement(state: ReactReplayState): MovementInfo | null {
  const payload = state.frame.event?.action.payload;
  if (!payload) {
    return null;
  }

  const cardId = payload.cardId;
  const from = payload.from;
  const to = payload.to;

  if (typeof cardId !== 'string' || typeof from !== 'string' || typeof to !== 'string') {
    return null;
  }

  return {
    cardId,
    from,
    to
  };
}

function getCardName(state: ReactReplayState, entityId: string | undefined): string {
  if (!entityId) {
    return 'a card';
  }
  const entity = state.frame.snapshot.entities[entityId];
  const card = entity?.components.find((component) => component.componentType === 'CARD')?.metadata as
    | { name?: string }
    | undefined;
  return card?.name ?? entityId;
}

function getEventExplanation(state: ReactReplayState): { title: string; detail: string } {
  const event = state.frame.event;
  if (!event) {
    return {
      title: 'Initial Snapshot',
      detail:
        'Frame 0 muestra el estado base del replay. Avanza para ver movimientos de cartas y cambios de fase renderizados por el store.'
    };
  }

  const movement = getMovement(state);
  const playerName = getPlayerName(state, event.playerId);
  const actionType = event.action.type;

  if (actionType === 'DRAW_CARD' && movement) {
    return {
      title: 'Deck -> Hand',
      detail: `${playerName} roba ${getCardName(state, movement.cardId)} desde ${movement.from} hacia ${movement.to}.`
    };
  }

  if (actionType === 'PLAY_CARD' && movement) {
    return {
      title: 'Hand -> Battle Zone',
      detail: `${playerName} juega ${getCardName(state, movement.cardId)} desde ${movement.from} hacia ${movement.to}.`
    };
  }

  if (actionType === 'DESTROY_CARD' && movement) {
    return {
      title: 'Battle Zone -> Graveyard',
      detail: `${getCardName(state, movement.cardId)} sale de ${movement.from} y se mueve a ${movement.to}.`
    };
  }

  if (actionType === 'END_TURN') {
    return {
      title: 'Turn Management',
      detail: `${playerName} termina turno y el replay actualiza jugador/phase sin mutaciones ocultas.`
    };
  }

  return {
    title: actionType,
    detail: `Evento ${event.id} aplicado en timestamp ${event.timestamp}.`
  };
}

function DemoExperience({ store }: { store: ReactReplayStore }) {
  const state = useReplayStore(store);
  const [playing, setPlaying] = useState(false);

  const movement = getMovement(state);
  const eventExplanation = getEventExplanation(state);
  const activeCardId = movement?.cardId;

  const movementClassName = movement
    ? `demo-replay--move-${movement.from.toLowerCase()}-${movement.to.toLowerCase()}`
    : 'demo-replay--idle';

  const timelineAction = state.frame.event?.action.type ?? 'SETUP';

  const renderCard = ({ entityId, card }: ReplayViewportCardRenderContext) => {
    const isActive = entityId === activeCardId;
    return (
      <article className={`demo-card${isActive ? ' demo-card--active' : ''}`}>
        <div className="demo-card__name">{card?.name ?? entityId}</div>
        <div className="demo-card__meta">Cost {card?.cost ?? '-'} · {card?.rarity ?? 'unknown'}</div>
        {isActive ? <div className="demo-card__badge">Moving</div> : null}
      </article>
    );
  };

  return (
    <section className="demo-layout" aria-label="React replay demo avanzada">
      <aside className="demo-panel">
        <h2 className="demo-panel__title">React Demo</h2>
        <p className="demo-panel__subtitle">Demo guiada sobre APIs headless + componentes UI</p>

        <div className="demo-panel__group">
          <h3 className="demo-panel__group-title">Frame actual</h3>
          <p className="demo-panel__frame">Frame {state.frame.index + 1} / {state.totalFrames}</p>
          <p className="demo-panel__event-title">{eventExplanation.title}</p>
          <p className="demo-panel__event-detail">{eventExplanation.detail}</p>
        </div>

        <div className="demo-panel__group">
          <h3 className="demo-panel__group-title">Key moments</h3>
          <div className="demo-panel__actions">
            <button type="button" className="demo-panel__chip" onClick={() => store.seek(0)}>
              Setup
            </button>
            <button type="button" className="demo-panel__chip" onClick={() => store.seek(1)}>
              Hand {'->'} Battle
            </button>
            <button type="button" className="demo-panel__chip" onClick={() => store.seek(3)}>
              Deck {'->'} Hand
            </button>
            <button type="button" className="demo-panel__chip" onClick={() => store.seek(5)}>
              Board {'->'} Graveyard
            </button>
            <button type="button" className="demo-panel__chip" onClick={() => store.seek(state.totalFrames - 1)}>
              Final state
            </button>
          </div>
        </div>

        <div className="demo-panel__group">
          <h3 className="demo-panel__group-title">APIs en uso</h3>
          <ul className="demo-panel__list">
            <li>`createReactReplayStore` para runtime determinista</li>
            <li>`useReplayStore` para explicaciones sincronizadas</li>
            <li>`ReplayPlayer` con render custom de cartas/zonas</li>
            <li>Control de autoplay desde props (`playing`)</li>
          </ul>
        </div>
      </aside>

      <div className="demo-board">
        <ReplayPlayer
          store={store}
          className={`demo-replay ${movementClassName}`}
          playing={playing}
          onPlayingChange={setPlaying}
          autoplayIntervalMs={900}
          zones={ZONES}
          timelineFormatter={(snapshot) =>
            `Turn ${snapshot.turn} · ${snapshot.currentPhase} · ${getPlayerName(state, snapshot.currentPlayer)} · ${timelineAction}`
          }
          renderZoneTitle={({ zone, entityIds }) => {
            const isSource = movement?.from === zone.id;
            const isTarget = movement?.to === zone.id;
            return (
              <div className="demo-zone-title">
                <span>{zone.title}</span>
                <span className="demo-zone-title__count">{entityIds.length}</span>
                {isSource ? <span className="demo-zone-title__flow demo-zone-title__flow--from">from</span> : null}
                {isTarget ? <span className="demo-zone-title__flow demo-zone-title__flow--to">to</span> : null}
              </div>
            );
          }}
          renderCard={renderCard}
        />
      </div>
    </section>
  );
}

function App() {
  const [store, setStore] = useState<ReactReplayStore | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let disposed = false;
    let activeStore: ReactReplayStore | null = null;

    const bootstrap = async () => {
      try {
        const replay = await loadDemoReplay('/replay.demo.json');
        activeStore = createReactReplayStore(replay);
        if (disposed) {
          activeStore.destroy();
          return;
        }
        setStore(activeStore);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!disposed) {
          setError(`Failed to load replay demo: ${message}`);
        }
      }
    };

    void bootstrap();

    return () => {
      disposed = true;
      activeStore?.destroy();
    };
  }, []);

  const content = useMemo(() => {
    if (error) {
      return (
        <p className="error" role="alert">
          {error}
        </p>
      );
    }

    if (!store) {
      return <p className="replay-player replay-player--loading">Loading replay...</p>;
    }

    return <DemoExperience store={store} />;
  }, [error, store]);

  return content;
}

const app = document.getElementById('app');
if (!app) {
  throw new Error('Missing required DOM node: #app');
}

createRoot(app).render(<App />);
