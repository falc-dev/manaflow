import { ReactReplayStore, ReplayControls, ReplayViewport, useReplayStore } from '@manaflow/react';
import { useDemoReplay } from '../hooks/use-demo-replay';
import { useReplayPlayback } from '../hooks/use-replay-playback';
import { RIFTBOUND_TUTORIAL_ZONES } from './riftbound-zones';

function Example02Content({ store }: { store: ReactReplayStore }) {
  const state = useReplayStore(store);
  const { playing, setPlaying, playbackRate, setPlaybackRate } = useReplayPlayback(store);

  return (
    <section className="demo-example">
      <h2 className="demo-example__title">02. Headless state + custom viewport</h2>
      <p className="demo-example__description">
        Use `useReplayStore` for deterministic state reads and customize `ReplayViewport` rendering.
      </p>

      <ReplayControls
        state={state}
        isPlaying={playing}
        playbackRate={playbackRate}
        playbackRateOptions={[0.5, 1, 2]}
        onPrevious={() => store.previous()}
        onNext={() => store.next()}
        onTogglePlay={() => setPlaying((value) => !value)}
        onSeek={(frame) => store.seek(frame)}
        onPlaybackRateChange={(rate) => setPlaybackRate(rate)}
      />

      <ReplayViewport
        state={state}
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
  );
}

export function Example02CustomRender() {
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

  return <Example02Content store={store} />;
}
