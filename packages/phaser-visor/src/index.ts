import { GameSnapshot, RendererAdapter } from '@manaflow/types';

interface PhaserLikeScene {
  add?: {
    text?: (x: number, y: number, value: string, style?: Record<string, unknown>) => { destroy?: () => void };
  };
}

export class PhaserRendererAdapter implements RendererAdapter {
  private container: HTMLElement | null = null;
  private scene: PhaserLikeScene;
  private nodes: Array<{ destroy?: () => void }> = [];

  constructor(scene: PhaserLikeScene) {
    this.scene = scene;
  }

  mount(container: HTMLElement): void {
    this.container = container;
  }

  render(snapshot: GameSnapshot): void {
    this.clearNodes();

    if (!this.scene.add?.text) {
      if (this.container) {
        this.container.textContent = `Phaser adapter mounted. Turn ${snapshot.turn}, phase ${snapshot.currentPhase}`;
      }
      return;
    }

    this.nodes.push(this.scene.add.text(20, 20, `Turn ${snapshot.turn} · ${snapshot.currentPhase}`, { color: '#ffffff' }));

    const zones = ['hand', 'board', 'graveyard', 'deck', 'stack'];
    zones.forEach((zoneId, index) => {
      const count = snapshot.zones[zoneId]?.length ?? 0;
      this.nodes.push(this.scene.add!.text!(20, 60 + index * 24, `${zoneId}: ${count}`, { color: '#c3d9ff' }));
    });
  }

  highlight(eventId?: string): void {
    if (!this.container) {
      return;
    }

    this.container.dataset.highlight = eventId ?? '';
  }

  destroy(): void {
    this.clearNodes();
    this.container = null;
  }

  private clearNodes(): void {
    for (const node of this.nodes) {
      node.destroy?.();
    }
    this.nodes = [];
  }
}
