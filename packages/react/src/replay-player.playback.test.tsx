import { describe, expect, it, vi } from 'vitest';
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
      metadata: {}
    }
  },
  currentFrame: 0,
  totalFrames: 5,
  canStepBack: false,
  canStepForward: true
};

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  return {
    ...react,
    useState: <T,>(initialValue: T) => [initialValue, () => undefined] as const,
    useRef: <T,>(initialValue: T) => ({ current: initialValue }),
    useEffect: (effect: () => void | (() => void)) => {
      effect();
    }
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

function createStoreMock(overrides: Partial<ReactReplayStore> = {}): ReactReplayStore {
  const stateRef = { ...mockedState };
  return {
    getFrame: vi.fn(() => stateRef.frame),
    getState: vi.fn(() => stateRef),
    subscribe: vi.fn(() => () => undefined),
    next: vi.fn(() => null),
    previous: vi.fn(() => null),
    seek: vi.fn(() => null),
    render: vi.fn(),
    destroy: vi.fn(),
    ...overrides
  } as unknown as ReactReplayStore;
}

describe('ReplayPlayer playback controls', () => {
  it('uses playbackRate to compute autoplay interval', () => {
    const setIntervalMock = vi.fn(() => 1);
    const clearIntervalMock = vi.fn();
    (globalThis as unknown as { window: { setInterval: typeof setInterval; clearInterval: typeof clearInterval } }).window =
      {
        setInterval: setIntervalMock as unknown as typeof setInterval,
        clearInterval: clearIntervalMock as unknown as typeof clearInterval
      };

    const store = createStoreMock();
    ReplayPlayer({
      store,
      playing: true,
      autoplayIntervalMs: 800,
      playbackRate: 2
    });

    expect(setIntervalMock).toHaveBeenCalledTimes(1);
    expect(setIntervalMock.mock.calls[0][1]).toBe(400);
  });

  it('loops from loopRange.from when playback is inside loop and reaches loop end', () => {
    const setIntervalMock = vi.fn((callback: () => void) => {
      callback();
      return 1;
    });
    const clearIntervalMock = vi.fn();
    (globalThis as unknown as { window: { setInterval: typeof setInterval; clearInterval: typeof clearInterval } }).window =
      {
        setInterval: setIntervalMock as unknown as typeof setInterval,
        clearInterval: clearIntervalMock as unknown as typeof clearInterval
      };

    const storeStateAtEnd = {
      ...mockedState,
      currentFrame: 3
    };
    const store = createStoreMock({
      getState: vi.fn(() => storeStateAtEnd)
    });

    ReplayPlayer({
      store,
      playing: true,
      loop: true,
      loopRange: { from: 1, to: 3 }
    });

    expect(store.seek).toHaveBeenCalledWith(1);
    expect(store.next).not.toHaveBeenCalled();
  });

  it('stops playback when non-loop mode reaches the end', () => {
    const setIntervalMock = vi.fn((callback: () => void) => {
      callback();
      return 1;
    });
    const clearIntervalMock = vi.fn();
    (globalThis as unknown as { window: { setInterval: typeof setInterval; clearInterval: typeof clearInterval } }).window =
      {
        setInterval: setIntervalMock as unknown as typeof setInterval,
        clearInterval: clearIntervalMock as unknown as typeof clearInterval
      };

    const onPlayingChange = vi.fn();
    const onReachEnd = vi.fn();
    const store = createStoreMock({
      next: vi.fn(() => null)
    });

    ReplayPlayer({
      store,
      playing: true,
      loop: false,
      onPlayingChange,
      onReachEnd
    });

    expect(store.next).toHaveBeenCalledTimes(1);
    expect(onReachEnd).toHaveBeenCalledTimes(1);
    expect(onPlayingChange).toHaveBeenCalledWith(false);
  });
});
