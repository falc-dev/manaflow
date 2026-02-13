import { ReactReplayState, ReactReplayStore } from './store';

export type UseSyncExternalStore = <T>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot?: () => T
) => T;

const identitySelector = <T>(value: T): T => value;

interface StoreCache {
  signature: string;
  state: ReactReplayState;
  selectedBySelector: Map<(state: ReactReplayState) => unknown, unknown>;
}

const storeCache = new WeakMap<ReactReplayStore, StoreCache>();

function stateSignature(state: ReactReplayState): string {
  return [
    state.currentFrame,
    state.totalFrames,
    state.canStepBack ? 1 : 0,
    state.canStepForward ? 1 : 0,
    state.frame.event?.id ?? '',
    state.frame.event?.timestamp ?? -1
  ].join(':');
}

export function createUseReplayStore(useSyncExternalStore: UseSyncExternalStore) {
  return function useReplayStore<T = ReactReplayState>(
    store: ReactReplayStore,
    selector: (state: ReactReplayState) => T = identitySelector as (state: ReactReplayState) => T
  ): T {
    const getSnapshot = () => {
      const nextState = store.getState();
      const nextSignature = stateSignature(nextState);
      const cached = storeCache.get(store);

      if (cached && cached.signature === nextSignature) {
        if (cached.selectedBySelector.has(selector as (state: ReactReplayState) => unknown)) {
          return cached.selectedBySelector.get(selector as (state: ReactReplayState) => unknown) as T;
        }

        const selected = selector(cached.state);
        cached.selectedBySelector.set(selector as (state: ReactReplayState) => unknown, selected);
        return selected;
      }

      const selectedBySelector = new Map<(state: ReactReplayState) => unknown, unknown>();
      const selected = selector(nextState);
      selectedBySelector.set(selector as (state: ReactReplayState) => unknown, selected);

      storeCache.set(store, {
        signature: nextSignature,
        state: nextState,
        selectedBySelector
      });

      return selected;
    };

    return useSyncExternalStore(
      (onStoreChange) => store.subscribe(() => onStoreChange()),
      getSnapshot,
      getSnapshot
    );
  };
}
