import { ReplayValidationIssue, useReplayBootstrap } from '@manaflow/react';
import { useMemo } from 'react';

const DEMO_ACTION_LABELS: Record<string, string> = {
  DRAW_TO_FOUR: 'Draw To Four',
  BANK_RUNE: 'Bank Rune',
  DEPLOY_UNIT: 'Deploy Unit',
  CAST_SPELL: 'Cast Spell',
  END_TURN: 'End Turn',
  SCORE_BATTLEFIELDS: 'Score Battlefields',
  WIN_GAME: 'Win Game'
};

export interface UseDemoReplayResult {
  loading: boolean;
  error: Error | null;
  errorMessage: string;
  validationIssues: ReplayValidationIssue[];
  store: ReturnType<typeof useReplayBootstrap>['store'];
  frameMarkers: ReturnType<typeof useReplayBootstrap>['frameMarkers'];
}

export function useDemoReplay(replayUrl: string): UseDemoReplayResult {
  const options = useMemo(
    () => ({
      normalizeRiftboundAliases: true,
      actionLabels: DEMO_ACTION_LABELS
    }),
    []
  );

  const { loading, error, validationIssues, store, frameMarkers } = useReplayBootstrap(replayUrl, options);

  const errorMessage = error ? `Failed to load replay demo: ${error.message}` : '';

  return {
    loading,
    error,
    errorMessage,
    validationIssues,
    store,
    frameMarkers
  };
}
