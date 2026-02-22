import { describe, expect, it } from 'vitest';
import { ReplayDuelLayout } from './components/replay-duel-layout';
import { ReactReplayState } from './store';

const mockedState: ReactReplayState = {
  frame: {
    index: 0,
    snapshot: {
      id: 'game_1',
      players: [
        {
          id: 'p1',
          name: 'Player 1',
          health: 20,
          resources: [{ type: 'MANA', amount: 2, max: 10 }],
          hand: ['card_1'],
          deck: ['card_2'],
          discard: ['card_3'],
          zones: {}
        },
        {
          id: 'p2',
          name: 'Player 2',
          health: 18,
          resources: [{ type: 'MANA', amount: 1, max: 10 }],
          hand: ['card_4'],
          deck: ['card_5'],
          discard: ['card_6'],
          zones: {}
        }
      ],
      currentPhase: 'DRAW',
      currentPlayer: 'p2',
      turn: 1,
      entities: {},
      zones: { board: ['card_7'], stack: ['card_8'] },
      metadata: {}
    }
  },
  currentFrame: 0,
  totalFrames: 2,
  canStepBack: false,
  canStepForward: true
};

describe('ReplayDuelLayout', () => {
  it('renders top/center/bottom sections with player ordering based on current player', () => {
    const element = ReplayDuelLayout({
      state: mockedState
    });

    expect(element.props.className).toContain('replay-duel-layout');
    const children = element.props.children.filter(Boolean);
    expect(children).toHaveLength(3);
    expect(children[0].props.className).toContain('replay-duel-layout__top');
    expect(children[2].props.className).toContain('replay-duel-layout__bottom');
  });
});
