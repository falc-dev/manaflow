import { afterEach, describe, expect, it, vi } from 'vitest';
import { createReplayStoreFromUrl, ReplayBootstrapError } from './bootstrap';

describe('createReplayStoreFromUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads a valid replay and builds markers', async () => {
    const replayRaw = await import('../replay.demo.json').then((module) => JSON.stringify(module.default));

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(replayRaw, { status: 200, headers: { 'content-type': 'application/json' } }))
    );

    const result = await createReplayStoreFromUrl('/replay.demo.json');
    expect(result.frameMarkers.length).toBeGreaterThan(0);
    expect(result.store.getState().totalFrames).toBeGreaterThan(0);
    result.store.destroy();
  });

  it('throws a typed error for invalid payloads', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"foo":"bar"}', { status: 200, headers: { 'content-type': 'application/json' } }))
    );

    await expect(createReplayStoreFromUrl('/replay.demo.json')).rejects.toBeInstanceOf(ReplayBootstrapError);
  });
});
