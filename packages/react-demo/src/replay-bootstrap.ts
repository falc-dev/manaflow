import {
  buildReplayMarkers,
  createReactReplayStore,
  loadDemoReplay,
  ReactReplayStore,
  ReplayTimelineMarker,
  validateReplayJson
} from '@manaflow/react';
import type { ReplayValidationIssue } from '@manaflow/react';

interface DemoReplayPayload {
  events?: Array<{
    event?: {
      action?: {
        type?: unknown;
      };
    };
  }>;
}

const DEMO_ACTION_LABELS: Record<string, string> = {
  DRAW_TO_FOUR: 'Draw To Four',
  BANK_RUNE: 'Bank Rune',
  DEPLOY_UNIT: 'Deploy Unit',
  CAST_SPELL: 'Cast Spell',
  END_TURN: 'End Turn',
  SCORE_BATTLEFIELDS: 'Score Battlefields',
  WIN_GAME: 'Win Game'
};

export class ReplayBootstrapError extends Error {
  readonly issues: ReplayValidationIssue[];

  constructor(message: string, issues: ReplayValidationIssue[] = []) {
    super(message);
    this.name = 'ReplayBootstrapError';
    this.issues = issues;
  }
}

export interface ReplayBootstrapResult {
  store: ReactReplayStore;
  frameMarkers: ReplayTimelineMarker[];
}

export async function bootstrapReplay(replayUrl: string): Promise<ReplayBootstrapResult> {
  const response = await fetch(replayUrl);
  if (!response.ok) {
    throw new ReplayBootstrapError(`Cannot load replay payload: ${response.status}`);
  }

  const replayRaw = await response.text();
  const validation = validateReplayJson(replayRaw, { normalizeRiftboundAliases: true });
  if (!validation.ok) {
    throw new ReplayBootstrapError('Replay validation failed', validation.issues);
  }

  const replay = await loadDemoReplay(replayUrl, { payload: replayRaw });
  const timelinePayload = JSON.parse(replayRaw) as DemoReplayPayload;
  const store = createReactReplayStore(replay);
  const frameMarkers = buildReplayMarkers(timelinePayload.events ?? [], {
    actionLabels: DEMO_ACTION_LABELS
  });

  return {
    store,
    frameMarkers
  };
}
