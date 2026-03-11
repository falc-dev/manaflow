import { GameAction, GameSnapshot } from '@manaflow/types';

export type Reducer = (snapshot: GameSnapshot, action: GameAction) => GameSnapshot;

export const tcgReplayReducer: Reducer = (snapshot, action) => {
  const state = JSON.parse(JSON.stringify(snapshot)) as GameSnapshot;

  if (action.type === 'END_TURN') {
    const currentIndex = state.players.findIndex((player) => player.id === state.currentPlayer);
    const nextIndex = (currentIndex + 1) % state.players.length;
    state.currentPlayer = state.players[nextIndex]?.id ?? state.currentPlayer;
    state.turn += 1;
    state.currentPhase = 'DRAW';
  }

  return state;
};
