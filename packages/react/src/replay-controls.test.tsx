import { describe, expect, it, vi } from 'vitest';
import { ReplayControls } from './components/replay-controls';
import { ReactReplayState } from './store';

const mockedState: ReactReplayState = {
  frame: {
    index: 1,
    snapshot: {
      id: 'game_1',
      players: [],
      currentPhase: 'MAIN',
      currentPlayer: 'p1',
      turn: 1,
      entities: {},
      zones: {},
      metadata: {}
    }
  },
  currentFrame: 1,
  totalFrames: 4,
  canStepBack: true,
  canStepForward: true
};

describe('ReplayControls', () => {
  it('exposes accessible labels for controls and slider value', () => {
    const element = ReplayControls({
      state: mockedState,
      isPlaying: false,
      onPrevious: vi.fn(),
      onNext: vi.fn(),
      onTogglePlay: vi.fn(),
      onSeek: vi.fn()
    });

    const children = element.props.children;
    const previousButton = children[0];
    const playButton = children[1];
    const slider = children[4];
    const frameStatus = children[5];

    expect(previousButton.props.type).toBe('button');
    expect(previousButton.props['aria-label']).toBe('Previous frame');
    expect(playButton.props['aria-label']).toBe('Play');
    expect(slider.props['aria-label']).toBe('Replay frame');
    expect(slider.props['aria-valuetext']).toBe('Frame 2 of 4');
    expect(frameStatus.props.role).toBe('status');
  });

  it('supports custom control labels', () => {
    const element = ReplayControls({
      state: mockedState,
      isPlaying: true,
      onPrevious: vi.fn(),
      onNext: vi.fn(),
      onTogglePlay: vi.fn(),
      onSeek: vi.fn(),
      labels: {
        previous: 'Anterior',
        next: 'Siguiente',
        play: 'Reproducir',
        pause: 'Pausar',
        frameSlider: 'Marco'
      }
    });

    const children = element.props.children;
    expect(children[0].props['aria-label']).toBe('Anterior');
    expect(children[1].props['aria-label']).toBe('Pausar');
    expect(children[2].props['aria-label']).toBe('Siguiente');
    expect(children[4].props['aria-label']).toBe('Marco');
  });
});
