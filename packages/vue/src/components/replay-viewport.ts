import { Card, GameSnapshot, ZoneId } from '@manaflow/types';
import { defineComponent, h, type PropType } from 'vue';
import { VueReplayState } from '../store';

export interface ReplayViewportZoneConfig {
  id: ZoneId;
  title: string;
}

export interface ReplayViewportCardRenderContext {
  entityId: string;
  snapshot: GameSnapshot;
  card: Card | undefined;
}

export interface ReplayViewportZoneTitleRenderContext {
  zone: ReplayViewportZoneConfig;
  snapshot: GameSnapshot;
  entityIds: string[];
}

export interface ReplayViewportTimelineRenderContext {
  snapshot: GameSnapshot;
  eventId?: string;
}

const DEFAULT_ZONES: ReplayViewportZoneConfig[] = [
  { id: 'hand', title: 'Hand' },
  { id: 'board', title: 'Board' },
  { id: 'graveyard', title: 'Graveyard' },
  { id: 'deck', title: 'Deck' },
  { id: 'stack', title: 'Stack' }
];

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function getCardMetadata(entityId: string, snapshot: GameSnapshot): Card | undefined {
  const entity = snapshot.entities[entityId];
  return entity?.components.find((component) => component.componentType === 'CARD')?.metadata as Card | undefined;
}

function defaultTimelineFormatter(snapshot: GameSnapshot): string {
  const phase = snapshot.metadata?.currentPhase ?? '';
  return `Turn ${snapshot.turn} · Phase ${phase} · Player ${snapshot.currentPlayer}`;
}

export const ReplayViewport = defineComponent({
  name: 'ReplayViewport',
  props: {
    state: {
      type: Object as PropType<VueReplayState>,
      required: true
    },
    zones: {
      type: Array as PropType<ReplayViewportZoneConfig[]>,
      required: false,
      default: () => DEFAULT_ZONES
    },
    timelineFormatter: {
      type: Function as PropType<(snapshot: GameSnapshot) => string>,
      required: false,
      default: defaultTimelineFormatter
    },
    className: {
      type: String,
      required: false
    },
    cardClassName: {
      type: String,
      required: false
    }
  },
  setup(props, { slots }) {
    return () => {
      const snapshot = props.state.frame.snapshot;
      const eventId = props.state.frame.event?.id;

      return h('div', { class: joinClassNames('replay-player__viewport', props.className) }, [
        h(
          'div',
          {
            class: joinClassNames('replay-player__timeline', eventId ? 'replay-player__timeline--highlighted' : undefined),
            role: 'status',
            'aria-live': 'polite',
            'data-manaflow-timeline': 'true'
          },
          slots.timeline
            ? slots.timeline({
                snapshot,
                eventId
              } satisfies ReplayViewportTimelineRenderContext)
            : props.timelineFormatter(snapshot)
        ),
        ...props.zones.map((zone) => {
          const entityIds = snapshot.zones[zone.id] ?? [];

          return h('div', { class: 'replay-player__zone', role: 'group', 'aria-label': zone.title }, [
            h(
              'div',
              { class: 'replay-player__zone-title' },
              slots.zoneTitle
                ? slots.zoneTitle({
                    zone,
                    snapshot,
                    entityIds
                  } satisfies ReplayViewportZoneTitleRenderContext)
                : zone.title
            ),
            h(
              'div',
              { class: 'replay-player__zone-rail', 'data-zone-id': zone.id },
              entityIds.map((entityId) => {
                const card = getCardMetadata(entityId, snapshot);
                return h(
                  'div',
                  {
                    class: joinClassNames('replay-player__card', props.cardClassName),
                    role: 'article'
                  },
                  slots.card
                    ? slots.card({
                        entityId,
                        snapshot,
                        card
                      } satisfies ReplayViewportCardRenderContext)
                    : [
                        h('div', { class: 'replay-player__card-name' }, card?.name ?? entityId),
                        h('div', { class: 'replay-player__card-cost' }, `Cost ${card?.cost ?? '-'}`)
                      ]
                );
              })
            )
          ]);
        })
      ]);
    };
  }
});
