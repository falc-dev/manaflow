import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { GameSnapshot } from '@manaflow/types';
import { HtmlRendererAdapter } from './index';

class MockClassList {
  private values = new Set<string>();

  add(...tokens: string[]): void {
    tokens.forEach((token) => this.values.add(token));
  }

  contains(token: string): boolean {
    return this.values.has(token);
  }

  toggle(token: string, force?: boolean): boolean {
    if (force === true) {
      this.values.add(token);
      return true;
    }
    if (force === false) {
      this.values.delete(token);
      return false;
    }
    if (this.values.has(token)) {
      this.values.delete(token);
      return false;
    }
    this.values.add(token);
    return true;
  }
}

class MockStyle {
  private values = new Map<string, string>();

  setProperty(name: string, value: string): void {
    this.values.set(name, value);
  }

  getPropertyValue(name: string): string {
    return this.values.get(name) ?? '';
  }
}

class MockElement {
  tagName: string;
  textContent = '';
  parentElement: MockElement | null = null;
  children: MockElement[] = [];
  dataset: Record<string, string> = {};
  classList = new MockClassList();
  style = new MockStyle();
  attributes: Record<string, string> = {};

  constructor(tagName: string) {
    this.tagName = tagName.toLowerCase();
  }

  appendChild(child: MockElement): MockElement {
    if (child.parentElement) {
      child.parentElement.removeChild(child);
    }
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  removeChild(child: MockElement): void {
    const index = this.children.indexOf(child);
    if (index >= 0) {
      this.children.splice(index, 1);
      child.parentElement = null;
    }
  }

  remove(): void {
    this.parentElement?.removeChild(this);
  }

  set innerHTML(value: string) {
    if (value === '') {
      this.children.forEach((child) => {
        child.parentElement = null;
      });
      this.children = [];
      this.textContent = '';
    }
  }

  setAttribute(name: string, value: string): void {
    this.attributes[name] = value;
    if (name.startsWith('data-')) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      this.dataset[key] = value;
    }
  }

  querySelector(selector: string): MockElement | null {
    return findInTree(this, selector);
  }
}

function findInTree(node: MockElement, selector: string): MockElement | null {
  for (const child of node.children) {
    if (matches(child, selector)) {
      return child;
    }
    const nested = findInTree(child, selector);
    if (nested) {
      return nested;
    }
  }
  return null;
}

function matches(node: MockElement, selector: string): boolean {
  if (selector.startsWith('.')) {
    return node.classList.contains(selector.slice(1));
  }
  if (selector === '[data-manaflow-timeline]') {
    return Object.prototype.hasOwnProperty.call(node.attributes, 'data-manaflow-timeline');
  }
  return false;
}

function makeDocument(): { createElement: (tagName: string) => MockElement } {
  return {
    createElement(tagName: string) {
      return new MockElement(tagName);
    }
  };
}

function makeSnapshot(input: {
  currentPhase?: string;
  turn?: number;
  zones?: Record<string, string[]>;
  entities?: Record<string, unknown>;
} = {}): GameSnapshot {
  return {
    id: 's1',
    players: [],
    currentPhase: (input.currentPhase ?? 'DRAW') as GameSnapshot['currentPhase'],
    currentPlayer: 'p1',
    turn: input.turn ?? 1,
    entities: (input.entities as GameSnapshot['entities']) ?? {},
    zones: input.zones ?? { hand: [], board: [], graveyard: [], deck: [], stack: [] },
    metadata: {}
  };
}

function makeCardEntity(name: string, cost: number) {
  return {
    id: 'e1',
    type: 'card',
    components: [
      {
        componentType: 'CARD',
        entityId: 'e1',
        metadata: {
          id: 'c1',
          name,
          description: '',
          cost,
          rarity: 'common'
        }
      }
    ]
  };
}

const originalDocument = (globalThis as { document?: unknown }).document;

