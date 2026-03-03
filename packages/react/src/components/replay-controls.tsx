import { ReactReplayState } from '../store';

export interface ReplayControlsLabels {
  previous?: string;
  next?: string;
  play?: string;
  pause?: string;
  frameSlider?: string;
}

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
  labels?: ReplayControlsLabels;
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
  className,
  labels
}: ReplayControlsProps) {
  const previousLabel = labels?.previous ?? 'Previous frame';
  const nextLabel = labels?.next ?? 'Next frame';
  const playLabel = labels?.play ?? 'Play';
  const pauseLabel = labels?.pause ?? 'Pause';
  const frameSliderLabel = labels?.frameSlider ?? 'Replay frame';
  const frameValueText = `Frame ${state.currentFrame + 1} of ${state.totalFrames}`;

  return (
    <div className={joinClassNames('replay-player__controls', className)}>
      <button
        type="button"
        className="replay-player__button replay-player__button--prev"
        onClick={onPrevious}
        disabled={!state.canStepBack}
        aria-label={previousLabel}
      >
        Prev
      </button>
      <button
        type="button"
        className="replay-player__button replay-player__button--play"
        onClick={onTogglePlay}
        aria-label={isPlaying ? pauseLabel : playLabel}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        type="button"
        className="replay-player__button replay-player__button--next"
        onClick={onNext}
        disabled={!state.canStepForward}
        aria-label={nextLabel}
      >
        Next
      </button>
      {playbackRateOptions.map((rate) => {
        const isActive = Math.abs(rate - playbackRate) < 0.001;
        return (
          <button
            type="button"
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
        aria-label={frameSliderLabel}
        aria-valuetext={frameValueText}
        onChange={(event) => onSeek(Number(event.currentTarget.value))}
      />
      <span className="replay-player__frame" role="status" aria-live="polite">
        Frame {state.currentFrame + 1}/{state.totalFrames}
      </span>
    </div>
  );
}
