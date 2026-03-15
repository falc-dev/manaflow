import { computed, defineComponent, h, type PropType } from 'vue';
import { VueReplayState } from '../store';
import { GameSnapshot, Card } from '@manaflow/types';

export interface ReplayPlayerFieldZoneConfig {
  id: string;
  title: string;
}

export interface ReplayPlayerFieldCardRenderContext {
  entityId: string;
  zoneId: string;
  card?: Card;
  snapshot: GameSnapshot;
  state: VueReplayState;
}

export interface ReplayPlayerFieldProps {
  state: VueReplayState;
  field: {
    id: string;
    name: string;
    hand: string[];
    deck: string[];
    discard: string[];
  };
  zones?: ReplayPlayerFieldZoneConfig[];
  className?: string;
  cardClassName?: string;
  timelineFormatter?: (snapshot: GameSnapshot) => string;
  renderCard?: (context: ReplayPlayerFieldCardRenderContext) => any;
  renderZoneTitle?: (context: { zone: ReplayPlayerFieldZoneConfig; entityIds: string[]; snapshot: GameSnapshot }) => any;
}

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const ReplayPlayerField = defineComponent({
  name: 'ReplayPlayerField',
  props: {
    state: { type: Object as PropType<VueReplayState>, required: true },
    field: {
      type: Object as PropType<ReplayPlayerFieldProps['field']>,
      required: true
    },
    zones: { type: Array as PropType<ReplayPlayerFieldZoneConfig[]>, default: () => [
      { id: 'hand', title: 'Hand' },
      { id: 'deck', title: 'Deck' },
      { id: 'discard', title: 'Discard' }
    ]},
    className: { type: String, default: undefined },
    cardClassName: { type: String, default: undefined },
    timelineFormatter: { type: Function as PropType<(snapshot: GameSnapshot) => string>, default: undefined },
    renderCard: {
      type: Function as PropType<(context: ReplayPlayerFieldCardRenderContext) => any>,
      default: undefined
    },
    renderZoneTitle: {
      type: Function as PropType<(context: { zone: ReplayPlayerFieldZoneConfig; entityIds: string[]; snapshot: GameSnapshot }) => any>,
      default: undefined
    }
  },
  setup(props) {
    const snapshot = computed(() => props.state.frame.snapshot);

    const getZoneEntities = (zoneId: string): string[] => {
      const field = props.field;
      switch (zoneId) {
        case 'hand':
          return field.hand;
        case 'deck':
          return field.deck;
        case 'discard':
          return field.discard;
        default:
          return snapshot.value.zones[`${zoneId}_${field.id}`] || [];
      }
    };

    const getCard = (entityId: string) => {
      const entity = snapshot.value.entities[entityId];
      if (!entity) return undefined;
      const cardComponent = entity.components.find((c) => c.componentType === 'CARD');
      return cardComponent?.metadata as Card | undefined;
    };

    const formatTimeline = computed(() => {
      if (props.timelineFormatter) {
        return props.timelineFormatter(snapshot.value);
      }
      return `Turn ${snapshot.value.turn} · ${snapshot.value.currentPhase}`;
    });

    return () =>
      h(
        'div',
        { class: joinClassNames('replay-player-field', props.className) },
        [
          h('div', { class: 'replay-player-field__header' }, [
            h('span', { class: 'replay-player-field__name' }, props.field.name),
            h('span', { class: 'replay-player-field__timeline' }, formatTimeline.value)
          ]),
          ...props.zones.map((zone) => {
            const entityIds = getZoneEntities(zone.id);
            return h(
              'div',
              { key: zone.id, class: 'replay-player-field__zone' },
              [
                h(
                  'div',
                  { class: 'replay-player-field__zone-title' },
                  props.renderZoneTitle
                    ? props.renderZoneTitle({ zone, entityIds, snapshot: snapshot.value })
                    : h('span', {}, `${zone.title} (${entityIds.length})`)
                ),
                h(
                  'div',
                  { class: 'replay-player-field__zone-rail' },
                  entityIds.map((entityId) => {
                    const card = getCard(entityId);
                    const context = { entityId, zoneId: zone.id, card, snapshot: snapshot.value, state: props.state };
                    return h(
                      'div',
                      { key: entityId, class: joinClassNames('replay-player-field__card', props.cardClassName) },
                      props.renderCard
                        ? props.renderCard(context)
                        : [h('span', {}, card?.name || entityId)]
                    );
                  })
                )
              ]
            );
          })
        ]
      );
  }
});