describe('HtmlRendererAdapter', () => {
  beforeEach(() => {
    (globalThis as { document: unknown }).document = makeDocument();
  });

  afterEach(() => {
    (globalThis as { document?: unknown }).document = originalDocument;
  });

  it('renders default card and timeline', () => {
    const container = new MockElement('div') as unknown as HTMLElement;
    const adapter = new HtmlRendererAdapter();
    const snapshot = makeSnapshot({
      turn: 3,
      currentPhase: 'MAIN',
      zones: { hand: ['e1'], board: [], graveyard: [], deck: [], stack: [] },
      entities: { e1: makeCardEntity('Fire Bolt', 2) }
    });

    adapter.mount(container);
    adapter.render(snapshot);

    const root = (container as unknown as MockElement).children[0];
    const timeline = root.querySelector('[data-manaflow-timeline]');
    const cardName = root.querySelector('.replay-player__card-name');
    const cardCost = root.querySelector('.replay-player__card-cost');

    expect(timeline?.textContent).toBe('Turn 3 · Phase MAIN · Player p1');
    expect(cardName?.textContent).toBe('Fire Bolt');
    expect(cardCost?.textContent).toBe('Cost 2');
  });

  it('prioritizes renderCard over cardTagName', () => {
    const container = new MockElement('div') as unknown as HTMLElement;
    const adapter = new HtmlRendererAdapter({
      cardTagName: 'mf-card',
      renderCard: ({ entityId }) => {
        const el = (document as { createElement: (tagName: string) => MockElement }).createElement('div');
        el.classList.add('custom-render-card');
        el.textContent = entityId;
        return el as unknown as HTMLElement;
      }
    });

    adapter.mount(container);
    adapter.render(
      makeSnapshot({
        zones: { hand: ['e1'], board: [], graveyard: [], deck: [], stack: [] },
        entities: { e1: makeCardEntity('Ice Lance', 1) }
      })
    );

    const root = (container as unknown as MockElement).children[0];
    const custom = root.querySelector('.custom-render-card');

    expect(custom).not.toBeNull();
    expect(custom?.tagName).toBe('div');
  });

  it('uses cardTagName and updates properties on reusable nodes', () => {
    const container = new MockElement('div') as unknown as HTMLElement;
    const adapter = new HtmlRendererAdapter({
      cardTagName: 'mf-card'
    });

    adapter.mount(container);
    adapter.render(
      makeSnapshot({
        zones: { hand: ['e1'], board: [], graveyard: [], deck: [], stack: [] },
        entities: { e1: makeCardEntity('Guardian', 4) }
      })
    );
    adapter.render(
      makeSnapshot({
        zones: { hand: [], board: ['e1'], graveyard: [], deck: [], stack: [] },
        entities: { e1: makeCardEntity('Guardian+', 5) }
      })
    );

    const root = (container as unknown as MockElement).children[0];
    const card = root.children
      .flatMap((node) => node.children)
      .flatMap((node) => node.children)
      .find((node) => node.tagName === 'mf-card');

    expect(card).toBeDefined();
    expect((card as unknown as { entityId?: string }).entityId).toBe('e1');
    expect((card as unknown as { card?: { name?: string; cost?: number } }).card?.name).toBe('Guardian+');
    expect((card as unknown as { card?: { name?: string; cost?: number } }).card?.cost).toBe(5);
  });

  it('reuses default card node between renders', () => {
    const container = new MockElement('div') as unknown as HTMLElement;
    const adapter = new HtmlRendererAdapter();

    adapter.mount(container);
    adapter.render(
      makeSnapshot({
        zones: { hand: ['e1'], board: [], graveyard: [], deck: [], stack: [] },
        entities: { e1: makeCardEntity('Ranger', 3) }
      })
    );

    const root = (container as unknown as MockElement).children[0];
    const firstNode = root.querySelector('.replay-player__card');
    adapter.render(
      makeSnapshot({
        zones: { hand: [], board: ['e1'], graveyard: [], deck: [], stack: [] },
        entities: { e1: makeCardEntity('Ranger Elite', 6) }
      })
    );
    const secondNode = root.querySelector('.replay-player__card');
    const secondName = root.querySelector('.replay-player__card-name');

    expect(firstNode).toBe(secondNode);
    expect(secondName?.textContent).toBe('Ranger Elite');
  });

  it('supports renderTimeline hook', () => {
    const container = new MockElement('div') as unknown as HTMLElement;
    const adapter = new HtmlRendererAdapter({
      renderTimeline: ({ element, defaultText }) => {
        element.textContent = `[custom] ${defaultText}`;
      }
    });

    adapter.mount(container);
    adapter.render(
      makeSnapshot({
        turn: 8,
        currentPhase: 'COMBAT'
      })
    );

    const root = (container as unknown as MockElement).children[0];
    const timeline = root.querySelector('[data-manaflow-timeline]');
    expect(timeline?.textContent).toBe('[custom] Turn 8 · Phase COMBAT · Player p1');
  });

  it('supports renderZone hook', () => {
    const container = new MockElement('div') as unknown as HTMLElement;
    const adapter = new HtmlRendererAdapter({
      renderZone: ({ zone, titleElement, entityIds }) => {
        titleElement.textContent = `${zone.title} (${entityIds.length})`;
      }
    });

    adapter.mount(container);
    adapter.render(
      makeSnapshot({
        zones: { hand: ['e1', 'e2'], board: [], graveyard: [], deck: [], stack: [] },
        entities: { e1: makeCardEntity('Wolf', 1), e2: makeCardEntity('Bear', 2) }
      })
    );

    const root = (container as unknown as MockElement).children[0];
    const handZone = root.children.find((node) => {
      const rail = node.children.find((child) => child.classList.contains('replay-player__zone-rail'));
      return rail?.dataset.zoneId === 'hand';
    });
    const handTitle = handZone?.children.find((node) => node.classList.contains('replay-player__zone-title'));

    expect(handTitle?.textContent).toBe('Hand (2)');
  });

  it('supports renderCardUpdate for incremental custom-card updates', () => {
    const container = new MockElement('div') as unknown as HTMLElement;
    const updates: Array<{ entityId: string; cost: number | undefined }> = [];
    const adapter = new HtmlRendererAdapter({
      renderCard: ({ entityId, card }) => {
        const el = (document as { createElement: (tagName: string) => MockElement }).createElement('div');
        el.classList.add('custom-updatable-card');
        el.textContent = `${entityId}:${card?.cost ?? '-'}`;
        return el as unknown as HTMLElement;
      },
      renderCardUpdate: ({ element, entityId, card }) => {
        updates.push({ entityId, cost: card?.cost });
        element.textContent = `${entityId}:${card?.cost ?? '-'}`;
      }
    });

    adapter.mount(container);
    adapter.render(
      makeSnapshot({
        zones: { hand: ['e1'], board: [], graveyard: [], deck: [], stack: [] },
        entities: { e1: makeCardEntity('Mage', 2) }
      })
    );

    const root = (container as unknown as MockElement).children[0];
    const firstNode = root.querySelector('.custom-updatable-card');
    adapter.render(
      makeSnapshot({
        zones: { hand: [], board: ['e1'], graveyard: [], deck: [], stack: [] },
        entities: { e1: makeCardEntity('Mage+', 7) }
      })
    );
    const secondNode = root.querySelector('.custom-updatable-card');

    expect(firstNode).toBe(secondNode);
    expect(secondNode?.textContent).toBe('e1:7');
    expect(updates).toEqual([{ entityId: 'e1', cost: 7 }]);
  });

  it('fires lifecycle hooks on mount and unmount', () => {
    const container = new MockElement('div') as unknown as HTMLElement;
    const mounted: string[] = [];
    const unmounted: string[] = [];
    const adapter = new HtmlRendererAdapter({
      onCardMount: ({ entityId }) => {
        mounted.push(entityId);
      },
      onCardUnmount: ({ entityId }) => {
        unmounted.push(entityId);
      }
    });

    adapter.mount(container);
    adapter.render(
      makeSnapshot({
        zones: { hand: ['e1'], board: ['e2'], graveyard: [], deck: [], stack: [] },
        entities: { e1: makeCardEntity('A', 1), e2: makeCardEntity('B', 2) }
      })
    );
    adapter.render(
      makeSnapshot({
        zones: { hand: ['e2'], board: [], graveyard: [], deck: [], stack: [] },
        entities: { e2: makeCardEntity('B+', 3) }
      })
    );
    adapter.destroy();

    expect(mounted).toEqual(['e1', 'e2']);
    expect(unmounted).toEqual(['e1', 'e2']);
  });
});
