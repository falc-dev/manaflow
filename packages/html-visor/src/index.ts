import { Card, GameSnapshot, RendererAdapter } from '@manaflow/types';

const ZONE_LABELS: Array<{ id: string; title: string; top: number }> = [
  { id: 'hand', title: 'Hand', top: 480 },
  { id: 'board', title: 'Board', top: 300 },
  { id: 'graveyard', title: 'Graveyard', top: 120 },
  { id: 'deck', title: 'Deck', top: 640 },
  { id: 'stack', title: 'Stack', top: 40 }
];

export class HtmlRendererAdapter implements RendererAdapter {
  private container: HTMLElement | null = null;
  private root: HTMLElement | null = null;

  mount(container: HTMLElement): void {
    this.container = container;
    container.innerHTML = '';

    const root = document.createElement('div');
    root.style.position = 'relative';
    root.style.width = '100%';
    root.style.minHeight = '760px';
    root.style.background = 'linear-gradient(180deg, #19324d 0%, #0f1e2e 100%)';
    root.style.borderRadius = '12px';
    root.style.padding = '16px';

    this.root = root;
    container.appendChild(root);
  }

  render(snapshot: GameSnapshot): void {
    if (!this.root) {
      return;
    }

    this.root.innerHTML = '';

    const timeline = document.createElement('div');
    timeline.setAttribute('data-manaflow-timeline', 'true');
    timeline.textContent = `Turn ${snapshot.turn} · Phase ${snapshot.currentPhase} · Player ${snapshot.currentPlayer}`;
    timeline.style.color = '#d9e7f5';
    timeline.style.marginBottom = '12px';
    timeline.style.fontFamily = 'monospace';
    this.root.appendChild(timeline);

    for (const zone of ZONE_LABELS) {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.top = `${zone.top}px`;
      wrapper.style.left = '20px';
      wrapper.style.right = '20px';

      const title = document.createElement('div');
      title.textContent = zone.title;
      title.style.color = '#d9e7f5';
      title.style.marginBottom = '4px';
      title.style.fontWeight = '600';

      const rail = document.createElement('div');
      rail.style.display = 'flex';
      rail.style.gap = '8px';

      for (const entityId of snapshot.zones[zone.id] ?? []) {
        rail.appendChild(this.renderCard(entityId, snapshot));
      }

      wrapper.appendChild(title);
      wrapper.appendChild(rail);
      this.root.appendChild(wrapper);
    }
  }

  highlight(eventId?: string): void {
    if (!this.root) {
      return;
    }

    const timeline = this.root.querySelector('[data-manaflow-timeline]') as HTMLElement | null;
    if (!timeline) {
      return;
    }

    timeline.style.background = eventId ? '#264b73' : 'transparent';
    timeline.style.padding = eventId ? '4px 8px' : '0';
    timeline.style.borderRadius = eventId ? '6px' : '0';
  }

  destroy(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.root = null;
    this.container = null;
  }

  private renderCard(entityId: string, snapshot: GameSnapshot): HTMLElement {
    const entity = snapshot.entities[entityId];
    const cardMeta = entity?.components.find((component) => component.componentType === 'CARD')?.metadata as Card | undefined;

    const el = document.createElement('div');
    el.style.width = '112px';
    el.style.minHeight = '148px';
    el.style.borderRadius = '10px';
    el.style.background = '#f5f3ef';
    el.style.border = '2px solid #d7c29d';
    el.style.padding = '8px';
    el.style.boxSizing = 'border-box';

    const name = document.createElement('div');
    name.textContent = cardMeta?.name ?? entityId;
    name.style.fontWeight = '600';
    name.style.fontSize = '12px';

    const cost = document.createElement('div');
    cost.textContent = `Cost ${cardMeta?.cost ?? '-'}`;
    cost.style.fontSize = '11px';
    cost.style.marginTop = '8px';

    el.appendChild(name);
    el.appendChild(cost);
    return el;
  }
}
