import { describe, expect, it, vi } from 'vitest';
import { ReplayEngine } from '@manaflow/core';
import { GameSnapshot, RendererAdapter, ReplayEvent } from '@manaflow/types';
import { createReplayController } from './controller';

function makeSnapshot(turn: number): GameSnapshot {
  return {
    id: 'game_1',
    players: [],
    currentPhase: 'DRAW',
    currentPlayer: 'p1',
    turn,
    entities: {},
    zones: { deck: [], hand: [], board: [], graveyard: [], stack: [] },
    metadata: {}
  };
}

function makeEvent(id: string, timestamp: number): ReplayEvent {
  return {
    id,
    action: { type: 'NOOP', playerId: 'p1', payload: {}, timestamp },
    timestamp,
    playerId: 'p1'
  };
}

function makeReplay(): ReplayEngine {
  const replay = new ReplayEngine(makeSnapshot(1));
  replay.appendSnapshot(makeSnapshot(2), makeEvent('e1', 1000));
  replay.appendSnapshot(makeSnapshot(3), makeEvent('e2', 2000));
  replay.seek({ frame: 0 });
  return replay;
}

describe('createReplayController', () => {
  it('renders and highlights when stepping', () => {
    const renderer: RendererAdapter = {
      mount: vi.fn(),
      render: vi.fn(),
      highlight: vi.fn(),
      destroy: vi.fn()
    };
    const controller = createReplayController(makeReplay(), { renderer });
    const container = {} as HTMLElement;

    controller.render(container);
    controller.next();

    expect(renderer.mount).toHaveBeenCalledTimes(1);
    expect(renderer.render).toHaveBeenCalledTimes(2);
    expect(renderer.highlight).toHaveBeenCalledTimes(2);
    expect(renderer.highlight).toHaveBeenLastCalledWith('e1');
  });

  it('remounts renderer when container changes', () => {
    const renderer: RendererAdapter = {
      mount: vi.fn(),
      render: vi.fn(),
      highlight: vi.fn(),
      destroy: vi.fn()
    };
    const controller = createReplayController(makeReplay(), { renderer });

    controller.render({} as HTMLElement);
    controller.render({} as HTMLElement);

    expect(renderer.mount).toHaveBeenCalledTimes(2);
    expect(renderer.destroy).toHaveBeenCalledTimes(1);
  });

  it('supports navigation without renderer', () => {
    const controller = createReplayController(makeReplay());

    expect(controller.getFrame().index).toBe(0);
    expect(controller.next()?.index).toBe(1);
    expect(controller.previous()?.index).toBe(0);
    expect(controller.seek(2)?.index).toBe(2);
  });
});
