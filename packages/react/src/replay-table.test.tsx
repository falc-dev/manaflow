import { describe, expect, it } from 'vitest';
import { ReactReplayState } from './store';
import { ReplayTable } from './components/replay-table';

const mockedState: ReactReplayState = {
  frame: {
    index: 0,
    snapshot: {
      id: 'game_1',
      players: [],
      currentPhase: 'DRAW',
      currentPlayer: 'p1',
      turn: 1,
      entities: {},
      zones: { deck: [], hand: [], board: [], objective: ['card_1'], graveyard: [], stack: ['card_2'] },
      metadata: { rulesProfile: 'test-v1' }
    }
  },
  currentFrame: 0,
  totalFrames: 2,
  canStepBack: false,
  canStepForward: true
};

describe('ReplayTable', () => {
  it('renders default table zones (board + stack)', () => {
    const element = ReplayTable({
      state: mockedState
    });

    expect(element.props.className).toContain('replay-table');
    expect(element.props.children).toHaveLength(2);
  });

  it('supports zoneMap aliases for table zones', () => {
    const element = ReplayTable({
      state: mockedState,
      zoneMap: {
        board: ['objective', 'board']
      }
    });
    const boardZone = element.props.children[0];
    const boardRail = boardZone.props.children[1];
    expect(boardRail.props.children).toHaveLength(1);
  });
});
