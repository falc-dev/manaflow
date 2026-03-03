import { loadReplay, ReplayValidationIssue, validateReplayJson } from '@manaflow/core';
import { BuildReplayMarkersOptions, buildReplayMarkers, ReplayMarkerInput, ReplayTimelineMarker } from './replay-markers';
import { createReactReplayStore, ReactReplayStore } from './store';

interface ReplayBootstrapPayload {
  events?: Array<ReplayMarkerInput | null | undefined>;
}

export interface CreateReplayStoreFromUrlOptions extends BuildReplayMarkersOptions {
  normalizeRiftboundAliases?: boolean;
}

export interface ReplayStoreBootstrapResult {
  store: ReactReplayStore;
  frameMarkers: ReplayTimelineMarker[];
  replayRaw: string;
}

export class ReplayBootstrapError extends Error {
  readonly issues: ReplayValidationIssue[];

  constructor(message: string, issues: ReplayValidationIssue[] = []) {
    super(message);
    this.name = 'ReplayBootstrapError';
    this.issues = issues;
  }
}

function parseReplayPayload(raw: string): ReplayBootstrapPayload {
  const parsed = JSON.parse(raw) as ReplayBootstrapPayload;
  return parsed;
}

export async function createReplayStoreFromUrl(
  replayUrl: string,
  options: CreateReplayStoreFromUrlOptions = {}
): Promise<ReplayStoreBootstrapResult> {
  const response = await fetch(replayUrl);
  if (!response.ok) {
    throw new ReplayBootstrapError(`Cannot load replay payload: ${response.status}`);
  }

  const replayRaw = await response.text();
  const validation = validateReplayJson(replayRaw, {
    normalizeRiftboundAliases: options.normalizeRiftboundAliases
  });

  if (!validation.ok) {
    throw new ReplayBootstrapError('Replay validation failed', validation.issues);
  }

  const replay = loadReplay(replayRaw);
  const timelinePayload = parseReplayPayload(replayRaw);
  const frameMarkers = buildReplayMarkers(timelinePayload.events ?? [], options);

  return {
    store: createReactReplayStore(replay),
    frameMarkers,
    replayRaw
  };
}
