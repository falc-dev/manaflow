import { ReactNode } from 'react';
import { joinClassNames } from '../utils';

export interface ReplayOnboardingLegendItem {
  id: string;
  label: string;
  tone?: string;
  className?: string;
}

export interface ReplayOnboardingLegendRenderItemContext {
  item: ReplayOnboardingLegendItem;
}

export interface ReplayOnboardingLegendProps {
  title?: string;
  description?: string;
  items: ReplayOnboardingLegendItem[];
  className?: string;
  legendClassName?: string;
  dismissLabel?: string;
  onDismiss?: () => void;
  ariaLabel?: string;
  renderItem?: (context: ReplayOnboardingLegendRenderItemContext) => ReactNode;
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function ReplayOnboardingLegend({
  title = 'Board Guide',
  description,
  items,
  className,
  legendClassName,
  dismissLabel = 'Dismiss',
  onDismiss,
  ariaLabel = 'Replay onboarding legend',
  renderItem
}: ReplayOnboardingLegendProps) {
  return (
    <section className={joinClassNames('replay-onboarding-legend', className)} aria-label={ariaLabel}>
      <header className="replay-onboarding-legend__header">
        <h3 className="replay-onboarding-legend__title">{title}</h3>
        {onDismiss ? (
          <button type="button" className="replay-onboarding-legend__dismiss" onClick={onDismiss}>
            {dismissLabel}
          </button>
        ) : null}
      </header>

      {description ? <p className="replay-onboarding-legend__description">{description}</p> : null}

      <div className={joinClassNames('replay-onboarding-legend__legend', legendClassName)}>
        {items.map((item) => {
          const toneModifier = item.tone ? `replay-onboarding-legend__chip--tone-${normalizeToken(item.tone)}` : undefined;
          return (
            <span
              key={item.id}
              className={joinClassNames('replay-onboarding-legend__chip', toneModifier, item.className)}
            >
              {renderItem ? renderItem({ item }) : item.label}
            </span>
          );
        })}
      </div>
    </section>
  );
}
