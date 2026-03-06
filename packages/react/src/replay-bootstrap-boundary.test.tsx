import { describe, expect, it } from 'vitest';
import { ReplayBootstrapBoundary } from './components/replay-bootstrap-boundary';
import { ReactReplayStore } from './store';

function createStoreMock(): ReactReplayStore {
  return {
    getFrame: () => {
      throw new Error('not implemented');
    },
    getState: () => {
      throw new Error('not implemented');
    },
    subscribe: () => () => undefined,
    next: () => null,
    previous: () => null,
    seek: () => null,
    render: () => undefined,
    destroy: () => undefined
  } as unknown as ReactReplayStore;
}

describe('ReplayBootstrapBoundary', () => {
  it('renders loading fallback while loading', () => {
    const element = ReplayBootstrapBoundary({
      loading: true,
      error: null,
      store: null,
      loadingFallback: 'Loading...',
      children: () => null
    });

    expect(element?.props.children).toBe('Loading...');
  });

  it('renders error UI when bootstrap fails', () => {
    const element = ReplayBootstrapBoundary({
      loading: false,
      error: new Error('Boom'),
      store: null,
      validationIssues: [],
      children: () => null
    });

    const section = element?.props.children;
    expect(section.type).toBe('section');
    expect(section.props.children[0].props.children).toBe('Boom');
  });

  it('renders children with store when ready', () => {
    const store = createStoreMock();
    const element = ReplayBootstrapBoundary({
      loading: false,
      error: null,
      store,
      children: (resolvedStore) => (resolvedStore === store ? 'ready' : 'wrong')
    });

    expect(element?.props.children).toBe('ready');
  });
});
