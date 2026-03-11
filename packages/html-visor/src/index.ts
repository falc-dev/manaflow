import { Card, GameSnapshot, ReplayFrame, RendererAdapter } from '@manaflow/types';

export interface HtmlVisorZoneConfig {
  id: string;
  title: string;
  top: number;
}

export interface HtmlRendererAdapterOptions {
  zones?: HtmlVisorZoneConfig[];
  minHeight?: string;
  rootClassName?: string;
  cardClassName?: string;
  timelineFormatter?: (snapshot: GameSnapshot) => string;
  cardTagName?: string;
  renderCard?: (context: RenderCardContext) => HTMLElement;
  renderCardUpdate?: (context: RenderCardUpdateContext) => void;
  renderTimeline?: (context: RenderTimelineContext) => void;
  renderZone?: (context: RenderZoneContext) => void;
  onCardMount?: (context: CardLifecycleContext) => void;
  onCardUnmount?: (context: CardLifecycleContext) => void;
}

export interface RenderCardContext {
  entityId: string;
  snapshot: GameSnapshot;
  card: Card | undefined;
  defaultRender: () => HTMLElement;
}

export interface RenderCardUpdateContext {
  element: HTMLElement;
  entityId: string;
  snapshot: GameSnapshot;
  card: Card | undefined;
  defaultUpdate: () => void;
}

export interface HtmlVisorCardElement extends HTMLElement {
  entityId?: string;
  snapshot?: GameSnapshot;
  card?: Card;
}

export interface RenderTimelineContext {
  snapshot: GameSnapshot;
  element: HTMLElement;
  defaultText: string;
}

export interface RenderZoneContext {
  zone: HtmlVisorZoneConfig;
  snapshot: GameSnapshot;
  element: HTMLElement;
  titleElement: HTMLElement;
  railElement: HTMLElement;
  entityIds: string[];
}

export interface CardLifecycleContext {
  element: HTMLElement;
  entityId: string;
  snapshot: GameSnapshot;
  card: Card | undefined;
}

interface ZoneDomRefs {
  zone: HtmlVisorZoneConfig;
  wrapper: HTMLElement;
  title: HTMLElement;
  rail: HTMLElement;
}

interface ZoneView {
  entityIds: string[];
  visibleIds: string[];
  overflowCount: number;
  title: string;
  hidden: boolean;
  focused: boolean;
}

const DEFAULT_ZONE_LABELS: HtmlVisorZoneConfig[] = [
  { id: 'hand', title: 'Hand', top: 480 },
  { id: 'board', title: 'Board', top: 300 },
  { id: 'graveyard', title: 'Graveyard', top: 120 },
  { id: 'deck', title: 'Deck', top: 640 },
  { id: 'stack', title: 'Stack', top: 40 }
];

export class HtmlRendererAdapter implements RendererAdapter {
  private container: HTMLElement | null = null;
  private root: HTMLElement | null = null;
  private timeline: HTMLElement | null = null;
  private lastSnapshot: GameSnapshot | null = null;
  private focusZones = new Set<string>();
  private zoneRefs = new Map<string, ZoneDomRefs>();
  private cardNodes = new Map<string, HTMLElement>();
  private options: HtmlRendererAdapterOptions;

  constructor(options: HtmlRendererAdapterOptions = {}) {
    this.options = options;
  }

  mount(container: HTMLElement): void {
    this.container = container;
    container.innerHTML = '';

    const root = document.createElement('div');
    root.classList.add('replay-player');
    if (this.options.rootClassName) {
      root.classList.add(this.options.rootClassName);
    }
    root.style.setProperty('--replay-player-min-height', this.options.minHeight ?? '760px');

    this.root = root;
    container.appendChild(root);
    this.buildStaticLayout();
  }

  render(snapshot: GameSnapshot): void {
    if (!this.root) {
      return;
    }

    this.lastSnapshot = snapshot;
    this.updateTimeline(snapshot);

    if (this.options.renderCard) {
      this.syncCardsWithCustomRenderer(snapshot);
      return;
    }

    this.syncCardsWithReusableNodes(snapshot);
  }

