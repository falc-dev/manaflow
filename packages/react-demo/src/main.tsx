import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  buildReplayMarkers,
  createReactReplayStore,
  loadDemoReplay,
  validateReplayJson,
  ReplayControls,
  ReplayOnboardingLegend,
  ReplayTimeline,
  ReplayTimelineMarker,
  ReactReplayState,
  ReactReplayStore,
  useReplayStore
} from '@manaflow/react';
import type { ReplayValidationIssue } from '@manaflow/react';
import '@manaflow/react/styles.css';
import './main.css';

const BATTLEFIELD_ZONE_IDS = ['battlefield_north', 'battlefield_south'] as const;
const PLAYMAT_RULER_MARKS = [8, 7, 6, 5, 4, 3, 2, 1, 0] as const;
type BattlefieldZoneId = (typeof BATTLEFIELD_ZONE_IDS)[number];

interface MovementInfo {
  cardId: string;
  from: string;
  to: string;
}

interface ScoreboardInfo {
  blue: number;
  red: number;
  target: number;
}

interface DemoReplayPayload {
  events?: Array<{
    event?: {
      action?: {
        type?: unknown;
      };
    };
  }>;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === 'string');
}

function pickFirstZone(
  zones: Record<string, string[] | undefined>,
  aliases: readonly string[]
): string[] {
  for (const alias of aliases) {
    const zone = zones[alias];
    if (Array.isArray(zone) && zone.length > 0) {
      return zone;
    }
  }

  for (const alias of aliases) {
    const zone = zones[alias];
    if (Array.isArray(zone)) {
      return zone;
    }
  }

  return [];
}

