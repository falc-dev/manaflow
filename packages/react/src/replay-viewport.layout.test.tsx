import { describe, expect, it } from 'vitest';
import { ReactElement } from 'react';
import { ReactReplayState } from './store';
import { ReplayViewport } from './components/replay-viewport';

const mockedState: ReactReplayState = {
  frame: {
    index: 0,
    snapshot: {
      id: 'game_1',
      players: [
        {
          id: 'p1',
          name: 'P1',
          health: 20,
          resources: [{ type: 'MANA', amount: 1, max: 10 }],
          hand: [],
          deck: [],
          discard: [],
          zones: {}
        }
      ],
      currentPhase: 'DRAW',
      currentPlayer: 'p1',
      turn: 1,
      entities: {},
      zones: { deck: ['card_1'], hand: ['card_2'], board: [], graveyard: [], stack: [] },
      metadata: {}
    }
  },
  currentFrame: 0,
  totalFrames: 2,
  canStepBack: false,
  canStepForward: true
};

describe('ReplayViewport layout presets', () => {
  it('applies board layout class and zone modifier classes', () => {
    const element = ReplayViewport({
      state: mockedState,
      layout: 'board'
    });

    expect(element.props.className).toContain('replay-player__viewport--layout-board');

    const children = element.props.children as unknown[];
    const zones = (Array.isArray(children[1]) ? children[1] : []) as ReactElement[];
    const handZone = zones.find((zone) => zone.props.className.includes('replay-player__zone--hand'));
    const deckZone = zones.find((zone) => zone.props.className.includes('replay-player__zone--deck'));

    expect(handZone).toBeDefined();
    expect(deckZone).toBeDefined();
  });

  it('defaults to stacked layout when layout is not provided', () => {
    const element = ReplayViewport({
      state: mockedState
    });

    expect(element.props.className).toContain('replay-player__viewport--layout-stacked');
  });
});
