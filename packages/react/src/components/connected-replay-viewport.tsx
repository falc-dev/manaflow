import { ReplayViewport, ReplayViewportProps } from './replay-viewport';
import { useManaflowState } from '../manaflow-context';

export type ConnectedReplayViewportProps = Omit<ReplayViewportProps, 'state'>;

export function ConnectedReplayViewport(props: ConnectedReplayViewportProps) {
  const state = useManaflowState();
  return <ReplayViewport {...props} state={state} />;
}
