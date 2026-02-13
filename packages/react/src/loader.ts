import { ReplayEngine } from '@manaflow/core';

export async function loadDemoReplay(url: string): Promise<ReplayEngine> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Cannot load replay demo: ${response.status}`);
  }

  const payload = await response.text();
  return ReplayEngine.fromJson(payload);
}
