import { describe, expect, it } from 'vitest';
import { ReactElement } from 'react';
import { ReactReplayState } from './store';
import { ReplayViewport } from './components/replay-viewport';

const mockedState: ReactReplayState = {
  frame: {
    index: 0,
    snapshot: {
      id: 'game_1',
      players: [],
      currentPhase: 'DRAW',
      currentPlayer: 'p1',
      turn: 1,
      entities: {},
      zones: { deck: ['card_1'], hand: ['card_2'], board: [], graveyard: [], stack: [] },
      metadata: { rulesProfile: 'test-v1' }
    }
  },
  currentFrame: 0,
  totalFrames: 2,
  canStepBack: false,
  canStepForward: true
};

function readCardElements(element: ReactElement): ReactElement[] {
  const viewportChildren = element.props.children as unknown[];
  const zones = (Array.isArray(viewportChildren[1]) ? viewportChildren[1] : []) as ReactElement[];
  const handZone = zones.find((zone) => zone.props.className.includes('replay-player__zone--hand'));
  const handChildren = handZone?.props.children as unknown[];
  const rail = handChildren?.[1] as ReactElement | undefined;
  return (Array.isArray(rail?.props.children) ? rail.props.children : []) as ReactElement[];
}

describe('ReplayViewport view transitions', () => {
  it('sets a stable viewTransitionName for each card by default', () => {
    const element = ReplayViewport({
      state: mockedState
    });

    const [card] = readCardElements(element);
    expect(card.props.style.viewTransitionName).toBe('replay-card-card_2');
  });

  it('can disable view transition names', () => {
    const element = ReplayViewport({
      state: mockedState,
      viewTransitions: false
    });

    const [card] = readCardElements(element);
    expect(card.props.style).toBeUndefined();
  });

  it('keeps the same viewTransitionName when a card moves between zones', () => {
    const handState: ReactReplayState = {
      ...mockedState,
      frame: {
        ...mockedState.frame,
        snapshot: {
          ...mockedState.frame.snapshot,
          zones: { deck: [], hand: ['card_2'], board: [], graveyard: [], stack: [] }
        }
      }
    };
    const boardState: ReactReplayState = {
      ...mockedState,
      frame: {
        ...mockedState.frame,
        snapshot: {
          ...mockedState.frame.snapshot,
          zones: { deck: [], hand: [], board: ['card_2'], graveyard: [], stack: [] }
        }
      }
    };

    const handElement = ReplayViewport({ state: handState });
    const [handCard] = readCardElements(handElement);
    expect(handCard.props.style.viewTransitionName).toBe('replay-card-card_2');

    const boardElement = ReplayViewport({ state: boardState });
    const boardChildren = boardElement.props.children as unknown[];
    const zones = (Array.isArray(boardChildren[1]) ? boardChildren[1] : []) as ReactElement[];
    const boardZone = zones.find((zone) => zone.props.className.includes('replay-player__zone--board'));
    const boardZoneChildren = boardZone?.props.children as unknown[];
    const boardRail = boardZoneChildren?.[1] as ReactElement | undefined;
    const boardCards = (Array.isArray(boardRail?.props.children) ? boardRail.props.children : []) as ReactElement[];
    const [boardCard] = boardCards;
    expect(boardCard.props.style.viewTransitionName).toBe('replay-card-card_2');
  });
});
