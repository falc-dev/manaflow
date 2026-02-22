import { GameSnapshot } from '@manaflow/types';
import { computed, defineComponent, h, ref, type PropType, watch } from 'vue';
import { useReplayStore } from '../use-replay-store';
import { VueReplayStore } from '../store';
import { ReplayControls } from './replay-controls';
import {
  ReplayViewport,
  ReplayViewportCardRenderContext,
  ReplayViewportZoneConfig,
  ReplayViewportZoneTitleRenderContext
} from './replay-viewport';

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const ReplayPlayer = defineComponent({
  name: 'ReplayPlayer',
  props: {
    store: {
      type: Object as PropType<VueReplayStore>,
      required: true
    },
    autoplayIntervalMs: {
      type: Number,
      required: false,
      default: 700
    },
    playing: {
      type: Boolean,
      required: false
    },
    defaultPlaying: {
      type: Boolean,
      required: false,
      default: false
    },
    onPlayingChange: {
      type: Function as PropType<(playing: boolean) => void>,
      required: false
    },
    className: {
      type: String,
      required: false
    },
    controlsClassName: {
      type: String,
      required: false
    },
    viewportClassName: {
      type: String,
      required: false
    },
    viewportCardClassName: {
      type: String,
      required: false
    },
    zones: {
      type: Array as PropType<ReplayViewportZoneConfig[]>,
      required: false
    },
    timelineFormatter: {
      type: Function as PropType<(snapshot: GameSnapshot) => string>,
      required: false
    }
  },
  emits: {
    playingChange: (_playing: boolean) => true
  },
  setup(props, { emit, slots }) {
    const state = useReplayStore(props.store);
    const uncontrolledPlaying = ref(props.defaultPlaying);
    const isControlled = computed(() => props.playing !== undefined);
    const playing = computed(() => (isControlled.value ? props.playing! : uncontrolledPlaying.value));

    const setPlaying = (nextPlaying: boolean) => {
      const previousPlaying = playing.value;

      if (!isControlled.value) {
        uncontrolledPlaying.value = nextPlaying;
      }

      if (nextPlaying !== previousPlaying) {
        props.onPlayingChange?.(nextPlaying);
        emit('playingChange', nextPlaying);
      }
    };

    watch(
      () => playing.value,
      (nextPlaying, _previousPlaying, onCleanup) => {
        if (!nextPlaying) {
          return;
        }

        if (!state.value.canStepForward && state.value.totalFrames > 1) {
          props.store.seek(0);
        }

        const timer = window.setInterval(() => {
          const next = props.store.next();
          if (!next) {
            setPlaying(false);
          }
        }, props.autoplayIntervalMs);

        onCleanup(() => {
          window.clearInterval(timer);
        });
      },
      { immediate: true }
    );

    return () =>
      h('div', { class: joinClassNames('replay-player', props.className) }, [
        h(ReplayControls, {
          className: props.controlsClassName,
          state: state.value,
          isPlaying: playing.value,
          onPrevious: () => props.store.previous(),
          onNext: () => props.store.next(),
          onTogglePlay: () => setPlaying(!playing.value),
          onSeek: (frame: number) => props.store.seek(frame)
        }),
        h(
          ReplayViewport,
          {
            className: props.viewportClassName,
            cardClassName: props.viewportCardClassName,
            state: state.value,
            zones: props.zones,
            timelineFormatter: props.timelineFormatter
          },
          {
            card: slots.card
              ? (context: ReplayViewportCardRenderContext) => slots.card?.(context)
              : undefined,
            zoneTitle: slots.zoneTitle
              ? (context: ReplayViewportZoneTitleRenderContext) => slots.zoneTitle?.(context)
              : undefined,
            timeline: slots.timeline
              ? (context: { snapshot: GameSnapshot; eventId?: string }) => slots.timeline?.(context)
              : undefined
          }
        )
      ]);
  }
});
