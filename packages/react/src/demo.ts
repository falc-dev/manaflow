import { ReplayEngine } from '@manaflow/core';
import { Card, GameSnapshot } from '@manaflow/types';
import { createReactReplayStore } from './store';

export interface ReplayDemoOptions {
  autoplayIntervalMs?: number;
}

export interface ReplayDemoHandle {
  play(): void;
  pause(): void;
  isPlaying(): boolean;
  destroy(): void;
}

/**
 * @deprecated Use `ReplayPlayer` + `createReactReplayStore` / `useReplayStore`.
 * This helper mounts an imperative demo UI and is kept for backwards compatibility.
 */
export function mountReplayDemo(
  container: HTMLElement,
  replay: ReplayEngine,
  options: ReplayDemoOptions = {}
): ReplayDemoHandle {
  const autoplayIntervalMs = options.autoplayIntervalMs ?? 800;
  const store = createReactReplayStore(replay);
  let timer: ReturnType<typeof setInterval> | null = null;
  let canStepForward = true;
  let totalFrames = 1;

  container.innerHTML = '';

  const root = document.createElement('div');
  root.style.display = 'grid';
  root.style.gap = '12px';

  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.gap = '8px';
  controls.style.alignItems = 'center';
  controls.style.flexWrap = 'wrap';

  const prev = document.createElement('button');
  prev.textContent = 'Prev';
  const play = document.createElement('button');
  play.textContent = 'Play';
  const next = document.createElement('button');
  next.textContent = 'Next';
  const frameLabel = document.createElement('span');
  frameLabel.style.fontFamily = 'monospace';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.step = '1';
  slider.style.width = '280px';

  controls.appendChild(prev);
  controls.appendChild(play);
  controls.appendChild(next);
  controls.appendChild(slider);
  controls.appendChild(frameLabel);

  const viewport = document.createElement('div');
  viewport.className = 'replay-player__viewport';
  root.appendChild(controls);
  root.appendChild(viewport);
  container.appendChild(root);

  const zones = [
    { id: 'hand', title: 'Hand' },
    { id: 'board', title: 'Board' },
    { id: 'graveyard', title: 'Graveyard' },
    { id: 'deck', title: 'Deck' },
    { id: 'stack', title: 'Stack' }
  ];

  const getCard = (entityId: string, snapshot: GameSnapshot): Card | undefined => {
    const entity = snapshot.entities[entityId];
    return entity?.components.find((component) => component.componentType === 'CARD')?.metadata as Card | undefined;
  };

  const renderViewport = (snapshot: GameSnapshot, highlighted: boolean) => {
    viewport.innerHTML = '';

    const timeline = document.createElement('div');
    timeline.className = `replay-player__timeline${highlighted ? ' replay-player__timeline--highlighted' : ''}`;
    const phase = snapshot.metadata?.currentPhase ?? '';
    timeline.textContent = `Turn ${snapshot.turn} · Phase ${phase} · Player ${snapshot.currentPlayer}`;
    viewport.appendChild(timeline);

    for (const zone of zones) {
      const zoneElement = document.createElement('div');
      zoneElement.className = 'replay-player__zone';
      zoneElement.setAttribute('role', 'group');
      zoneElement.setAttribute('aria-label', zone.title);

      const title = document.createElement('div');
      title.className = 'replay-player__zone-title';
      title.textContent = zone.title;

      const rail = document.createElement('div');
      rail.className = 'replay-player__zone-rail';
      rail.dataset.zoneId = zone.id;

      for (const entityId of snapshot.zones[zone.id] ?? []) {
        const card = getCard(entityId, snapshot);
        const cardElement = document.createElement('div');
        cardElement.className = 'replay-player__card';
        cardElement.setAttribute('role', 'article');

        const name = document.createElement('div');
        name.className = 'replay-player__card-name';
        name.textContent = card?.name ?? entityId;

        const cost = document.createElement('div');
        cost.className = 'replay-player__card-cost';
        cost.textContent = `Cost ${card?.cost ?? '-'}`;

        cardElement.appendChild(name);
        cardElement.appendChild(cost);
        rail.appendChild(cardElement);
      }

      zoneElement.appendChild(title);
      zoneElement.appendChild(rail);
      viewport.appendChild(zoneElement);
    }
  };

  const stopPlayback = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      play.textContent = 'Play';
    }
  };

  const startPlayback = () => {
    if (timer) {
      return;
    }
    if (!canStepForward && totalFrames > 1) {
      store.seek(0);
    }
    timer = setInterval(() => {
      const frame = store.next();
      if (!frame) {
        stopPlayback();
      }
    }, autoplayIntervalMs);
    play.textContent = 'Pause';
  };

  const unsubscribe = store.subscribe((state) => {
    canStepForward = state.canStepForward;
    totalFrames = state.totalFrames;
    slider.max = `${Math.max(state.totalFrames - 1, 0)}`;
    slider.value = `${state.currentFrame}`;
    frameLabel.textContent = `Frame ${state.currentFrame + 1}/${state.totalFrames}`;
    prev.disabled = !state.canStepBack;
    next.disabled = !state.canStepForward;
    renderViewport(state.frame.snapshot, Boolean(state.frame.event?.id));
  });

  const onPrev = () => {
    store.previous();
  };
  const onNext = () => {
    store.next();
  };
  const onPlayPause = () => {
    if (timer) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };
  const onSlider = () => {
    store.seek(Number(slider.value));
  };

  prev.addEventListener('click', onPrev);
  next.addEventListener('click', onNext);
  play.addEventListener('click', onPlayPause);
  slider.addEventListener('input', onSlider);

  return {
    play: startPlayback,
    pause: stopPlayback,
    isPlaying() {
      return Boolean(timer);
    },
    destroy() {
      stopPlayback();
      unsubscribe();
      prev.removeEventListener('click', onPrev);
      next.removeEventListener('click', onNext);
      play.removeEventListener('click', onPlayPause);
      slider.removeEventListener('input', onSlider);
      store.destroy();
      container.innerHTML = '';
    }
  };
}
