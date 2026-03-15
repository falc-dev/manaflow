import { defineComponent, h, type PropType } from 'vue';

export interface ReplayOnboardingLegendItem {
  id: string;
  label: string;
  tone?: 'battlefield' | 'rune' | 'unit' | 'spell' | 'control-blue' | 'control-red' | 'neutral';
}

export interface ReplayOnboardingLegendProps {
  title?: string;
  description?: string;
  items: ReplayOnboardingLegendItem[];
  onDismiss?: () => void;
  className?: string;
}

export const ReplayOnboardingLegend = defineComponent({
  name: 'ReplayOnboardingLegend',
  props: {
    title: { type: String, default: 'Board guide' },
    description: { type: String, default: 'Quick legend for first-time users.' },
    items: { type: Array as PropType<ReplayOnboardingLegendItem[]>, required: true },
    onDismiss: { type: Function as PropType<() => void>, default: undefined },
    className: { type: String, default: undefined }
  },
  setup(props) {
    const getChipClass = (tone?: string) => {
      const classes = ['replay-onboarding-legend__chip'];
      if (tone) {
        classes.push(`replay-onboarding-legend__chip--tone-${tone}`);
      }
      return classes.join(' ');
    };

    return () =>
      h(
        'div',
        { class: ['replay-onboarding-legend', props.className].filter(Boolean).join(' ') },
        [
          h('div', { class: 'replay-onboarding-legend__header' }, [
            props.title ? h('h3', { class: 'replay-onboarding-legend__title' }, props.title) : null,
            props.description ? h('p', { class: 'replay-onboarding-legend__description' }, props.description) : null,
            props.onDismiss
              ? h('button', { class: 'replay-onboarding-legend__dismiss', onClick: props.onDismiss }, 'Dismiss')
              : null
          ]),
          h(
            'ul',
            { class: 'replay-onboarding-legend__list' },
            props.items.map((item) =>
              h('li', { key: item.id, class: 'replay-onboarding-legend__item' }, [
                h('span', { class: getChipClass(item.tone) }, item.label)
              ])
            )
          )
        ].filter(Boolean)
      );
  }
});
