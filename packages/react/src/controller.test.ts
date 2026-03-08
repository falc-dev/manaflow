import { describe, expect, it, vi } from 'vitest';
import { ReplayEngine } from '@manaflow/core';
import { GameSnapshot, RendererAdapter, ReplayEvent } from '@manaflow/types';
import { createReactReplayController } from './controller';

function makeSnapshot(turn: number): GameSnapshot {
  return {
    id: 'game_1',
    players: [],
    currentPhase: 'DRAW',
    currentPlayer: 'p1',
    turn,
    entities: {},
    zones: { deck: [], hand: [], board: [], graveyard: [], stack: [] },
    metadata: { rulesProfile: 'test-v1' }
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
  replay.seek({ frame: 0 });
  return replay;
}

describe('createReactReplayController', () => {
  it('supports injecting a custom renderer adapter', () => {
    const renderer: RendererAdapter = {
      mount: vi.fn(),
      render: vi.fn(),
      highlight: vi.fn(),
      destroy: vi.fn()
    };
    const controller = createReactReplayController(makeReplay(), { renderer });
    const container = {} as HTMLElement;

    controller.render(container);
    controller.next();
    controller.destroy();

    expect(renderer.mount).toHaveBeenCalledTimes(1);
    expect(renderer.render).toHaveBeenCalledTimes(2);
    expect(renderer.highlight).toHaveBeenCalledTimes(2);
    expect(renderer.highlight).toHaveBeenLastCalledWith('e1');
    expect(renderer.destroy).toHaveBeenCalledTimes(1);
  });
});
