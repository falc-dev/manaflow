import { useSyncExternalStore } from 'react';
import { createUseReplayStore } from './use-replay-store';

export const useReplayStore = createUseReplayStore(useSyncExternalStore);
