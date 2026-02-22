import { defineComponent, h, type PropType } from 'vue';
import { VueReplayState } from '../store';

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const ReplayControls = defineComponent({
  name: 'ReplayControls',
  props: {
    state: {
      type: Object as PropType<VueReplayState>,
      required: true
    },
    isPlaying: {
      type: Boolean,
      required: true
    },
    className: {
      type: String,
      required: false
    },
    onPrevious: {
      type: Function as PropType<() => void>,
      required: false
    },
    onNext: {
      type: Function as PropType<() => void>,
      required: false
    },
    onTogglePlay: {
      type: Function as PropType<() => void>,
      required: false
    },
    onSeek: {
      type: Function as PropType<(frame: number) => void>,
      required: false
    }
  },
  emits: {
    previous: () => true,
    next: () => true,
    togglePlay: () => true,
    seek: (_frame: number) => true
  },
  setup(props, { emit }) {
    return () =>
      h('div', { class: joinClassNames('replay-player__controls', props.className) }, [
        h(
          'button',
          {
            class: 'replay-player__button replay-player__button--prev',
            disabled: !props.state.canStepBack,
            onClick: () => {
              props.onPrevious?.();
              emit('previous');
            }
          },
          'Prev'
        ),
        h(
          'button',
          {
            class: 'replay-player__button replay-player__button--play',
            onClick: () => {
              props.onTogglePlay?.();
              emit('togglePlay');
            }
          },
          props.isPlaying ? 'Pause' : 'Play'
        ),
        h(
          'button',
          {
            class: 'replay-player__button replay-player__button--next',
            disabled: !props.state.canStepForward,
            onClick: () => {
              props.onNext?.();
              emit('next');
            }
          },
          'Next'
        ),
        h('input', {
          class: 'replay-player__slider',
          type: 'range',
          min: 0,
          max: Math.max(props.state.totalFrames - 1, 0),
          step: 1,
          value: props.state.currentFrame,
          onInput: (event: Event) => {
            const frame = Number((event.target as HTMLInputElement).value);
            props.onSeek?.(frame);
            emit('seek', frame);
          }
        }),
        h('span', { class: 'replay-player__frame' }, `Frame ${props.state.currentFrame + 1}/${props.state.totalFrames}`)
      ]);
  }
});
