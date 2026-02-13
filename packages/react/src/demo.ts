import { ReplayEngine } from '@manaflow/core';
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
  root.appendChild(controls);
  root.appendChild(viewport);
  container.appendChild(root);

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

  store.render(viewport);

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
