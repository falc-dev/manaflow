import { useEffect, useState } from 'react';
import {
  ConnectedReplayControls,
  ConnectedReplayTimeline,
  ManaflowProvider,
  ReplayBootstrapBoundary,
  ReplayOnboardingLegend,
  ReplayTimelineMarker,
  useManaflowState,
  useManaflowStore,
  useReplayPlaybackController
} from '@manaflow/react';
import { useDemoReplay } from '../hooks/use-demo-replay';
import {
  PlayerZones,
  canonicalizeZoneId,
  getActionGlyph,
  getActionTone,
  getBattlefieldControl,
  getCardFaction,
  getCardType,
  getEventExplanation,
  getFocusZones,
  getMovement,
  getPlayerName,
  getScoreboard,
  getZoneKindLabel,
  normalizeToken,
  pickFirstZone
} from '../replay-derived';

const BATTLEFIELD_ZONE_IDS = ['battlefield_north', 'battlefield_south'] as const;
const PLAYMAT_RULER_MARKS = [8, 7, 6, 5, 4, 3, 2, 1, 0] as const;

function DemoExperience({ frameMarkers }: { frameMarkers: ReplayTimelineMarker[] }) {
  const store = useManaflowStore();
  const { state, playing, setPlaying, playbackRate, setPlaybackRate } = useReplayPlaybackController(store);
  const [isFrameTransitioning, setIsFrameTransitioning] = useState(false);
  const [showBoardGuide, setShowBoardGuide] = useState(true);
  const [visualMode, setVisualMode] = useState<'guided' | 'detailed'>('guided');

  useEffect(() => {
    setIsFrameTransitioning(true);
    const timer = window.setTimeout(() => setIsFrameTransitioning(false), 320);
    return () => window.clearTimeout(timer);
  }, [state.frame.index]);

  const movement = getMovement(state);
  const eventExplanation = getEventExplanation(state);
  const score = getScoreboard(state.frame.snapshot);
  const control = getBattlefieldControl(state.frame.snapshot);
  const currentPlayerName = getPlayerName(state, state.frame.snapshot.currentPlayer);
  const activeCardId = movement?.cardId;
  const focusZones = getFocusZones(state);
  const focusClassName = focusZones.length > 0 ? 'demo-dual-playmat--focus' : '';
  const focusZoneClassNames = focusZones
    .map((zoneId) => `demo-dual-playmat--focus-zone-${normalizeToken(canonicalizeZoneId(zoneId))}`)
    .join(' ');

  const movementClassName = movement
    ? `demo-dual-playmat--move-${normalizeToken(canonicalizeZoneId(movement.from))}-${normalizeToken(canonicalizeZoneId(movement.to))}`
    : 'demo-dual-playmat--idle';

  const timelineAction = state.frame.event?.action.type ?? 'SETUP';

  const getCard = (entityId: string) =>
    state.frame.snapshot.entities[entityId]?.components.find((component) => component.componentType === 'CARD')?.metadata as
      | { name?: string; cost?: number; metadata?: Record<string, unknown> }
      | undefined;

  const renderCard = (entityId: string, zoneId: string) => {
    const card = getCard(entityId);
    const isActive = entityId === activeCardId;
    const cardType = getCardType(card);
    const faction = getCardFaction(card);
    const isRuneZone =
      zoneId === 'runes_blue' ||
      zoneId === 'runes_red' ||
      zoneId === 'rune_deck_blue' ||
      zoneId === 'rune_deck_red';

    return (
      <article
        className={`demo-card demo-card--${cardType} demo-card--${faction}${isRuneZone ? ' demo-card--rune-zone' : ''}${isActive ? ' demo-card--active' : ''}`}
      >
        <div className="demo-card__name">{card?.name ?? entityId}</div>
        <div className="demo-card__meta">
          {cardType.toUpperCase()} · Cost {card?.cost ?? '-'}
        </div>
        {isActive ? <div className="demo-card__badge">Current action</div> : null}
      </article>
    );
  };

  const renderZone = (title: string, zoneId: string, entityIds: string[]) => {
    const isSource = movement ? canonicalizeZoneId(movement.from) === zoneId : false;
    const isTarget = movement ? canonicalizeZoneId(movement.to) === zoneId : false;
    return (
      <section className={`demo-zone demo-zone--${normalizeToken(zoneId)}`} data-zone-id={zoneId}>
        <div className="demo-zone__title">
          <span className="demo-zone__title-main">{title}</span>
          <span className="demo-zone__title-kind">{getZoneKindLabel(zoneId)}</span>
          <span className="demo-zone__count">{entityIds.length}</span>
          {isSource ? <span className="demo-zone__flow demo-zone__flow--from">from</span> : null}
          {isTarget ? <span className="demo-zone__flow demo-zone__flow--to">to</span> : null}
        </div>
        <div className="demo-zone__rail" data-zone-id={zoneId}>
          {entityIds.map((entityId) => (
            <div key={entityId} className="demo-zone__card">
              {renderCard(entityId, zoneId)}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const bluePlayer = state.frame.snapshot.players.find((player) => player.id === 'blue');
  const redPlayer = state.frame.snapshot.players.find((player) => player.id === 'red');
  const zones = state.frame.snapshot.zones;
  const battlefieldNorth = pickFirstZone(zones, ['battlefield_north', 'battlefield_top']);
  const battlefieldSouth = pickFirstZone(zones, ['battlefield_south', 'battlefield_bot', 'battlefield_mid']);

  const topZones: PlayerZones = {
    champion: pickFirstZone(zones, ['champion_red', 'red_base']),
    mainDeck: pickFirstZone(zones, ['deck_red']),
    runeDeck: pickFirstZone(zones, ['rune_deck_red']),
    baseRunes: pickFirstZone(zones, ['runes_red']),
    trash: pickFirstZone(zones, ['trash_red', 'graveyard'])
  };

  const bottomZones: PlayerZones = {
    champion: pickFirstZone(zones, ['champion_blue', 'blue_base']),
    mainDeck: pickFirstZone(zones, ['deck_blue']),
    runeDeck: pickFirstZone(zones, ['rune_deck_blue']),
    baseRunes: pickFirstZone(zones, ['runes_blue']),
    trash: pickFirstZone(zones, ['trash_blue', 'graveyard'])
  };

  if (topZones.mainDeck.length === 0 && redPlayer) {
    topZones.mainDeck = [...redPlayer.deck];
  }
  if (bottomZones.mainDeck.length === 0 && bluePlayer) {
    bottomZones.mainDeck = [...bluePlayer.deck];
  }
  if (topZones.trash.length === 0 && redPlayer) {
    topZones.trash = [...redPlayer.discard];
  }
  if (bottomZones.trash.length === 0 && bluePlayer) {
    bottomZones.trash = [...bluePlayer.discard];
  }

  return (
    <section className="demo-layout" aria-label="Riftbound replay demo">
      <aside className={`demo-panel${isFrameTransitioning ? ' demo-panel--frame-animating' : ''}`}>
        <h2 className="demo-panel__title">Riftbound Match Replay</h2>
        <p className="demo-panel__subtitle">Quickstart-style flow: draw, bank runes, deploy, fight, score battlefields.</p>

        <div className="demo-panel__group">
          <h3 className="demo-panel__group-title">Current Frame</h3>
          <div key={`frame-${state.frame.index}`} className="demo-panel__event">
            <p className="demo-panel__frame">
              Frame {state.frame.index + 1} / {state.totalFrames}
            </p>
            <p className="demo-panel__event-title">{eventExplanation.title}</p>
            <p className="demo-panel__event-detail">{eventExplanation.detail}</p>
            <div className="demo-panel__status">
              <span className="demo-status-chip demo-status-chip--turn">Turn {state.frame.snapshot.turn}</span>
              <span className="demo-status-chip demo-status-chip--phase">{state.frame.snapshot.currentPhase}</span>
              <span className="demo-status-chip demo-status-chip--player">{currentPlayerName}</span>
            </div>
          </div>
        </div>

        <div className="demo-panel__group">
          <h3 className="demo-panel__group-title">Score Race</h3>
          <div className="demo-score">
            <div className="demo-score__track" role="status" aria-live="polite">
              <div className="demo-score__entry demo-score__entry--blue">
                <span className="demo-score__team">Blue</span>
                <strong className="demo-score__points">{score.blue}</strong>
              </div>
              <span className="demo-score__separator">/ {score.target}</span>
              <div className="demo-score__entry demo-score__entry--red">
                <span className="demo-score__team">Red</span>
                <strong className="demo-score__points">{score.red}</strong>
              </div>
            </div>
            <div className="demo-control-map">
              {BATTLEFIELD_ZONE_IDS.map((zoneId) => (
                <span key={zoneId} className={`demo-control-map__chip demo-control-map__chip--${control[zoneId]}`}>
                  {zoneId === 'battlefield_north' ? 'north' : 'south'}: {control[zoneId]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="demo-panel__group">
          <h3 className="demo-panel__group-title">Timeline</h3>
          <ConnectedReplayTimeline
            markers={frameMarkers}
            className="demo-panel__timeline"
            renderMarker={({ marker, isActive }) => {
              const tone = getActionTone(marker.actionType);
              return (
                <div className={`demo-timeline-marker${isActive ? ' demo-timeline-marker--active' : ''}`}>
                  <span className={`demo-timeline-marker__glyph demo-timeline-marker__glyph--${tone}`}>
                    {getActionGlyph(marker.actionType)}
                  </span>
                  <span className="demo-timeline-marker__frame">F{marker.frame + 1}</span>
                  <span className="demo-timeline-marker__label">{marker.label}</span>
                </div>
              );
            }}
          />
        </div>

        <div className="demo-panel__group">
          <h3 className="demo-panel__group-title">Represented Rules</h3>
          <ul className="demo-panel__list">
            <li>Start of turn draws to 4 cards.</li>
            <li>Rune row grows to increase available resources.</li>
            <li>Units move into battlefields to claim lanes.</li>
            <li>End-turn scoring decides the winner at 8 points.</li>
          </ul>
        </div>

        <div className="demo-panel__group">
          <h3 className="demo-panel__group-title">Visual Mode</h3>
          <div className="demo-visual-mode" role="group" aria-label="Visual density">
            <button
              type="button"
              className={`demo-visual-mode__button${visualMode === 'guided' ? ' demo-visual-mode__button--active' : ''}`}
              onClick={() => setVisualMode('guided')}
            >
              Guided
            </button>
            <button
              type="button"
              className={`demo-visual-mode__button${visualMode === 'detailed' ? ' demo-visual-mode__button--active' : ''}`}
              onClick={() => setVisualMode('detailed')}
            >
              Detailed
            </button>
          </div>
        </div>
      </aside>

      <div className="demo-board">
        {showBoardGuide ? (
          <ReplayOnboardingLegend
            className="demo-board-guide"
            title="Mapa rapido del tablero"
            description="Sigue esta leyenda visual para leer la partida de Riftbound antes de usar Play."
            dismissLabel="Entendido"
            onDismiss={() => setShowBoardGuide(false)}
            items={[
              { id: 'battlefield', label: 'Battlefields', tone: 'battlefield' },
              { id: 'rune', label: 'Runes', tone: 'rune' },
              { id: 'unit', label: 'Units', tone: 'unit' },
              { id: 'spell', label: 'Spells', tone: 'spell' },
              { id: 'control-blue', label: 'Control Blue', tone: 'control-blue' },
              { id: 'control-red', label: 'Control Red', tone: 'control-red' }
            ]}
          />
        ) : null}

        <section
          className={`demo-dual-playmat replay-skin-official demo-dual-playmat--${visualMode} ${movementClassName} ${focusClassName} ${focusZoneClassNames}${isFrameTransitioning ? ' demo-dual-playmat--frame-animating' : ''}`}
          aria-label="Riftbound dual playmat"
        >
          <ol className="demo-dual-playmat__ruler demo-dual-playmat__ruler--left" aria-hidden="true">
            {PLAYMAT_RULER_MARKS.map((mark) => (
              <li key={`left-${mark}`} className="demo-dual-playmat__ruler-mark">
                {mark}
              </li>
            ))}
          </ol>

          <ol className="demo-dual-playmat__ruler demo-dual-playmat__ruler--right" aria-hidden="true">
            {PLAYMAT_RULER_MARKS.map((mark) => (
              <li key={`right-${mark}`} className="demo-dual-playmat__ruler-mark">
                {mark}
              </li>
            ))}
          </ol>

          <section className="demo-playmat demo-playmat--top" aria-label="Top player playmat">
            <p className="demo-playmat__macro demo-playmat__macro--units" aria-hidden="true">
              Base: Units + Gears
            </p>
            <p className="demo-playmat__macro demo-playmat__macro--runes" aria-hidden="true">
              Base: Runes
            </p>
            {renderZone('Rune Deck', 'rune_deck_red', topZones.runeDeck)}
            {renderZone('Base: Runes', 'runes_red', topZones.baseRunes)}
            {renderZone('Main Deck', 'deck_red', topZones.mainDeck)}
            {renderZone('Champion Zone', 'champion_red', topZones.champion)}
            {renderZone('Trash', 'trash_red', topZones.trash)}
          </section>

          <section className="demo-battlefield-band" aria-label="Shared battlefields">
            <p className="demo-battlefield-band__macro" aria-hidden="true">
              Battlefield Zone
            </p>
            <p className="demo-battlefield-band__macro demo-battlefield-band__macro--legend" aria-hidden="true">
              Legend Zone
            </p>
            {renderZone('Battlefield North', 'battlefield_north', battlefieldNorth)}
            {renderZone('Battlefield South', 'battlefield_south', battlefieldSouth)}
            {renderZone('Legend Zone', 'stack', zones.stack ?? [])}
            <div className="demo-battlefield-band__control">
              {BATTLEFIELD_ZONE_IDS.map((zoneId) => (
                <span key={zoneId} className={`demo-control-map__chip demo-control-map__chip--${control[zoneId]}`}>
                  {zoneId === 'battlefield_north' ? 'north' : 'south'}: {control[zoneId]}
                </span>
              ))}
            </div>
          </section>

          <section className="demo-playmat demo-playmat--bottom" aria-label="Bottom player playmat">
            <p className="demo-playmat__macro demo-playmat__macro--units" aria-hidden="true">
              Base: Units + Gears
            </p>
            <p className="demo-playmat__macro demo-playmat__macro--runes" aria-hidden="true">
              Base: Runes
            </p>
            {renderZone('Rune Deck', 'rune_deck_blue', bottomZones.runeDeck)}
            {renderZone('Base: Runes', 'runes_blue', bottomZones.baseRunes)}
            {renderZone('Main Deck', 'deck_blue', bottomZones.mainDeck)}
            {renderZone('Champion Zone', 'champion_blue', bottomZones.champion)}
            {renderZone('Trash', 'trash_blue', bottomZones.trash)}
          </section>
        </section>

        <section className="demo-controls" aria-label="Replay controls">
          <ConnectedReplayControls
            className="demo-controls__bar"
            playing={playing}
            onPlayingChange={(nextPlaying) => setPlaying(nextPlaying)}
            playbackRate={playbackRate}
            onPlaybackRateChange={(rate) => setPlaybackRate(rate)}
            playbackRateOptions={[0.5, 1, 2]}
          />
          <p className="demo-controls__timeline">
            {`Turn ${state.frame.snapshot.turn} · ${state.frame.snapshot.currentPhase} · ${getPlayerName(
              state,
              state.frame.snapshot.currentPlayer
            )} · Blue ${score.blue} - Red ${score.red} · ${timelineAction}`}
          </p>
        </section>
      </div>
    </section>
  );
}

export function Example04AdvancedRiftbound() {
  const replay = useDemoReplay('/demo.replay.json');

  return (
    <ReplayBootstrapBoundary
      loading={replay.loading}
      error={replay.error}
      validationIssues={replay.validationIssues}
      store={replay.store}
      loadingFallback={<p className="replay-player replay-player--loading">Loading Riftbound replay...</p>}
    >
      {(store) => (
        <ManaflowProvider store={store}>
          <DemoExperience frameMarkers={replay.frameMarkers} />
        </ManaflowProvider>
      )}
    </ReplayBootstrapBoundary>
  );
}
