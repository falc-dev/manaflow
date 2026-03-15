import { computed, defineComponent, h, type PropType } from 'vue';
import { VueReplayState } from '../store';
import { ReplayTimelineMarker } from '../replay-markers';

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

interface TimelineItemProps {
  marker: ReplayTimelineMarker;
  isActive: boolean;
  framePrefix: string;
  onSeek: (frame: number) => void;
  renderMarker?: (context: { marker: ReplayTimelineMarker; isActive: boolean; state: VueReplayState }) => any;
  state: VueReplayState;
}

const TimelineItem = defineComponent<TimelineItemProps>({
  name: 'TimelineItem',
  props: {
    marker: { type: Object as PropType<ReplayTimelineMarker>, required: true },
    isActive: { type: Boolean, required: true },
    framePrefix: { type: String, required: true },
    onSeek: { type: Function as PropType<(frame: number) => void>, required: true },
    renderMarker: { type: Function as PropType<(context: any) => any>, default: undefined },
    state: { type: Object as PropType<VueReplayState>, required: true }
  },
  setup(props) {
    return () => {
      const handleClick = () => {
        props.onSeek(props.marker.frame);
      };

      const context = { marker: props.marker, isActive: props.isActive, state: props.state };

      return h(
        'button',
        {
          type: 'button',
          class: joinClassNames('replay-timeline__item', props.isActive ? 'replay-timeline__item--active' : undefined),
          onClick: handleClick,
          'aria-current': props.isActive ? 'step' : undefined,
          role: 'listitem'
        },
        props.renderMarker
          ? props.renderMarker(context)
          : [
              h('span', { class: 'replay-timeline__frame' }, `${props.framePrefix}${props.marker.frame + 1}`),
              h('span', { class: 'replay-timeline__label' }, props.marker.label)
            ]
      );
    };
  }
});

function getDefaultMarkers(totalFrames: number): ReplayTimelineMarker[] {
  return Array.from({ length: totalFrames }, (_, frame) => ({
    frame,
    label: frame === 0 ? 'Setup' : `Frame ${frame + 1}`,
    actionType: frame === 0 ? 'SETUP' : 'EVENT'
  }));
}

function getResolvedMarkers(markers: ReplayTimelineMarker[] | undefined, totalFrames: number): ReplayTimelineMarker[] {
  const source = markers ? [...markers] : getDefaultMarkers(totalFrames);
  const normalized = source
    .filter(
      (marker) =>
        Number.isInteger(marker.frame) &&
        marker.frame >= 0 &&
        marker.frame < totalFrames &&
        typeof marker.label === 'string' &&
        marker.label.length > 0
    )
    .sort((a, b) => a.frame - b.frame);

  return normalized.length > 0 ? normalized : getDefaultMarkers(totalFrames);
}

export const ReplayTimeline = defineComponent({
  name: 'ReplayTimeline',
  props: {
    state: { type: Object as PropType<VueReplayState>, required: true },
    onSeek: { type: Function as PropType<(frame: number) => void>, required: true },
    markers: { type: Array as PropType<ReplayTimelineMarker[]>, default: undefined },
    className: { type: String, default: undefined },
    ariaLabel: { type: String, default: 'Replay timeline' },
    framePrefix: { type: String, default: 'F' },
    renderMarker: {
      type: Function as PropType<(context: { marker: ReplayTimelineMarker; isActive: boolean; state: VueReplayState }) => any>,
      default: undefined
    }
  },
  setup(props) {
    const resolvedMarkers = computed(() => getResolvedMarkers(props.markers, props.state.totalFrames));

    return () =>
      h(
        'div',
        {
          class: joinClassNames('replay-timeline', props.className),
          role: 'list',
          'aria-label': props.ariaLabel
        },
        resolvedMarkers.value.map((marker) =>
          h(TimelineItem, {
            key: `${marker.frame}-${marker.actionType}`,
            marker,
            isActive: marker.frame === props.state.currentFrame,
            framePrefix: props.framePrefix,
            onSeek: props.onSeek,
            renderMarker: props.renderMarker,
            state: props.state
          })
        )
      );
  }
});

export type { ReplayTimelineMarker, ReplayMarkerInput, BuildReplayMarkersOptions } from '../replay-markers';
