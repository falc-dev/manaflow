import { describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import { ReactReplayState, ReactReplayStore } from './store';

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
      zones: { deck: [], hand: [], board: [], graveyard: [], stack: [] },
      metadata: { rulesProfile: 'test-v1' }
    }
  },
  currentFrame: 0,
  totalFrames: 3,
  canStepBack: false,
  canStepForward: true
};

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  return {
    ...react,
    useState: <T,>(initialValue: T) => [initialValue, () => undefined] as const,
    useRef: <T,>(initialValue: T) => ({ current: initialValue }),
    useEffect: () => undefined
  };
});

vi.mock('./use-replay-store-react', () => ({
  useReplayStore: () => mockedState
}));

vi.mock('./components/replay-controls', () => ({
  ReplayControls: () => null
}));

vi.mock('./components/replay-viewport', () => ({
  ReplayViewport: () => null
}));

vi.mock('./components/replay-timeline', () => ({
  ReplayTimeline: () => null
}));

import { ReplayPlayer } from './components/replay-player';

function createStoreMock(): ReactReplayStore {
  return {
    getFrame: vi.fn(() => mockedState.frame),
    getState: vi.fn(() => mockedState),
    subscribe: vi.fn(() => () => undefined),
    next: vi.fn(() => null),
    previous: vi.fn(() => null),
    seek: vi.fn(() => null),
    render: vi.fn(),
    destroy: vi.fn()
  } as unknown as ReactReplayStore;
}

describe('ReplayPlayer + integrated timeline', () => {
  function getChildren(element: ReactElement): ReactElement[] {
    const children = element.props.children;
    return Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean);
  }

  it('renders timeline after viewport when timelinePosition is afterViewport', () => {
    const store = createStoreMock();
    const element = ReplayPlayer({
      store,
      showTimeline: true,
      timelinePosition: 'afterViewport',
      controlsClassName: 'mock-controls',
      viewportClassName: 'mock-viewport',
      timelineClassName: 'mock-timeline'
    });
    const children = getChildren(element);

    expect(children).toHaveLength(3);
    expect(children[2].props.className).toBe('mock-timeline');
  });

  it('routes integrated timeline seek to store.seek and onTimelineSeek callback', () => {
    const store = createStoreMock();
    const onTimelineSeek = vi.fn();

    const element = ReplayPlayer({
      store,
      showTimeline: true,
      timelineAriaLabel: 'Linea del replay',
      timelineFramePrefix: 'Paso ',
      onTimelineSeek
    });
    const children = getChildren(element);
    const timeline = children[1];

    expect(timeline.props.ariaLabel).toBe('Linea del replay');
    expect(timeline.props.framePrefix).toBe('Paso ');

    timeline.props.onSeek(2);
    expect(store.seek).toHaveBeenCalledWith(2);
    expect(onTimelineSeek).toHaveBeenCalledWith(2);
  });
});
