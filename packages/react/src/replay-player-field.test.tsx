import { describe, expect, it } from 'vitest';
import { ReactReplayState } from './store';
import { ReplayPlayerField } from './components/replay-player-field';
import { selectPlayerField } from './player-field';

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
        }
      ],
      currentPhase: 'DRAW',
      currentPlayer: 'p1',
      turn: 1,
      entities: {},
      zones: { deck: [], hand: [], board: [], graveyard: [], stack: [] },
      metadata: {}
    }
  },
  currentFrame: 0,
  totalFrames: 2,
  canStepBack: false,
  canStepForward: true
};

describe('ReplayPlayerField', () => {
  it('renders player info and default zones', () => {
    const field = selectPlayerField(mockedState.frame.snapshot, 'p1');
    expect(field).not.toBeNull();
    const element = ReplayPlayerField({
      state: mockedState,
      field: field!
    });

    expect(element.props.className).toContain('replay-player-field');
    const zonesContainer = element.props.children[1];
    expect(zonesContainer.props.className).toBe('replay-player-field__zones');
    expect(zonesContainer.props.children).toHaveLength(3);
  });
});
