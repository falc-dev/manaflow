import {
  ConnectedReplayControls,
  ConnectedReplayTimeline,
  ConnectedReplayViewport,
  ManaflowProvider,
  ReplayBootstrapBoundary,
  ReplayTimelineMarker
} from '@manaflow/react';
import { useDemoReplay } from '../hooks/use-demo-replay';
import { getActionGlyph, getActionTone } from '../replay-derived';
import { RIFTBOUND_TUTORIAL_ZONES } from './riftbound-zones';

function Example03Content({ frameMarkers }: { frameMarkers: ReplayTimelineMarker[] }) {
  return (
    <section className="demo-example">
      <h2 className="demo-example__title">03. Timeline markers + autoplay</h2>
      <p className="demo-example__description">
        Add semantic markers and playback behavior while keeping state control in your app.
      </p>

      <ConnectedReplayControls playbackRateOptions={[0.5, 1, 2]} className="demo-panel__controls" />

      <ConnectedReplayTimeline
        markers={frameMarkers}
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

      <ConnectedReplayViewport zones={RIFTBOUND_TUTORIAL_ZONES} />

      <div className="demo-example__zones">
        <strong>Zones used in this setup:</strong> {RIFTBOUND_TUTORIAL_ZONES.map((zone) => zone.id).join(', ')}
      </div>
    </section>
  );
}

export function Example03TimelineMarkers() {
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
          <Example03Content frameMarkers={replay.frameMarkers} />
        </ManaflowProvider>
      )}
    </ReplayBootstrapBoundary>
  );
}
