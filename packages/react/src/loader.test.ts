import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReplayEngine } from '@manaflow/core';
import { loadDemoReplay } from './loader';

describe('loadDemoReplay', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads replay JSON through ReplayEngine.fromJson', async () => {
    const fromJson = vi.spyOn(ReplayEngine, 'fromJson').mockReturnValue({} as ReplayEngine);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"schemaVersion":1}')
      })
    );

    const replay = await loadDemoReplay('/replay.demo.json');
    expect(replay).toBeDefined();
    expect(fromJson).toHaveBeenCalledWith('{"schemaVersion":1}');
  });

  it('throws when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      })
    );

    await expect(loadDemoReplay('/missing.json')).rejects.toThrow('Cannot load replay demo: 404');
  });
});