  renderFrame(frame: ReplayFrame): void {
    this.focusZones = new Set(frame.event?.metadata?.focusZones ?? []);
    this.render(frame.snapshot);
  }

  highlight(eventId?: string): void {
    if (!this.root) {
      return;
    }

    if (!this.timeline) {
      return;
    }

    this.timeline.classList.toggle('replay-player__timeline--highlighted', Boolean(eventId));
  }

  destroy(): void {
    this.unmountAllCards();

    if (this.container) {
      this.container.innerHTML = '';
    }
    this.timeline = null;
    this.lastSnapshot = null;
    this.zoneRefs.clear();
    this.cardNodes.clear();
    this.root = null;
    this.container = null;
  }

  private buildStaticLayout(): void {
    if (!this.root) {
      return;
    }

    this.zoneRefs.clear();
    this.cardNodes.clear();

    const timeline = document.createElement('div');
    timeline.classList.add('replay-player__timeline');
    timeline.setAttribute('data-manaflow-timeline', 'true');
    timeline.setAttribute('role', 'status');
    timeline.setAttribute('aria-live', 'polite');
    this.timeline = timeline;
    this.root.appendChild(timeline);

    for (const zone of this.options.zones ?? DEFAULT_ZONE_LABELS) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('replay-player__zone');
      wrapper.style.setProperty('--replay-player-zone-top', `${zone.top}px`);
      wrapper.setAttribute('role', 'group');
      wrapper.setAttribute('aria-label', zone.title);

      const title = document.createElement('div');
      title.classList.add('replay-player__zone-title');
      title.textContent = zone.title;

      const rail = document.createElement('div');
      rail.classList.add('replay-player__zone-rail');
      rail.dataset.zoneId = zone.id;

      wrapper.appendChild(title);
      wrapper.appendChild(rail);
      this.root.appendChild(wrapper);
      this.zoneRefs.set(zone.id, {
        zone,
        wrapper,
        title,
        rail
      });
    }
  }

  private updateTimeline(snapshot: GameSnapshot): void {
    if (!this.timeline) {
      return;
    }

    const phase = snapshot.currentPhase ?? snapshot.metadata?.currentPhase ?? '';
    const defaultText = this.options.timelineFormatter?.(snapshot) ??
      `Turn ${snapshot.turn} · Phase ${phase} · Player ${snapshot.currentPlayer}`;
    this.timeline.textContent = defaultText;

    if (this.options.renderTimeline) {
      this.options.renderTimeline({
        snapshot,
        element: this.timeline,
        defaultText
      });
    }
  }

  private getZoneView(snapshot: GameSnapshot, zone: HtmlVisorZoneConfig): ZoneView {
    const entityIds = snapshot.zones[zone.id] ?? [];
    const zoneMeta = snapshot.zoneMeta?.[zone.id];
    const title = zoneMeta?.label ?? zone.title;
    const visibility = zoneMeta?.visibility;
    const viewerId =
      typeof snapshot.metadata?.viewerId === 'string' ? snapshot.metadata.viewerId : snapshot.currentPlayer;
    const isOwnerHidden =
      visibility === 'owner' && zoneMeta?.ownerId && zoneMeta.ownerId !== 'shared' && zoneMeta.ownerId !== viewerId;
    const hidden = visibility === 'hidden' || isOwnerHidden;
    const capacity = zoneMeta?.capacity;
    const visibleIds = hidden || !capacity ? entityIds : entityIds.slice(0, Math.max(0, capacity));
    const overflowCount = hidden || !capacity ? 0 : Math.max(0, entityIds.length - Math.max(0, capacity));
    const focused = this.focusZones.has(zone.id);

    return {
      entityIds,
      visibleIds,
      overflowCount,
      title,
      hidden,
      focused
    };
  }

  private applyZonePresentation(refs: ZoneDomRefs, view: ZoneView): void {
    refs.title.textContent = view.title;
    refs.wrapper.classList.toggle('replay-player__zone--focused', view.focused);
    refs.wrapper.classList.toggle('replay-player__zone--hidden', view.hidden);
  }

  private renderZonePlaceholder(refs: ZoneDomRefs, view: ZoneView): void {
    refs.rail.innerHTML = '';
    const placeholder = document.createElement('div');
    placeholder.classList.add('replay-player__zone-placeholder');
    placeholder.textContent = `Hidden (${view.entityIds.length})`;
    refs.rail.appendChild(placeholder);
  }

  private syncCardsWithCustomRenderer(snapshot: GameSnapshot): void {
    if (!this.options.renderCardUpdate) {
      this.unmountAllCards();
      this.syncCardsWithCustomRemount(snapshot);
      return;
    }

    this.syncCardsWithCustomIncremental(snapshot);
  }

  private syncCardsWithCustomRemount(snapshot: GameSnapshot): void {
    this.cardNodes.clear();

    for (const zone of this.options.zones ?? DEFAULT_ZONE_LABELS) {
      const refs = this.zoneRefs.get(zone.id);
      if (!refs) {
        continue;
      }

      const view = this.getZoneView(snapshot, zone);
      this.applyZonePresentation(refs, view);
      refs.rail.innerHTML = '';

      if (view.hidden) {
        this.renderZonePlaceholder(refs, view);
        this.applyZoneRenderer(refs, snapshot, view.entityIds);
        continue;
      }

      for (const entityId of view.visibleIds) {
        const cardNode = this.renderCardNode(entityId, snapshot);
        this.cardNodes.set(entityId, cardNode);
        refs.rail.appendChild(cardNode);
        this.notifyCardMounted(cardNode, entityId, snapshot);
      }
      if (view.overflowCount > 0) {
        const overflow = document.createElement('div');
        overflow.classList.add('replay-player__zone-overflow');
        overflow.textContent = `+${view.overflowCount} more`;
        refs.rail.appendChild(overflow);
      }
      this.applyZoneRenderer(refs, snapshot, view.entityIds);
    }
  }

  private syncCardsWithCustomIncremental(snapshot: GameSnapshot): void {
    const activeEntityIds = new Set<string>();

    for (const zone of this.options.zones ?? DEFAULT_ZONE_LABELS) {
      const refs = this.zoneRefs.get(zone.id);
      if (!refs) {
        continue;
      }

      const view = this.getZoneView(snapshot, zone);
      this.applyZonePresentation(refs, view);

      refs.rail.querySelector('.replay-player__zone-placeholder')?.remove();
      refs.rail.querySelectorAll('.replay-player__zone-overflow').forEach((el) => el.remove());

      if (view.hidden) {
        this.renderZonePlaceholder(refs, view);
        this.applyZoneRenderer(refs, snapshot, view.entityIds);
        continue;
      }

      for (const entityId of view.visibleIds) {
        activeEntityIds.add(entityId);

        let cardNode = this.cardNodes.get(entityId);
        if (!cardNode) {
          cardNode = this.renderCardNode(entityId, snapshot);
          this.cardNodes.set(entityId, cardNode);
          this.notifyCardMounted(cardNode, entityId, snapshot);
        } else {
          this.updateCardNode(cardNode, entityId, snapshot);
        }

        if (cardNode.parentElement !== refs.rail) {
          refs.rail.appendChild(cardNode);
        }
      }

      if (view.overflowCount > 0) {
        const overflow = document.createElement('div');
        overflow.classList.add('replay-player__zone-overflow');
        overflow.textContent = `+${view.overflowCount} more`;
        refs.rail.appendChild(overflow);
      }

      this.applyZoneRenderer(refs, snapshot, view.entityIds);
    }

    this.removeInactiveCards(snapshot, activeEntityIds);
  }

  private syncCardsWithReusableNodes(snapshot: GameSnapshot): void {
    const activeEntityIds = new Set<string>();

    for (const zone of this.options.zones ?? DEFAULT_ZONE_LABELS) {
      const refs = this.zoneRefs.get(zone.id);
      if (!refs) {
        continue;
      }

      const view = this.getZoneView(snapshot, zone);
      this.applyZonePresentation(refs, view);

      refs.rail.querySelector('.replay-player__zone-placeholder')?.remove();
      refs.rail.querySelectorAll('.replay-player__zone-overflow').forEach((el) => el.remove());

      if (view.hidden) {
        this.renderZonePlaceholder(refs, view);
        this.applyZoneRenderer(refs, snapshot, view.entityIds);
        continue;
      }

      for (const entityId of view.visibleIds) {
        activeEntityIds.add(entityId);

        let cardNode = this.cardNodes.get(entityId);
        if (!cardNode) {
          cardNode = this.renderCardNode(entityId, snapshot);
          this.cardNodes.set(entityId, cardNode);
          this.notifyCardMounted(cardNode, entityId, snapshot);
        }

        this.updateCardNode(cardNode, entityId, snapshot);

        if (cardNode.parentElement !== refs.rail) {
          refs.rail.appendChild(cardNode);
        }
      }

      if (view.overflowCount > 0) {
        const overflow = document.createElement('div');
        overflow.classList.add('replay-player__zone-overflow');
        overflow.textContent = `+${view.overflowCount} more`;
        refs.rail.appendChild(overflow);
      }

      this.applyZoneRenderer(refs, snapshot, view.entityIds);
    }

    this.removeInactiveCards(snapshot, activeEntityIds);
  }

  private applyZoneRenderer(refs: ZoneDomRefs, snapshot: GameSnapshot, entityIds: string[]): void {
    if (!this.options.renderZone) {
      return;
    }

    this.options.renderZone({
      zone: refs.zone,
      snapshot,
      element: refs.wrapper,
      titleElement: refs.title,
      railElement: refs.rail,
      entityIds
    });
  }

  private renderCardNode(entityId: string, snapshot: GameSnapshot): HTMLElement {
    const cardMeta = this.getCardMetadata(entityId, snapshot);
    const defaultRender = () => this.renderDefaultCard(entityId, cardMeta);

    if (this.options.renderCard) {
      return this.options.renderCard({
        entityId,
        snapshot,
        card: cardMeta,
        defaultRender
      });
    }

    if (this.options.cardTagName) {
      return this.renderCustomCardElement(this.options.cardTagName, entityId, snapshot, cardMeta);
    }

    return defaultRender();
  }

  private updateCardNode(cardNode: HTMLElement, entityId: string, snapshot: GameSnapshot): void {
    const cardMeta = this.getCardMetadata(entityId, snapshot);
    const entityState = snapshot.entities[entityId]?.state;

    if (this.options.renderCard && this.options.renderCardUpdate) {
      this.options.renderCardUpdate({
        element: cardNode,
        entityId,
        snapshot,
        card: cardMeta,
        defaultUpdate: () => this.updateDefaultCardNode(cardNode, entityId, cardMeta, entityState)
      });
      return;
    }

    if (this.options.cardTagName) {
      const customCard = cardNode as HtmlVisorCardElement;
      customCard.entityId = entityId;
      customCard.snapshot = snapshot;
      customCard.card = cardMeta;
      return;
    }

    this.updateDefaultCardNode(cardNode, entityId, cardMeta, entityState);
  }

  private getCardMetadata(entityId: string, snapshot: GameSnapshot): Card | undefined {
    const entity = snapshot.entities[entityId];
    return entity?.components.find((component) => component.componentType === 'CARD')?.metadata as Card | undefined;
  }

  private renderDefaultCard(entityId: string, cardMeta: Card | undefined): HTMLElement {
    const el = document.createElement('div');
    el.classList.add('replay-player__card');
    el.setAttribute('role', 'article');
    if (this.options.cardClassName) {
      el.classList.add(this.options.cardClassName);
    }

    const name = document.createElement('div');
    name.classList.add('replay-player__card-name');

    const cost = document.createElement('div');
    cost.classList.add('replay-player__card-cost');

    const badges = document.createElement('div');
    badges.classList.add('replay-player__card-badges');

    el.appendChild(name);
    el.appendChild(cost);
    el.appendChild(badges);
    this.updateDefaultCardNode(el, entityId, cardMeta);
    return el;
  }

  private updateDefaultCardNode(
    cardNode: HTMLElement,
    entityId: string,
    cardMeta: Card | undefined,
    entityState?: GameSnapshot['entities'][string]['state']
  ): void {
    const name = cardNode.querySelector('.replay-player__card-name');
    const cost = cardNode.querySelector('.replay-player__card-cost');
    const badges = cardNode.querySelector('.replay-player__card-badges');

    if (name) {
      name.textContent = entityState?.faceDown ? 'Face-down' : cardMeta?.name ?? entityId;
    }
    if (cost) {
      cost.textContent = entityState?.faceDown ? '' : `Cost ${cardMeta?.cost ?? '-'}`;
    }

    cardNode.classList.toggle('replay-player__card--tapped', Boolean(entityState?.tapped));
    cardNode.classList.toggle('replay-player__card--exhausted', Boolean(entityState?.exhausted));
    cardNode.classList.toggle('replay-player__card--face-down', Boolean(entityState?.faceDown));

    if (badges) {
      badges.innerHTML = '';
      if (entityState?.damage !== undefined) {
        const damage = document.createElement('div');
        damage.classList.add('replay-player__card-badge', 'replay-player__card-badge--damage');
        damage.textContent = `${entityState.damage} dmg`;
        badges.appendChild(damage);
      }
      if (entityState?.attachments?.length) {
        const attachments = document.createElement('div');
        attachments.classList.add('replay-player__card-badge', 'replay-player__card-badge--attachments');
        attachments.textContent = `+${entityState.attachments.length} att`;
        badges.appendChild(attachments);
      }
      if (entityState?.counters) {
        for (const [key, value] of Object.entries(entityState.counters)) {
          const counter = document.createElement('div');
          counter.classList.add('replay-player__card-badge');
          counter.textContent = `${key}:${value}`;
          badges.appendChild(counter);
        }
      }
    }
  }

  private renderCustomCardElement(
    tagName: string,
    entityId: string,
    snapshot: GameSnapshot,
    cardMeta: Card | undefined
  ): HTMLElement {
    const customCard = document.createElement(tagName) as HtmlVisorCardElement;
    customCard.entityId = entityId;
    customCard.snapshot = snapshot;
    customCard.card = cardMeta;
    customCard.classList.add('replay-player__card');
    customCard.setAttribute('role', 'article');
    if (this.options.cardClassName) {
      customCard.classList.add(this.options.cardClassName);
    }
    return customCard;
  }

  private removeInactiveCards(snapshot: GameSnapshot, activeEntityIds: Set<string>): void {
    for (const [entityId, cardNode] of this.cardNodes.entries()) {
      if (activeEntityIds.has(entityId)) {
        continue;
      }

      this.notifyCardUnmounted(cardNode, entityId, snapshot);
      cardNode.remove();
      this.cardNodes.delete(entityId);
    }
  }

  private unmountAllCards(): void {
    if (!this.cardNodes.size) {
      return;
    }

    const snapshot = this.lastSnapshot ?? this.createEmptySnapshot();
    for (const [entityId, cardNode] of this.cardNodes.entries()) {
      this.notifyCardUnmounted(cardNode, entityId, snapshot);
      cardNode.remove();
    }
    this.cardNodes.clear();
  }

  private notifyCardMounted(cardNode: HTMLElement, entityId: string, snapshot: GameSnapshot): void {
    if (!this.options.onCardMount) {
      return;
    }

    this.options.onCardMount({
      element: cardNode,
      entityId,
      snapshot,
      card: this.getCardMetadata(entityId, snapshot)
    });
  }

  private notifyCardUnmounted(cardNode: HTMLElement, entityId: string, snapshot: GameSnapshot): void {
    if (!this.options.onCardUnmount) {
      return;
    }

    this.options.onCardUnmount({
      element: cardNode,
      entityId,
      snapshot,
      card: this.getCardMetadata(entityId, snapshot)
    });
  }

  private createEmptySnapshot(): GameSnapshot {
    return {
      id: 'html_visor_empty_snapshot',
      players: [],
      currentPhase: 'DRAW',
      currentPlayer: '',
      turn: 0,
      entities: {},
      zones: {},
      metadata: { rulesProfile: 'generic-v1' }
    };
  }
}
