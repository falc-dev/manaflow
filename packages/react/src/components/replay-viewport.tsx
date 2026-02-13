import { useEffect, useRef } from 'react';
import { ReactReplayStore } from '../store';

export interface ReplayViewportProps {
  store: ReactReplayStore;
  currentFrame: number;
  className?: string;
}

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function ReplayViewport({ store, currentFrame, className }: ReplayViewportProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (viewportRef.current) {
      store.render(viewportRef.current);
    }
  }, [store, currentFrame]);

  return <div ref={viewportRef} className={joinClassNames('replay-player__viewport', className)} />;
}
