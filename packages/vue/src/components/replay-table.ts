import { computed, defineComponent, h, type PropType } from 'vue';
import { VueReplayState } from '../store';
import { GameSnapshot, Card } from '@manaflow/types';
import { ReplayPlayerField, type ReplayPlayerFieldProps, type ReplayPlayerFieldCardRenderContext } from './replay-player-field';

export interface ReplayTableZoneConfig {
  id: string;
  title: string;
}

export interface ReplayTableCardRenderContext {
  entityId: string;
  zoneId: string;
  card?: Card;
  snapshot: GameSnapshot;
  state: VueReplayState;
}

export interface ReplayTableProps {
  state: VueReplayState;
  zones?: ReplayTableZoneConfig[];
  className?: string;
  cardClassName?: string;
  timelineFormatter?: (snapshot: GameSnapshot) => string;
  renderCard?: (context: ReplayTableCardRenderContext) => any;
  renderZoneTitle?: (context: { zone: ReplayTableZoneConfig; entityIds: string[]; snapshot: GameSnapshot }) => any;
  playerFieldProps?: Partial<ReplayPlayerFieldProps>;
}

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function selectPlayerFields(snapshot: GameSnapshot) {
  return snapshot.players.map((player) => ({
    id: player.id,
    name: player.name,
    hand: player.hand || [],
    deck: player.deck || [],
    discard: player.discard || []
  }));
}

export const ReplayTable = defineComponent({
  name: 'ReplayTable',
  props: {
    state: { type: Object as PropType<VueReplayState>, required: true },
    zones: { type: Array as PropType<ReplayTableZoneConfig[]>, default: () => [] },
    className: { type: String, default: undefined },
    cardClassName: { type: String, default: undefined },
    timelineFormatter: { type: Function as PropType<(snapshot: GameSnapshot) => string>, default: undefined },
    renderCard: {
      type: Function as PropType<(context: ReplayTableCardRenderContext) => any>,
      default: undefined
    },
    renderZoneTitle: {
      type: Function as PropType<(context: { zone: ReplayTableZoneConfig; entityIds: string[]; snapshot: GameSnapshot }) => any>,
      default: undefined
    },
    playerFieldProps: { type: Object as PropType<Partial<ReplayPlayerFieldProps>>, default: undefined }
  },
  setup(props) {
    const fields = computed(() => selectPlayerFields(props.state.frame.snapshot));

    return () =>
      h(
        'div',
        { class: joinClassNames('replay-table', props.className) },
        fields.value.map((field, index) =>
          h(
            ReplayPlayerField,
            {
              key: field.id,
              state: props.state,
              field,
              className: index === 0 ? 'replay-table__field--top' : 'replay-table__field--bottom',
              cardClassName: props.cardClassName,
              timelineFormatter: props.timelineFormatter,
              renderCard: props.renderCard as any,
              renderZoneTitle: props.renderZoneTitle as any,
              ...props.playerFieldProps
            }
          )
        )
      );
  }
});
