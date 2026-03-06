import { ReplayTimeline, ReplayTimelineProps } from './replay-timeline';
import { useManaflowState, useManaflowStore } from '../manaflow-context';

export type ConnectedReplayTimelineProps = Omit<ReplayTimelineProps, 'state' | 'onSeek'> & {
  onSeek?: (frame: number) => void;
};

export function ConnectedReplayTimeline({ onSeek, ...props }: ConnectedReplayTimelineProps) {
  const store = useManaflowStore();
  const state = useManaflowState();

  return (
    <ReplayTimeline
      {...props}
      state={state}
      onSeek={onSeek ?? ((frame) => store.seek(frame))}
    />
  );
}
