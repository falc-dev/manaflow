import { ReplayBootstrapBoundary, ReplayPlayer } from '@manaflow/react';
import { useDemoReplay } from '../hooks/use-demo-replay';
import { RIFTBOUND_TUTORIAL_ZONES } from './riftbound-zones';

export function Example01BasicControls() {
  const replay = useDemoReplay('/replay.demo.json');

  return (
    <ReplayBootstrapBoundary
      loading={replay.loading}
      error={replay.error}
      validationIssues={replay.validationIssues}
      store={replay.store}
    >
      {(store) => (
        <section className="demo-example">
          <h2 className="demo-example__title">01. Basic ReplayPlayer</h2>
          <p className="demo-example__description">Minimum integration: bootstrap a store from JSON and mount `ReplayPlayer`.</p>
          <ReplayPlayer
            store={store}
            zones={RIFTBOUND_TUTORIAL_ZONES}
            playbackRateOptions={[0.5, 1, 2]}
          />
        </section>
      )}
    </ReplayBootstrapBoundary>
  );
}
