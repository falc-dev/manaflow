import { loadReplay, ReplayEngine } from '@manaflow/core';

export interface LoadDemoReplayOptions {
  payload?: string;
}

export async function loadDemoReplay(url: string, options: LoadDemoReplayOptions = {}): Promise<ReplayEngine> {
  if (typeof options.payload === 'string') {
    return loadReplay(options.payload);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Cannot load replay demo: ${response.status}`);
  }
  const payload = await response.text();
  return loadReplay(payload);
}
