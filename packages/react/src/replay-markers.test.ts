import { describe, expect, it } from 'vitest';
import { buildReplayMarkers, getReplayActionLabel } from './replay-markers';

describe('buildReplayMarkers', () => {
  it('builds setup + event markers from nested replay payload events', () => {
    const markers = buildReplayMarkers([
      { event: { action: { type: 'PLAY_CARD' } } },
      { event: { action: { type: 'DRAW_CARD' } } }
    ]);

    expect(markers).toEqual([
      { frame: 0, label: 'Setup', actionType: 'SETUP' },
      { frame: 1, label: 'Hand -> Battle', actionType: 'PLAY_CARD' },
      { frame: 2, label: 'Deck -> Hand', actionType: 'DRAW_CARD' }
    ]);
  });

  it('supports direct action shape and custom labels', () => {
    const markers = buildReplayMarkers(
      [{ action: { type: 'CUSTOM_EVENT' } }],
      { actionLabels: { CUSTOM_EVENT: 'Custom Label' } }
    );

    expect(markers).toEqual([
      { frame: 0, label: 'Setup', actionType: 'SETUP' },
      { frame: 1, label: 'Custom Label', actionType: 'CUSTOM_EVENT' }
    ]);
  });

  it('can skip setup marker and falls back to EVENT when missing action type', () => {
    const markers = buildReplayMarkers([{ event: {} }], { includeSetup: false });

    expect(markers).toEqual([{ frame: 0, label: 'Event', actionType: 'EVENT' }]);
  });
});

describe('getReplayActionLabel', () => {
  it('formats unknown action labels as title case', () => {
    expect(getReplayActionLabel('SWAP_HANDS')).toBe('Swap Hands');
  });
});
