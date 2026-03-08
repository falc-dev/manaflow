import { describe, expect, it } from 'vitest';
import { ReactReplayState } from './store';
import { ReplaySharedObjective } from './components/replay-shared-objective';

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
      zones: { objective: ['card_1'], board: ['card_2'], stack: [] },
      metadata: { rulesProfile: 'test-v1' }
    }
  },
  currentFrame: 0,
  totalFrames: 2,
  canStepBack: false,
  canStepForward: true
};

describe('ReplaySharedObjective', () => {
  it('prefers objective zone and falls back through zoneIds', () => {
    const element = ReplaySharedObjective({
      state: mockedState,
      zoneIds: ['objective', 'board'],
      title: 'Objectives'
    });

    expect(element.props.className).toContain('replay-shared-objective');
    expect(element.props.children[0].props.children).toContain('Objectives (1)');
  });
});
