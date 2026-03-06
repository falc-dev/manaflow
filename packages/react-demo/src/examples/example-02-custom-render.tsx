import {
  ConnectedReplayControls,
  ConnectedReplayViewport,
  ManaflowProvider,
  ReplayBootstrapBoundary
} from '@manaflow/react';
import { useDemoReplay } from '../hooks/use-demo-replay';
import { RIFTBOUND_TUTORIAL_ZONES } from './riftbound-zones';

export function Example02CustomRender() {
  const replay = useDemoReplay('/replay.demo.json');

  return (
    <ReplayBootstrapBoundary
      loading={replay.loading}
      error={replay.error}
      validationIssues={replay.validationIssues}
      store={replay.store}
    >
      {(store) => (
        <ManaflowProvider store={store}>
          <section className="demo-example">
            <h2 className="demo-example__title">02. Headless state + custom viewport</h2>
            <p className="demo-example__description">
              Use `ManaflowProvider` + connected components to reduce boilerplate while keeping custom render callbacks.
            </p>

            <ConnectedReplayControls playbackRateOptions={[0.5, 1, 2]} />

            <ConnectedReplayViewport
              zones={RIFTBOUND_TUTORIAL_ZONES}
              renderZoneTitle={({ zone, entityIds }) => (
                <span className="demo-zone-title">
                  {zone.title} <span className="demo-zone-title__count">{entityIds.length}</span>
                </span>
              )}
              renderCard={({ entityId, card }) => (
                <article className="demo-card demo-card--custom">
                  <div className="demo-card__name">{card?.name ?? entityId}</div>
                  <div className="demo-card__meta">Cost {card?.cost ?? '-'}</div>
                </article>
              )}
            />
          </section>
        </ManaflowProvider>
      )}
    </ReplayBootstrapBoundary>
  );
}
