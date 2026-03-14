import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ReactReplayState } from './store';
import { ReplayViewport } from './components/replay-viewport';

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
      zones: { deck: ['card_1'], hand: ['card_2'], board: [], graveyard: [], stack: [] },
      metadata: { rulesProfile: 'test-v1' }
    }
  },
  currentFrame: 0,
  totalFrames: 2,
  canStepBack: false,
  canStepForward: true
};

describe('ReplayViewport view transitions', () => {
  it('renders cards in hand zone', () => {
    render(<ReplayViewport state={mockedState} />);
    
    const handZone = screen.getByRole('group', { name: /hand/i });
    expect(handZone).toBeInTheDocument();
    
    const card = screen.getByText('card_2');
    expect(card).toBeInTheDocument();
  });

  it('renders all default zones', () => {
    render(<ReplayViewport state={mockedState} />);
    
    expect(screen.getByRole('group', { name: /hand/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /board/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /graveyard/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /deck/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /stack/i })).toBeInTheDocument();
  });

  it('renders timeline with correct format', () => {
    render(<ReplayViewport state={mockedState} />);
    
    const timeline = screen.getByRole('status');
    expect(timeline).toBeInTheDocument();
    expect(timeline).toHaveTextContent(/Turn 1/);
  });
});
