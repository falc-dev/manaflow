import { describe, expect, it } from 'vitest';
import { ReplayOnboardingLegend } from './components/replay-onboarding-legend';

describe('ReplayOnboardingLegend', () => {
  it('renders title, description and chips', () => {
    const element = ReplayOnboardingLegend({
      title: 'Guide',
      description: 'Legend description',
      items: [
        { id: 'battlefield', label: 'Battlefields', tone: 'battlefield' },
        { id: 'runes', label: 'Runes', tone: 'rune' }
      ]
    });

    expect(element.props.className).toContain('replay-onboarding-legend');
    const children = element.props.children.filter(Boolean);
    expect(children).toHaveLength(3);
    expect(children[2].props.children).toHaveLength(2);
    expect(children[2].props.children[0].props.className).toContain('replay-onboarding-legend__chip--tone-battlefield');
  });

  it('renders dismiss button when onDismiss is provided', () => {
    const element = ReplayOnboardingLegend({
      items: [{ id: 'battlefield', label: 'Battlefields' }],
      onDismiss: () => undefined
    });

    const header = element.props.children[0];
    expect(header.props.children[1].props.className).toContain('replay-onboarding-legend__dismiss');
  });
});
