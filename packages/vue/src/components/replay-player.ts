import { GameSnapshot, Card } from '@manaflow/types';
import { computed, defineComponent, h, ref, type PropType, watch } from 'vue';
import { useReplayStore } from '../use-replay-store';
import { VueReplayStore, VueReplayState } from '../store';
import { ReplayControls } from './replay-controls';
import { ReplayTimeline, ReplayTimelineMarker } from './replay-timeline';
import {
  ReplayViewport,
  ReplayViewportCardRenderContext,
  ReplayViewportZoneConfig,
  ReplayViewportZoneTitleRenderContext
} from './replay-viewport';

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export interface VueReplayPlayerProps {
  store: VueReplayStore;
  autoplayIntervalMs?: number;
  playbackRate?: number;
  defaultPlaybackRate?: number;
  playbackRateOptions?: number[];
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  onPlaybackRateChange?: (rate: number) => void;
  onFrameChange?: (state: VueReplayState) => void;
  onReachEnd?: (state: VueReplayState) => void;
  className?: string;
  controlsClassName?: string;
  timelineClassName?: string;
  viewportClassName?: string;
  viewportCardClassName?: string;
  viewportLayout?: 'stacked' | 'board';
  showTimeline?: boolean;
  timelinePosition?: 'beforeViewport' | 'afterViewport';
  timelineAriaLabel?: string;
  timelineFramePrefix?: string;
  timelineMarkers?: ReplayTimelineMarker[];
  renderTimelineMarker?: (context: { marker: ReplayTimelineMarker; isActive: boolean; state: VueReplayState }) => any;
  onTimelineSeek?: (frame: number) => void;
  zones?: ReplayViewportZoneConfig[];
  timelineFormatter?: (snapshot: GameSnapshot) => string;
  renderCard?: (context: ReplayViewportCardRenderContext) => any;
  renderZoneTitle?: (context: ReplayViewportZoneTitleRenderContext) => any;
  viewTransitions?: boolean;
}

export const ReplayPlayer = defineComponent({
  name: 'ReplayPlayer',
  props: {
    store: { type: Object as PropType<VueReplayStore>, required: true },
    autoplayIntervalMs: { type: Number, default: 700 },
    playbackRate: { type: Number, default: undefined },
    defaultPlaybackRate: { type: Number, default: 1 },
    playbackRateOptions: { type: Array as PropType<number[]>, default: () => [0.5, 1, 2] },
    playing: { type: Boolean, default: undefined },
    defaultPlaying: { type: Boolean, default: false },
    onPlayingChange: { type: Function as PropType<(playing: boolean) => void>, default: undefined },
    onPlaybackRateChange: { type: Function as PropType<(rate: number) => void>, default: undefined },
    onFrameChange: { type: Function as PropType<(state: VueReplayState) => void>, default: undefined },
    onReachEnd: { type: Function as PropType<(state: VueReplayState) => void>, default: undefined },
    className: { type: String, default: undefined },
    controlsClassName: { type: String, default: undefined },
    timelineClassName: { type: String, default: undefined },
    viewportClassName: { type: String, default: undefined },
    viewportCardClassName: { type: String, default: undefined },
    viewportLayout: { type: String as PropType<'stacked' | 'board'>, default: 'stacked' },
    showTimeline: { type: Boolean, default: false },
    timelinePosition: { type: String as PropType<'beforeViewport' | 'afterViewport'>, default: 'beforeViewport' },
    timelineAriaLabel: { type: String, default: 'Replay timeline' },
    timelineFramePrefix: { type: String, default: 'F' },
    timelineMarkers: { type: Array as PropType<ReplayTimelineMarker[]>, default: undefined },
    renderTimelineMarker: {
      type: Function as PropType<(context: { marker: ReplayTimelineMarker; isActive: boolean; state: VueReplayState }) => any>,
      default: undefined
    },
    onTimelineSeek: { type: Function as PropType<(frame: number) => void>, default: undefined },
    zones: { type: Array as PropType<ReplayViewportZoneConfig[]>, default: undefined },
    timelineFormatter: { type: Function as PropType<(snapshot: GameSnapshot) => string>, default: undefined },
    renderCard: {
      type: Function as PropType<(context: ReplayViewportCardRenderContext) => any>,
      default: undefined
    },
    renderZoneTitle: {
      type: Function as PropType<(context: ReplayViewportZoneTitleRenderContext) => any>,
      default: undefined
    },
    viewTransitions: { type: Boolean, default: true }
  },
  emits: ['playingChange', 'playbackRateChange', 'frameChange', 'reachEnd', 'timelineSeek'],
  setup(props, { emit, slots }) {
    const state = useReplayStore(props.store);
    const uncontrolledPlaying = ref(props.defaultPlaying);
    const isControlled = computed(() => props.playing !== undefined);
    const currentPlaybackRate = ref(props.playbackRate ?? props.defaultPlaybackRate);

    const playing = computed(() => (isControlled.value ? props.playing! : uncontrolledPlaying.value));
    const effectivePlaybackRate = computed(() => (props.playbackRate !== undefined ? props.playbackRate : currentPlaybackRate.value));

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

    const setPlaybackRate = (rate: number) => {
      currentPlaybackRate.value = rate;
      props.onPlaybackRateChange?.(rate);
      emit('playbackRateChange', rate);
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

        const interval = props.autoplayIntervalMs / effectivePlaybackRate.value;
        const timer = window.setInterval(() => {
          const next = props.store.next();
          if (!next) {
            setPlaying(false);
            props.onReachEnd?.(state.value);
            emit('reachEnd', state.value);
          }
        }, interval);

        onCleanup(() => {
          window.clearInterval(timer);
        });
      },
      { immediate: true }
    );

    watch(
      () => state.value,
      (newState) => {
        props.onFrameChange?.(newState);
        emit('frameChange', newState);
      },
      { deep: true }
    );

    const handleTimelineSeek = (frame: number) => {
      props.store.seek(frame);
      props.onTimelineSeek?.(frame);
      emit('timelineSeek', frame);
    };

    const handleSeek = (frame: number) => {
      props.store.seek(frame);
    };

    const renderTimeline = () => {
      if (!props.showTimeline) return null;
      return h(ReplayTimeline, {
        className: props.timelineClassName,
        state: state.value,
        markers: props.timelineMarkers,
        framePrefix: props.timelineFramePrefix,
        ariaLabel: props.timelineAriaLabel,
        renderMarker: props.renderTimelineMarker,
        onSeek: handleTimelineSeek
      });
    };

    const renderViewport = () =>
      h(ReplayViewport, {
        className: props.viewportClassName,
        cardClassName: props.viewportCardClassName,
        state: state.value,
        zones: props.zones,
        timelineFormatter: props.timelineFormatter,
        renderCard: props.renderCard,
        renderZoneTitle: props.renderZoneTitle
      });

    return () =>
      h('div', { class: joinClassNames('replay-player', props.className) }, [
        h(ReplayControls, {
          className: props.controlsClassName,
          state: state.value,
          isPlaying: playing.value,
          playbackRate: effectivePlaybackRate.value,
          playbackRateOptions: props.playbackRateOptions,
          onPrevious: () => props.store.previous(),
          onNext: () => props.store.next(),
          onTogglePlay: () => setPlaying(!playing.value),
          onSeek: handleSeek,
          onPlaybackRateChange: setPlaybackRate
        }),
        props.showTimeline && props.timelinePosition === 'beforeViewport' ? renderTimeline() : null,
        renderViewport(),
        props.showTimeline && props.timelinePosition === 'afterViewport' ? renderTimeline() : null
      ]);
  }
});
