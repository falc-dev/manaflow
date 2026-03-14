import { ReplayValidationIssue } from '@manaflow/core';
import { useEffect, useState } from 'react';
import {
  CreateReplayStoreFromUrlOptions,
  createReplayStoreFromUrl,
  ReplayBootstrapError,
  ReplayStoreBootstrapResult
} from './bootstrap';
import { ReactReplayStore } from './store';
import { ReplayTimelineMarker } from './replay-markers';

export interface UseReplayBootstrapResult {
  loading: boolean;
  store: ReactReplayStore | null;
  frameMarkers: ReplayTimelineMarker[];
  error: Error | null;
  validationIssues: ReplayValidationIssue[];
}

export function useReplayBootstrap(
  replayUrl: string,
  options: CreateReplayStoreFromUrlOptions = {}
): UseReplayBootstrapResult {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<ReactReplayStore | null>(null);
  const [frameMarkers, setFrameMarkers] = useState<ReplayTimelineMarker[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [validationIssues, setValidationIssues] = useState<ReplayValidationIssue[]>([]);

  useEffect(() => {
    let disposed = false;
    let activeStore: ReactReplayStore | null = null;

    const bootstrap = async () => {
      setLoading(true);
      setError(null);
      setValidationIssues([]);

      try {
        const result: ReplayStoreBootstrapResult = await createReplayStoreFromUrl(replayUrl, options);
        activeStore = result.store;

        if (disposed) {
          activeStore.destroy();
          return;
        }

        setStore(activeStore);
        setFrameMarkers(result.frameMarkers);
      } catch (cause) {
        if (disposed) {
          return;
        }

        const normalizedError = cause instanceof Error ? cause : new Error(String(cause));
        setError(normalizedError);
        setStore(null);
        setFrameMarkers([]);
        setValidationIssues(cause instanceof ReplayBootstrapError ? cause.issues : []);
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      disposed = true;
      activeStore?.destroy();
    };
  }, [replayUrl, options]);

  return {
    loading,
    store,
    frameMarkers,
    error,
    validationIssues
  };
}
