import { computed, defineComponent, h, type PropType } from 'vue';
import { VueReplayState } from '../store';
import { GameSnapshot, Card } from '@manaflow/types';
import { ReplayPlayerField, type ReplayPlayerFieldProps } from './replay-player-field';

export interface ReplayDuelLayoutSharedObjectiveProps {
  title?: string;
  zoneIds?: string[];
}

export interface ReplayDuelLayoutTableProps {
  zones?: { id: string; title: string }[];
}

export interface ReplayDuelLayoutProps {
  state: VueReplayState;
  fieldZoneMap?: Record<string, string[]>;
  sharedObjectiveProps?: ReplayDuelLayoutSharedObjectiveProps;
  tableProps?: ReplayDuelLayoutTableProps;
  className?: string;
  cardClassName?: string;
  timelineFormatter?: (snapshot: GameSnapshot) => string;
  renderCard?: (context: { entityId: string; zoneId: string; card?: Card; snapshot: GameSnapshot; state: VueReplayState }) => any;
  renderZoneTitle?: (context: { zone: { id: string; title: string }; entityIds: string[]; snapshot: GameSnapshot }) => any;
  playerFieldProps?: Partial<ReplayPlayerFieldProps>;
}

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function selectPlayerFields(snapshot: GameSnapshot, fieldZoneMap?: Record<string, string[]>) {
  const defaultMap: Record<string, string[]> = {
    hand: ['hand'],
    deck: ['deck'],
    discard: ['discard']
  };
  const zoneMap = fieldZoneMap || defaultMap;

  return snapshot.players.map((player) => ({
    id: player.id,
    name: player.name,
    hand: zoneMap.hand?.flatMap((z) => snapshot.zones[`${z}_${player.id}`] || player.hand || []) || player.hand || [],
    deck: zoneMap.deck?.flatMap((z) => snapshot.zones[`${z}_${player.id}`] || player.deck || []) || player.deck || [],
    discard: zoneMap.discard?.flatMap((z) => snapshot.zones[`${z}_${player.id}`] || player.discard || []) || player.discard || []
  }));
}

export const ReplayDuelLayout = defineComponent({
  name: 'ReplayDuelLayout',
  props: {
    state: { type: Object as PropType<VueReplayState>, required: true },
    fieldZoneMap: { type: Object as PropType<Record<string, string[]>>, default: undefined },
    sharedObjectiveProps: {
      type: Object as PropType<ReplayDuelLayoutSharedObjectiveProps>,
      default: () => ({ title: 'Objective', zoneIds: ['objective', 'board'] })
    },
    tableProps: {
      type: Object as PropType<ReplayDuelLayoutTableProps>,
      default: () => ({ zones: [{ id: 'stack', title: 'Stack' }] })
    },
    className: { type: String, default: undefined },
    cardClassName: { type: String, default: undefined },
    timelineFormatter: { type: Function as PropType<(snapshot: GameSnapshot) => string>, default: undefined },
    renderCard: {
      type: Function as PropType<(context: { entityId: string; zoneId: string; card?: Card; snapshot: GameSnapshot; state: VueReplayState }) => any>,
      default: undefined
    },
    renderZoneTitle: {
      type: Function as PropType<(context: { zone: { id: string; title: string }; entityIds: string[]; snapshot: GameSnapshot }) => any>,
      default: undefined
    },
    playerFieldProps: { type: Object as PropType<Partial<ReplayPlayerFieldProps>>, default: undefined }
  },
  setup(props) {
    const snapshot = computed(() => props.state.frame.snapshot);
    const fields = computed(() => selectPlayerFields(snapshot.value, props.fieldZoneMap));

    const getSharedObjectiveEntities = computed(() => {
      const zoneIds = props.sharedObjectiveProps?.zoneIds || ['objective', 'board'];
      return zoneIds.flatMap((z) => snapshot.value.zones[z] || []);
    });

    const getSharedObjectiveCard = (entityId: string) => {
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
        { class: joinClassNames('replay-duel-layout', props.className) },
        [
          fields.value.length > 0 &&
            h(
              ReplayPlayerField,
              {
                key: fields.value[0].id,
                state: props.state,
                field: fields.value[0],
                className: 'replay-duel-layout__field--top',
                cardClassName: props.cardClassName,
                timelineFormatter: props.timelineFormatter,
                renderCard: props.renderCard as any,
                renderZoneTitle: props.renderZoneTitle as any,
                ...props.playerFieldProps
              }
            ),
          h('div', { class: 'replay-duel-layout__center' }, [
            props.sharedObjectiveProps &&
              h('div', { class: 'replay-duel-layout__objective' }, [
                h('span', { class: 'replay-duel-layout__objective-title' }, props.sharedObjectiveProps.title || 'Objective'),
                h(
                  'div',
                  { class: 'replay-duel-layout__objective-rail' },
                  getSharedObjectiveEntities.value.map((entityId) => {
                    const card = getSharedObjectiveCard(entityId);
                    const context = { entityId, zoneId: 'objective', card, snapshot: snapshot.value, state: props.state };
                    return h(
                      'div',
                      { key: entityId, class: joinClassNames('replay-duel-layout__card', props.cardClassName) },
                      props.renderCard ? props.renderCard(context) : [h('span', {}, card?.name || entityId)]
                    );
                  })
                )
              ]),
            props.tableProps?.zones &&
              props.tableProps.zones.map((zone) => {
                const entityIds = snapshot.value.zones[zone.id] || [];
                return h('div', { key: zone.id, class: 'replay-duel-layout__zone' }, [
                  h(
                    'div',
                    { class: 'replay-duel-layout__zone-title' },
                    props.renderZoneTitle
                      ? props.renderZoneTitle({ zone, entityIds, snapshot: snapshot.value })
                      : h('span', {}, `${zone.title} (${entityIds.length})`)
                  ),
                  h(
                    'div',
                    { class: 'replay-duel-layout__zone-rail' },
                    entityIds.map((entityId) => {
                      const entity = snapshot.value.entities[entityId];
                      const card = entity?.components.find((c) => c.componentType === 'CARD')?.metadata as Card | undefined;
                      const context = { entityId, zoneId: zone.id, card, snapshot: snapshot.value, state: props.state };
                      return h(
                        'div',
                        { key: entityId, class: joinClassNames('replay-duel-layout__card', props.cardClassName) },
                        props.renderCard ? props.renderCard(context) : [h('span', {}, card?.name || entityId)]
                      );
                    })
                  )
                ]);
              })
          ]),
          fields.value.length > 1 &&
            h(
              ReplayPlayerField,
              {
                key: fields.value[1].id,
                state: props.state,
                field: fields.value[1],
                className: 'replay-duel-layout__field--bottom',
                cardClassName: props.cardClassName,
                timelineFormatter: props.timelineFormatter,
                renderCard: props.renderCard as any,
                renderZoneTitle: props.renderZoneTitle as any,
                ...props.playerFieldProps
              }
            )
        ].filter(Boolean)
      );
  }
});