function canonicalizeZoneId(zoneId: string): string {
  if (zoneId === 'battlefield_top') return 'battlefield_north';
  if (zoneId === 'battlefield_bot') return 'battlefield_south';
  if (zoneId === 'battlefield_mid') return 'battlefield_south';
  if (zoneId === 'blue_base') return 'champion_blue';
  if (zoneId === 'red_base') return 'champion_red';
  if (zoneId === 'graveyard') return 'trash_blue';
  return zoneId;
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function getPlayerName(state: ReactReplayState, playerId: string | undefined): string {
  if (!playerId) {
    return 'System';
  }

  return state.frame.snapshot.players.find((player) => player.id === playerId)?.name ?? playerId;
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

function getMovement(state: ReactReplayState): MovementInfo | null {
  const payload = toRecord(state.frame.event?.action.payload);
  if (!payload) {
    return null;
  }

  const cardId = payload.cardId;
  const from = payload.from;
  const to = payload.to;

  if (typeof cardId !== 'string' || typeof from !== 'string' || typeof to !== 'string') {
    return null;
  }

  return { cardId, from, to };
}

function getScoreboard(snapshot: ReactReplayState['frame']['snapshot']): ScoreboardInfo {
  const metadata = toRecord(snapshot.metadata);
  const score = toRecord(metadata?.score);

  return {
    blue: toNumber(score?.blue, 0),
    red: toNumber(score?.red, 0),
    target: toNumber(metadata?.targetScore, 8)
  };
}

function getBattlefieldControl(snapshot: ReactReplayState['frame']['snapshot']): Record<BattlefieldZoneId, string> {
  const metadata = toRecord(snapshot.metadata);
  const control = toRecord(metadata?.control);

  return {
    battlefield_north:
      typeof control?.battlefield_north === 'string'
        ? control.battlefield_north
        : typeof control?.battlefield_top === 'string'
          ? control.battlefield_top
          : 'neutral',
    battlefield_south:
      typeof control?.battlefield_south === 'string'
        ? control.battlefield_south
        : typeof control?.battlefield_bot === 'string'
          ? control.battlefield_bot
          : typeof control?.battlefield_mid === 'string'
            ? control.battlefield_mid
            : 'neutral'
  };
}

function getCardType(card: { metadata?: Record<string, unknown> } | undefined): string {
  const cardType = card?.metadata?.cardType;
  return typeof cardType === 'string' ? cardType : 'card';
}

function getCardFaction(card: { metadata?: Record<string, unknown> } | undefined): string {
  const faction = card?.metadata?.faction;
  return typeof faction === 'string' ? faction : 'neutral';
}

function getEventExplanation(state: ReactReplayState): { title: string; detail: string } {
  const event = state.frame.event;
  if (!event) {
    return {
      title: 'Quickstart Setup',
      detail:
        'Each player starts with a legend and units, refreshes runes each turn, and races to 8 points by controlling battlefields at end of turn.'
    };
  }

  const actionType = event.action.type;
  const payload = toRecord(event.action.payload) ?? {};
  const movement = getMovement(state);
  const playerName = getPlayerName(state, event.playerId);

  if (actionType === 'DRAW_TO_FOUR') {
    const handSize = toNumber(payload.targetHandSize, 4);
    return {
      title: 'Start Of Turn Draw',
      detail: `${playerName} draws until ${handSize} cards in hand before taking main-phase actions.`
    };
  }

  if (actionType === 'BANK_RUNE') {
    return {
      title: 'Bank Rune',
      detail: `${playerName} adds a rune to the rune row, increasing available resources for this turn.`
    };
  }

  if (actionType === 'DEPLOY_UNIT' && movement) {
    return {
      title: 'Deploy Unit To Battlefield',
      detail: `${playerName} moves ${getCardName(state, movement.cardId)} from ${movement.from} to ${movement.to}.`
    };
  }

  if (actionType === 'CAST_SPELL') {
    const targetId = typeof payload.targetId === 'string' ? payload.targetId : undefined;
    return {
      title: 'Spell Resolves',
      detail: `${playerName} casts ${getCardName(state, typeof payload.cardId === 'string' ? payload.cardId : undefined)} to remove ${getCardName(state, targetId)} and open a lane.`
    };
  }

  if (actionType === 'END_TURN') {
    return {
      title: 'End Turn',
      detail: `${playerName} ends turn and the replay advances to the scoring check for controlled battlefields.`
    };
  }

  if (actionType === 'SCORE_BATTLEFIELDS') {
    const gained = toNumber(payload.pointsGained, 0);
    const fromScore = toNumber(payload.fromScore, 0);
    const toScore = toNumber(payload.toScore, fromScore + gained);
    const battlefields = toStringArray(payload.controlledBattlefields)
      .map((zoneId) => canonicalizeZoneId(zoneId).replace('battlefield_', ''))
      .join(', ');

    return {
      title: 'Score Controlled Battlefields',
      detail: `${playerName} controls ${battlefields || 'active lanes'} and scores +${gained} (${fromScore} -> ${toScore}).`
    };
  }

  if (actionType === 'WIN_GAME') {
    const winnerId = typeof payload.winnerId === 'string' ? payload.winnerId : undefined;
    return {
      title: 'Match End',
      detail: `${getPlayerName(state, winnerId)} reaches the target score and wins the Riftbound match.`
    };
  }

  return {
    title: actionType,
    detail: `Event ${event.id} resolved at timestamp ${event.timestamp}.`
  };
}

function getFocusZones(state: ReactReplayState): string[] {
  const payload = toRecord(state.frame.event?.action.payload);
  if (!payload) {
    return [];
  }

  const candidateKeys = ['from', 'to', 'targetFrom', 'targetTo'] as const;
  const zones = new Set<string>();

  for (const key of candidateKeys) {
    const value = payload[key];
    if (typeof value === 'string' && value.length > 0) {
      zones.add(value);
    }
  }

  return Array.from(zones);
}

function getActionGlyph(actionType: string): string {
  if (actionType === 'SETUP') return 'S';
  if (actionType === 'DRAW_TO_FOUR') return 'D';
  if (actionType === 'BANK_RUNE') return 'R';
  if (actionType === 'DEPLOY_UNIT') return 'U';
  if (actionType === 'CAST_SPELL') return 'C';
  if (actionType === 'END_TURN') return 'E';
  if (actionType === 'SCORE_BATTLEFIELDS') return 'P';
  if (actionType === 'WIN_GAME') return 'W';
  return '•';
}

function getActionTone(actionType: string): string {
  if (actionType === 'DRAW_TO_FOUR') return 'draw';
  if (actionType === 'BANK_RUNE') return 'rune';
  if (actionType === 'DEPLOY_UNIT') return 'unit';
  if (actionType === 'CAST_SPELL') return 'spell';
  if (actionType === 'SCORE_BATTLEFIELDS') return 'score';
  if (actionType === 'WIN_GAME') return 'win';
  return 'neutral';
}

interface PlayerZones {
  champion: string[];
  mainDeck: string[];
  runeDeck: string[];
  baseRunes: string[];
  trash: string[];
}

function getZoneKindLabel(zoneId: string): string {
  if (zoneId.startsWith('battlefield_')) return 'Battlefield';
  if (zoneId.startsWith('champion_')) return 'Base Units';
  if (zoneId.startsWith('runes_')) return 'Runes';
  if (zoneId.startsWith('rune_deck_')) return 'Rune Deck';
  if (zoneId.startsWith('deck_')) return 'Main Deck';
  if (zoneId.startsWith('trash_')) return 'Trash';
  if (zoneId === 'stack') return 'Legend';
  return 'Zone';
}

function DemoExperience({ store, frameMarkers }: { store: ReactReplayStore; frameMarkers: ReplayTimelineMarker[] }) {
  const state = useReplayStore(store);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
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

  useEffect(() => {
    if (!playing) {
      return;
    }

    const stepMs = Math.max(16, Math.round(1000 / (playbackRate > 0 ? playbackRate : 1)));
    const timer = window.setInterval(() => {
      const next = store.next();
      if (!next) {
        setPlaying(false);
      }
    }, stepMs);

    return () => window.clearInterval(timer);
  }, [playing, playbackRate, store]);

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
          <ReplayTimeline
            state={state}
            markers={frameMarkers}
            onSeek={(frame) => store.seek(frame)}
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
          <ReplayControls
            className="demo-controls__bar"
            state={state}
            isPlaying={playing}
            playbackRate={playbackRate}
            playbackRateOptions={[0.5, 1, 2]}
            onPrevious={() => store.previous()}
            onNext={() => store.next()}
            onTogglePlay={() => setPlaying((value) => !value)}
            onSeek={(frame) => store.seek(frame)}
            onPlaybackRateChange={(rate) => setPlaybackRate(rate)}
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

function App() {
  const [store, setStore] = useState<ReactReplayStore | null>(null);
  const [frameMarkers, setFrameMarkers] = useState<ReplayTimelineMarker[]>([]);
  const [error, setError] = useState('');
  const [validationIssues, setValidationIssues] = useState<ReplayValidationIssue[]>([]);

  useEffect(() => {
    let disposed = false;
    let activeStore: ReactReplayStore | null = null;

    const bootstrap = async () => {
      try {
        const replayUrl = '/replay.demo.json';
        const timelineResponse = await fetch(replayUrl);
        if (!timelineResponse.ok) {
          throw new Error(`Cannot load replay payload: ${timelineResponse.status}`);
        }
        const replayRaw = await timelineResponse.text();
        const validation = validateReplayJson(replayRaw, { normalizeRiftboundAliases: true });
        if (!validation.ok) {
          setValidationIssues(validation.issues);
          throw new Error('Replay validation failed');
        }

        const replay = await loadDemoReplay(replayUrl, { payload: replayRaw });

        const timelinePayload = JSON.parse(replayRaw) as DemoReplayPayload;
        activeStore = createReactReplayStore(replay);

        if (disposed) {
          activeStore.destroy();
          return;
        }

        setStore(activeStore);
        setFrameMarkers(
          buildReplayMarkers(timelinePayload.events ?? [], {
            actionLabels: {
              DRAW_TO_FOUR: 'Draw To Four',
              BANK_RUNE: 'Bank Rune',
              DEPLOY_UNIT: 'Deploy Unit',
              CAST_SPELL: 'Cast Spell',
              END_TURN: 'End Turn',
              SCORE_BATTLEFIELDS: 'Score Battlefields',
              WIN_GAME: 'Win Game'
            }
          })
        );
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
        <section className="error" role="alert">
          <p>{error}</p>
          {validationIssues.length > 0 ? (
            <ul className="error__issues">
              {validationIssues.map((issue, index) => (
                <li key={`${issue.path}-${index}`}>
                  {issue.path}: {issue.message}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      );
    }

    if (!store) {
      return <p className="replay-player replay-player--loading">Loading Riftbound replay...</p>;
    }

    return <DemoExperience store={store} frameMarkers={frameMarkers} />;
  }, [error, frameMarkers, store, validationIssues]);

  return content;
}

const app = document.getElementById('app');
if (!app) {
  throw new Error('Missing required DOM node: #app');
}

createRoot(app).render(<App />);
