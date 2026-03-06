import { useManaflowStore } from '../manaflow-context';
import {
  useReplayPlaybackController,
  UseReplayPlaybackControllerOptions
} from '../use-replay-playback-controller';
import { ReplayControls, ReplayControlsProps } from './replay-controls';

export type ConnectedReplayControlsProps = Omit<
  ReplayControlsProps,
  | 'state'
  | 'isPlaying'
  | 'playbackRate'
  | 'onPrevious'
  | 'onNext'
  | 'onTogglePlay'
  | 'onSeek'
  | 'onPlaybackRateChange'
> &
  UseReplayPlaybackControllerOptions & {
    onPrevious?: () => void;
    onNext?: () => void;
    onTogglePlay?: () => void;
    onSeek?: (frame: number) => void;
  };

export function ConnectedReplayControls({
  onPrevious,
  onNext,
  onTogglePlay,
  onSeek,
  autoplayIntervalMs,
  playing,
  defaultPlaying,
  onPlayingChange,
  playbackRate,
  defaultPlaybackRate,
  onPlaybackRateChange,
  loop,
  loopRange,
  onReachEnd,
  ...props
}: ConnectedReplayControlsProps) {
  const store = useManaflowStore();
  const playback = useReplayPlaybackController(store, {
    autoplayIntervalMs,
    playing,
    defaultPlaying,
    onPlayingChange,
    playbackRate,
    defaultPlaybackRate,
    onPlaybackRateChange,
    loop,
    loopRange,
    onReachEnd
  });

  return (
    <ReplayControls
      {...props}
      state={playback.state}
      isPlaying={playback.playing}
      playbackRate={playback.playbackRate}
      onPrevious={onPrevious ?? (() => store.previous())}
      onNext={onNext ?? (() => store.next())}
      onTogglePlay={() => {
        onTogglePlay?.();
        playback.togglePlaying();
      }}
      onSeek={onSeek ?? ((frame) => store.seek(frame))}
      onPlaybackRateChange={(rate) => playback.setPlaybackRate(rate)}
    />
  );
}
