import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReplayEngine } from '@manaflow/core';
import { mountReplayDemo } from './demo';

const { createStoreMock } = vi.hoisted(() => ({
  createStoreMock: vi.fn()
}));

vi.mock('./store', () => ({
  createReactReplayStore: createStoreMock
}));

class FakeElement {
  public readonly tagName: string;
  public children: FakeElement[] = [];
  public textContent = '';
  public style: Record<string, string> = {};
  public dataset: Record<string, string> = {};
  public disabled = false;
  public type = '';
  public min = '';
  public step = '';
  public max = '';
  public value = '';
  private listeners = new Map<string, Set<() => void>>();
  private html = '';

  constructor(tagName: string) {
    this.tagName = tagName.toLowerCase();
  }

  get innerHTML(): string {
    return this.html;
  }

  set innerHTML(value: string) {
    this.html = value;
    if (value === '') {
      this.children = [];
    }
  }

  appendChild(child: FakeElement): FakeElement {
    this.children.push(child);
    return child;
  }

  addEventListener(type: string, handler: () => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);
  }

  removeEventListener(type: string, handler: () => void): void {
    this.listeners.get(type)?.delete(handler);
  }

  emit(type: string): void {
    for (const handler of this.listeners.get(type) ?? []) {
      handler();
    }
  }
}

class FakeDocument {
  createElement(tagName: string): FakeElement {
    return new FakeElement(tagName);
  }
}

interface FakeStoreState {
  frame: { index: number };
  currentFrame: number;
  totalFrames: number;
  canStepBack: boolean;
  canStepForward: boolean;
}

function walk(root: FakeElement, predicate: (node: FakeElement) => boolean): FakeElement | null {
  if (predicate(root)) {
    return root;
  }
  for (const child of root.children) {
    const found = walk(child, predicate);
    if (found) {
      return found;
    }
  }
  return null;
}

describe('mountReplayDemo', () => {
  beforeEach(() => {
    (globalThis as unknown as { document: FakeDocument }).document = new FakeDocument();
    createStoreMock.mockReset();
  });

  it('mounts controls, syncs state, and routes actions to store', () => {
    const state: FakeStoreState = {
      frame: { index: 0 },
      currentFrame: 0,
      totalFrames: 3,
      canStepBack: false,
      canStepForward: true
    };
    const listeners = new Set<(value: FakeStoreState) => void>();
    const store = {
      seek: vi.fn(),
      next: vi.fn(() => null),
      previous: vi.fn(() => null),
      render: vi.fn(),
      destroy: vi.fn(),
      getFrame: vi.fn(() => state.frame),
      getState: vi.fn(() => state),
      subscribe: vi.fn((listener: (value: FakeStoreState) => void) => {
        listeners.add(listener);
        listener(state);
        return () => {
          listeners.delete(listener);
        };
      })
    };
    createStoreMock.mockReturnValue(store);

    const container = new FakeElement('div');
    const handle = mountReplayDemo(container as unknown as HTMLElement, {} as ReplayEngine, {
      autoplayIntervalMs: 50
    });

    expect(store.render).toHaveBeenCalledTimes(1);
    expect(container.children.length).toBe(1);

    const slider = walk(container, (node) => node.tagName === 'input')!;
    slider.value = '2';
    slider.emit('input');
    expect(store.seek).toHaveBeenCalledWith(2);

    const next = walk(container, (node) => node.tagName === 'button' && node.textContent === 'Next')!;
    next.emit('click');
    expect(store.next).toHaveBeenCalled();

    const prev = walk(container, (node) => node.tagName === 'button' && node.textContent === 'Prev')!;
    prev.emit('click');
    expect(store.previous).toHaveBeenCalled();

    handle.destroy();
    expect(store.destroy).toHaveBeenCalledTimes(1);
    expect(container.children.length).toBe(0);
  });

  it('starts and stops autoplay through handle methods', () => {
    vi.useFakeTimers();

    const state: FakeStoreState = {
      frame: { index: 0 },
      currentFrame: 0,
      totalFrames: 2,
      canStepBack: false,
      canStepForward: true
    };
    const store = {
      seek: vi.fn(),
      next: vi
        .fn()
        .mockReturnValueOnce({ index: 1 })
        .mockReturnValueOnce(null),
      previous: vi.fn(() => null),
      render: vi.fn(),
      destroy: vi.fn(),
      getFrame: vi.fn(() => state.frame),
      getState: vi.fn(() => state),
      subscribe: vi.fn((listener: (value: FakeStoreState) => void) => {
        listener(state);
        return () => undefined;
      })
    };
    createStoreMock.mockReturnValue(store);

    const container = new FakeElement('div');
    const handle = mountReplayDemo(container as unknown as HTMLElement, {} as ReplayEngine, {
      autoplayIntervalMs: 20
    });

    handle.play();
    expect(handle.isPlaying()).toBe(true);

    vi.advanceTimersByTime(60);
    expect(store.next).toHaveBeenCalledTimes(2);
    expect(handle.isPlaying()).toBe(false);

    handle.destroy();
    vi.useRealTimers();
  });

  it('restarts from frame 0 when autoplay starts at the end', () => {
    vi.useFakeTimers();

    const state: FakeStoreState = {
      frame: { index: 2 },
      currentFrame: 2,
      totalFrames: 3,
      canStepBack: true,
      canStepForward: false
    };
    const store = {
      seek: vi.fn(),
      next: vi.fn().mockReturnValueOnce({ index: 1 }).mockReturnValueOnce(null),
      previous: vi.fn(() => null),
      render: vi.fn(),
      destroy: vi.fn(),
      getFrame: vi.fn(() => state.frame),
      getState: vi.fn(() => state),
      subscribe: vi.fn((listener: (value: FakeStoreState) => void) => {
        listener(state);
        return () => undefined;
      })
    };
    createStoreMock.mockReturnValue(store);

    const container = new FakeElement('div');
    const handle = mountReplayDemo(container as unknown as HTMLElement, {} as ReplayEngine, {
      autoplayIntervalMs: 20
    });

    handle.play();
    expect(store.seek).toHaveBeenCalledWith(0);

    handle.destroy();
    vi.useRealTimers();
  });
});
