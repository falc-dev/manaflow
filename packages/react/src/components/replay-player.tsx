import { useEffect, useState } from 'react';
import { ReactReplayStore } from '../store';
import { useReplayStore } from '../use-replay-store-react';
import { ReplayControls } from './replay-controls';
import { ReplayViewport } from './replay-viewport';

export interface ReplayPlayerProps {
  store: ReactReplayStore;
  autoplayIntervalMs?: number;
  className?: string;
  controlsClassName?: string;
  viewportClassName?: string;
}

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function ReplayPlayer({
  store,
  autoplayIntervalMs = 700,
  className,
  controlsClassName,
  viewportClassName
}: ReplayPlayerProps) {
  const state = useReplayStore(store);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) {
      return;
    }

    if (!state.canStepForward && state.totalFrames > 1) {
      store.seek(0);
    }

    const timer = window.setInterval(() => {
      const next = store.next();
      if (!next) {
        setPlaying(false);
      }
    }, autoplayIntervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [playing, autoplayIntervalMs, state.canStepForward, state.totalFrames, store]);

  return (
    <div className={joinClassNames('replay-player', className)}>
      <ReplayControls
        className={controlsClassName}
        state={state}
        isPlaying={playing}
        onPrevious={() => store.previous()}
        onNext={() => store.next()}
        onTogglePlay={() => setPlaying((value) => !value)}
        onSeek={(frame) => store.seek(frame)}
      />
      <ReplayViewport className={viewportClassName} store={store} currentFrame={state.currentFrame} />
    </div>
  );
}
