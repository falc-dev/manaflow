import { getCurrentScope, onScopeDispose, readonly, shallowRef, type ShallowRef } from 'vue';
import { VueReplayState, VueReplayStore } from './store';

const identitySelector = <T>(value: T): T => value;

export function useReplayStore<T = VueReplayState>(
  store: VueReplayStore,
  selector: (state: VueReplayState) => T = identitySelector as (state: VueReplayState) => T
): Readonly<ShallowRef<T>> {
  const selectedState = shallowRef(selector(store.getState())) as ShallowRef<T>;
  const unsubscribe = store.subscribe((nextState) => {
    selectedState.value = selector(nextState);
  });

  if (getCurrentScope()) {
    onScopeDispose(unsubscribe);
  }

  return readonly(selectedState) as Readonly<ShallowRef<T>>;
}
