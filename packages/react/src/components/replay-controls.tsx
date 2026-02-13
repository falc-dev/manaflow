import { ReactReplayState } from '../store';

export interface ReplayControlsProps {
  state: ReactReplayState;
  isPlaying: boolean;
  onPrevious(): void;
  onNext(): void;
  onTogglePlay(): void;
  onSeek(frame: number): void;
  className?: string;
}

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function ReplayControls({
  state,
  isPlaying,
  onPrevious,
  onNext,
  onTogglePlay,
  onSeek,
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
