import { afterEach, describe, expect, it, vi } from 'vitest';
import * as core from '@manaflow/core';
import { loadDemoReplay } from './loader';

describe('loadDemoReplay', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads replay payload through core loadReplay autodetection', async () => {
    const loadReplay = vi.spyOn(core, 'loadReplay').mockReturnValue({} as core.ReplayEngine);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"schemaVersion":1}')
      })
    );

    const replay = await loadDemoReplay('/replay.demo.json');
    expect(replay).toBeDefined();
    expect(loadReplay).toHaveBeenCalledWith('{"schemaVersion":1}');
  });

  it('loads replay from provided payload without fetching', async () => {
    const loadReplay = vi.spyOn(core, 'loadReplay').mockReturnValue({} as core.ReplayEngine);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const replay = await loadDemoReplay('/replay.demo.json', { payload: '{"schemaVersion":1}' });
    expect(replay).toBeDefined();
    expect(loadReplay).toHaveBeenCalledWith('{"schemaVersion":1}');
    expect(fetchMock).not.toHaveBeenCalled();
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
