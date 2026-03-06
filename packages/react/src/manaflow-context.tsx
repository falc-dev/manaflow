import { ReactNode, createContext, useContext } from 'react';
import { ReactReplayState, ReactReplayStore } from './store';
import { useReplayStore } from './use-replay-store-react';

const ManaflowStoreContext = createContext<ReactReplayStore | null>(null);

export interface ManaflowProviderProps {
  store: ReactReplayStore;
  children: ReactNode;
}

export function ManaflowProvider({ store, children }: ManaflowProviderProps) {
  return <ManaflowStoreContext.Provider value={store}>{children}</ManaflowStoreContext.Provider>;
}

export function useManaflowStore(): ReactReplayStore {
  const store = useContext(ManaflowStoreContext);

  if (!store) {
    throw new Error('useManaflowStore must be used within ManaflowProvider.');
  }

  return store;
}

const identitySelector = <T,>(value: T): T => value;

export function useManaflowState<T = ReactReplayState>(
  selector: (state: ReactReplayState) => T = identitySelector as (state: ReactReplayState) => T
): T {
  const store = useManaflowStore();
  return useReplayStore(store, selector);
}
