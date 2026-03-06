import { ReactReplayStore, ReplayTimeline, ReplayTimelineMarker, ReplayViewport, useReplayStore } from '@manaflow/react';
import { useDemoReplay } from '../hooks/use-demo-replay';
import { useReplayPlayback } from '../hooks/use-replay-playback';
import { getActionGlyph, getActionTone } from '../replay-derived';
import { RIFTBOUND_TUTORIAL_ZONES } from './riftbound-zones';

function Example03Content({ store, frameMarkers }: { store: ReactReplayStore; frameMarkers: ReplayTimelineMarker[] }) {
  const state = useReplayStore(store);
  const { playing, setPlaying, playbackRate, setPlaybackRate } = useReplayPlayback(store);

  return (
    <section className="demo-example">
      <h2 className="demo-example__title">03. Timeline markers + autoplay</h2>
      <p className="demo-example__description">
        Add semantic markers and playback behavior while keeping state control in your app.
      </p>

      <div className="demo-example__controls">
        <button type="button" className="demo-example__button" onClick={() => setPlaying((value) => !value)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <label className="demo-example__rate">
          Speed
          <select value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value))}>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>
        </label>
      </div>

      <ReplayTimeline
        state={state}
        markers={frameMarkers}
        onSeek={(frame) => store.seek(frame)}
        className="demo-panel__timeline"
        renderMarker={({ marker, isActive }) => {
          const tone = getActionTone(marker.actionType);
          return (
            <div className={`demo-timeline-marker${isActive ? ' demo-timeline-marker--active' : ''}`}>
              <span className={`demo-timeline-marker__glyph demo-timeline-marker__glyph--${tone}`}>
                {getActionGlyph(marker.actionType)}
              </span>
              <span className="demo-timeline-marker__frame">F{marker.frame + 1}</span>
              <span className="demo-timeline-marker__label">{marker.label}</span>
            </div>
          );
        }}
      />

      <ReplayViewport
        state={state}
        zones={RIFTBOUND_TUTORIAL_ZONES}
      />

      <div className="demo-example__zones">
        <strong>Zones used in this setup:</strong> {RIFTBOUND_TUTORIAL_ZONES.map((zone) => zone.id).join(', ')}
      </div>
    </section>
  );
}

export function Example03TimelineMarkers() {
  const { loading, errorMessage, validationIssues, store, frameMarkers } = useDemoReplay('/replay.demo.json');

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

  return <Example03Content store={store} frameMarkers={frameMarkers} />;
}
