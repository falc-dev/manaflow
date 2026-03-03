import { ReactReplayStore } from '@manaflow/react';
import { useEffect, useState } from 'react';

export interface UseReplayPlaybackResult {
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  playbackRate: number;
  setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
}

export function useReplayPlayback(store: ReactReplayStore): UseReplayPlaybackResult {
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

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

  return {
    playing,
    setPlaying,
    playbackRate,
    setPlaybackRate
  };
}
