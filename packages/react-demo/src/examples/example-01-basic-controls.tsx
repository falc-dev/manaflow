import { ReplayPlayer } from '@manaflow/react';
import { useDemoReplay } from '../hooks/use-demo-replay';
import { RIFTBOUND_TUTORIAL_ZONES } from './riftbound-zones';

export function Example01BasicControls() {
  const { loading, errorMessage, validationIssues, store } = useDemoReplay('/replay.demo.json');

  if (errorMessage) {
    return (
      <section className="error" role="alert">
        <p>{errorMessage}</p>
        {validationIssues.length > 0 ? (
          <ul className="error__issues">
            {validationIssues.map((issue, index) => (
              <li key={`${issue.path}-${index}`}>
                {issue.path}: {issue.message}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    );
  }

  if (loading || !store) {
    return <p className="replay-player replay-player--loading">Loading replay...</p>;
  }

  return (
    <section className="demo-example">
      <h2 className="demo-example__title">01. Basic ReplayPlayer</h2>
      <p className="demo-example__description">Minimum integration: bootstrap a store from JSON and mount `ReplayPlayer`.</p>
      <ReplayPlayer
        store={store}
        zones={RIFTBOUND_TUTORIAL_ZONES}
        playbackRateOptions={[0.5, 1, 2]}
      />
    </section>
  );
}
