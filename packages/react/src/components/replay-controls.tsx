import { ReactReplayState } from '../store';

export interface ReplayControlsProps {
  state: ReactReplayState;
  isPlaying: boolean;
  playbackRate?: number;
  playbackRateOptions?: number[];
  onPrevious(): void;
  onNext(): void;
  onTogglePlay(): void;
  onSeek(frame: number): void;
  onPlaybackRateChange?(rate: number): void;
  className?: string;
}

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function ReplayControls({
  state,
  isPlaying,
  playbackRate = 1,
  playbackRateOptions = [],
  onPrevious,
  onNext,
  onTogglePlay,
  onSeek,
  onPlaybackRateChange,
  className
}: ReplayControlsProps) {
  return (
    <div className={joinClassNames('replay-player__controls', className)}>
      <button
        className="replay-player__button replay-player__button--prev"
        onClick={onPrevious}
        disabled={!state.canStepBack}
      >
        Prev
      </button>
      <button className="replay-player__button replay-player__button--play" onClick={onTogglePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        className="replay-player__button replay-player__button--next"
        onClick={onNext}
        disabled={!state.canStepForward}
      >
        Next
      </button>
      {playbackRateOptions.map((rate) => {
        const isActive = Math.abs(rate - playbackRate) < 0.001;
        return (
          <button
            key={rate}
            className={joinClassNames(
              'replay-player__button',
              'replay-player__button--rate',
              isActive ? 'replay-player__button--active' : undefined
            )}
            onClick={() => onPlaybackRateChange?.(rate)}
            disabled={!onPlaybackRateChange}
          >
            {rate}x
          </button>
        );
      })}
      <input
        className="replay-player__slider"
        type="range"
        min={0}
        max={Math.max(state.totalFrames - 1, 0)}
        step={1}
        value={state.currentFrame}
        onChange={(event) => onSeek(Number(event.currentTarget.value))}
      />
      <span className="replay-player__frame">
        Frame {state.currentFrame + 1}/{state.totalFrames}
      </span>
    </div>
  );
}
